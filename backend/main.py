# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pytrends.request import TrendReq
from datetime import datetime, timedelta
import pandas as pd
import time

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize pytrends
pytrends = TrendReq(hl='en-US', tz=360)

def get_trends_with_retry(max_retries=3):
    for attempt in range(max_retries):
        try:
            return pytrends.trending_searches(pn='united_states')
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            time.sleep(2 ** attempt)  # Exponential backoff

def get_historical_trend_data(keyword, days=30):
    try:
        # Get data for the last 30 days
        timeframe = f'today {days}-d'
        pytrends.build_payload([keyword], timeframe=timeframe)
        historical_data = pytrends.interest_over_time()
        return historical_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_trend_significance(current_value, historical_data):
    if historical_data.empty:
        return 0
    
    # Calculate mean and standard deviation of historical data
    mean = historical_data[keyword].mean()
    std = historical_data[keyword].std()
    
    if std == 0:
        return 0
    
    # Calculate z-score
    z_score = (current_value - mean) / std
    return z_score

@app.get("/api/trends/daily")
async def get_daily_trends():
    try:
        trends = get_trends_with_retry()
        return {"trends": trends.to_dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trends/interest/{keyword}")
async def get_interest_over_time(keyword: str, timeframe: str = 'today 7-d'):
    try:
        pytrends.build_payload([keyword], timeframe=timeframe)
        interest_over_time_df = pytrends.interest_over_time()
        
        result = []
        if not interest_over_time_df.empty:
            for date, row in interest_over_time_df.iterrows():
                result.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "value": int(row[keyword])
                })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trends/historical/{keyword}")
async def get_historical_trend(keyword: str, years: int = 5):
    try:
        # Формируем временной диапазон (например, 'today 5-y' для 5 лет)
        timeframe = f'today {years}-y'
        pytrends.build_payload([keyword], timeframe=timeframe)
        historical_data = pytrends.interest_over_time()
        
        # Преобразуем данные в более удобный формат
        if not historical_data.empty:
            data = {
                "dates": historical_data.index.strftime('%Y-%m-%d').tolist(),
                "values": historical_data[keyword].tolist(),
                "isPartial": historical_data['isPartial'].tolist()
            }
            return data
        else:
            return {"error": "No data available for this keyword"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trends/related/{keyword}")
async def get_related_queries(keyword: str):
    try:
        pytrends.build_payload([keyword])
        related_queries = pytrends.related_queries()
        
        result = []
        if keyword in related_queries and 'top' in related_queries[keyword]:
            df = related_queries[keyword]['top']
            if not df.empty:
                for _, row in df.iterrows():
                    result.append({
                        "query": row['query'],
                        "value": int(row['value'])
                    })
                    
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trends/rising/{keyword}")
async def get_rising_queries(keyword: str):
    try:
        pytrends.build_payload([keyword])
        related_queries = pytrends.related_queries()
        
        result = []
        if keyword in related_queries and 'rising' in related_queries[keyword]:
            df = related_queries[keyword]['rising']
            if not df.empty:
                for _, row in df.iterrows():
                    result.append({
                        "query": row['query'],
                        "value": str(row['value'])  # Rising values can be "Breakout"
                    })
                    
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trends/categories")
async def get_trending_by_category(category: str = "all"):
    try:
        # Map UI categories to Google Trends categories
        category_map = {
            "technology": "t",
            "health": "h",
            "education": "q",
            "finance": "b",
            "lifestyle": "l",
            "entertainment": "e",
            "sports": "s",
            "science": "t"
        }
        
        # Default to all if category not found
        google_category = category_map.get(category.lower(), "all")
        
        if google_category != "all":
            trending = pytrends.trending_searches(pn="united_states", cat=google_category)
        else:
            trending = pytrends.trending_searches(pn="united_states")
            
        return trending.head(20).to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("requests.js:1 
 GET http://localhost:3000/api/dailytrends?geo=US 500 (Internal Server Error)
googleTrendsService.ts:82 Error fetching daily trends: 
AxiosError {message: 'Request failed with status code 500', name: 'AxiosError', code: 'ERR_BAD_RESPONSE', config: {…}, request: XMLHttpRequest, …}
getDailyTrendingSearches	@	googleTrendsService.ts:82
await in getDailyTrendingSearches		
startAnalysis	@	GoogleTrendsAnalyzer.tsx:67
")
async def compare_trends(keyword1: str, keyword2: str, timeframe: str = "today 12-m"):
    """Сравнение двух трендов в Google Trends"""
    try:
        # Инициализация pytrends
        pytrends = TrendReq(hl='en-US', tz=360)
        
        # Формирование запроса
        pytrends.build_payload(
            kw_list=[keyword1, keyword2],
            timeframe=timeframe,
            geo='US'
        )
        
        # Получение данных
        interest_over_time_df = pytrends.interest_over_time()
        
        if interest_over_time_df.empty:
            raise HTTPException(status_code=404, detail="No data found for the specified keywords")
        
        # Преобразование данных в нужный формат
        dates = interest_over_time_df.index.strftime('%Y-%m-%d').tolist()
        keyword1_data = interest_over_time_df[keyword1].tolist()
        keyword2_data = interest_over_time_df[keyword2].tolist()
        
        # Расчет статистики
        stats = {
            'keyword1': {
                'average': float(interest_over_time_df[keyword1].mean()),
                'max': float(interest_over_time_df[keyword1].max()),
                'min': float(interest_over_time_df[keyword1].min()),
                'current': float(interest_over_time_df[keyword1].iloc[-1])
            },
            'keyword2': {
                'average': float(interest_over_time_df[keyword2].mean()),
                'max': float(interest_over_time_df[keyword2].max()),
                'min': float(interest_over_time_df[keyword2].min()),
                'current': float(interest_over_time_df[keyword2].iloc[-1])
            },
            'correlation': float(interest_over_time_df[keyword1].corr(interest_over_time_df[keyword2]))
        }
        
        return {
            'labels': dates,
            'datasets': [
                {
                    'label': keyword1,
                    'data': keyword1_data,
                    'borderColor': 'rgb(75, 192, 192)',
                    'tension': 0.1
                },
                {
                    'label': keyword2,
                    'data': keyword2_data,
                    'borderColor': 'rgb(255, 99, 132)',
                    'tension': 0.1
                }
            ],
            'stats': stats
        }
        
    except Exception as e:
        logger.error(f"Error comparing trends: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
