
# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pytrends.request import TrendReq
from datetime import datetime, timedelta
import pandas as pd
import time
import json

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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

@app.get("/api/trends/daily")
async def get_daily_trends():
    try:
        trends_df = get_trends_with_retry()
        trends_list = []
        
        # Convert dataframe to list of dictionaries
        for idx, row in trends_df.iterrows():
            if idx < 20:  # Limit to top 20 trends
                trends_list.append({"title": row[0]})
                
        return {"trends": trends_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trends/interest/{keyword}")
async def get_interest_over_time(keyword: str):
    try:
        pytrends.build_payload([keyword], timeframe='today 7-d')
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
