# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pytrends.request import TrendReq
from datetime import datetime, timedelta
import pandas as pd
import time

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализация pytrends
pytrends = TrendReq(hl='en-US', tz=360)

def get_trends_with_retry(max_retries=3):
    for attempt in range(max_retries):
        try:
            return pytrends.trending_searches(pn='united_states')
        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            time.sleep(2 ** attempt)  # Экспоненциальная задержка

@app.get("/api/trends/daily")
async def get_daily_trends():
    try:
        trends = get_trends_with_retry()
        return {"trends": trends.to_dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trends/interest/{keyword}")
async def get_interest_over_time(keyword: str):
    try:
        pytrends.build_payload([keyword], timeframe='today 7-d')
        interest_over_time_df = pytrends.interest_over_time()
        return interest_over_time_df.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trends/related/{keyword}")
async def get_related_queries(keyword: str):
    try:
        pytrends.build_payload([keyword])
        related_queries = pytrends.related_queries()
        return related_queries[keyword]['top'].to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)