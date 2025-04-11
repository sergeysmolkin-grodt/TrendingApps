# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pytrends.request import TrendReq
from datetime import datetime, timedelta
import pandas as pd
import time
import numpy as np
import requests
from bs4 import BeautifulSoup
import re
from collections import Counter
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from typing import List, Dict
import asyncio
import aiohttp
from urllib.parse import quote
import logging
import random
import os
from config import TIKTOK_API_KEY
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3003"],
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
        trends_list = trends.tolist()
        
        # Get historical data for each trend
        trends_with_history = []
        for keyword in trends_list:
            historical_data = get_historical_trend_data(keyword)
            
            # Get current interest value
            current_interest = historical_data[keyword].iloc[-1] if not historical_data.empty else 0
            
            # Calculate trend significance
            significance = calculate_trend_significance(current_interest, historical_data)
            
            trends_with_history.append({
                "keyword": keyword,
                "current_interest": current_interest,
                "historical_data": historical_data.to_dict() if not historical_data.empty else {},
                "significance_score": significance
            })
        
        return {"trends": trends_with_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trends/interest/{keyword}")
async def get_interest_over_time(keyword: str, timeframe: str = 'today 7-d'):
    try:
        pytrends.build_payload([keyword], timeframe=timeframe)
        interest_over_time_df = pytrends.interest_over_time()
        return interest_over_time_df.to_dict()
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
        return related_queries[keyword]['top'].to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TikTokScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': 'https://www.tiktok.com/',
            'Origin': 'https://www.tiktok.com',
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'Authorization': f'Bearer {TIKTOK_API_KEY}',
            'Content-Type': 'application/json'
        }
        self.base_url = "https://open.tiktokapis.com/v2"
        self.session = aiohttp.ClientSession(headers=self.headers)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.session.close()

    async def fetch_trending_hashtags(self) -> List[Dict]:
        """Получение трендовых хештегов"""
        try:
            url = f"{self.base_url}/hashtag/trending/"
            
            params = {
                'region': 'US',
                'limit': 30
            }
            
            async with self.session.get(url, params=params) as response:
                logger.info(f"TikTok API Response Status: {response.status}")
                response_text = await response.text()
                logger.info(f"TikTok API Response: {response_text[:500]}")
                
                if response.status != 200:
                    logger.error(f"Error fetching trending hashtags: {response.status}")
                    raise HTTPException(status_code=response.status, detail=f"TikTok API returned status {response.status}")
                
                data = await response.json()
                logger.info(f"Response data structure: {list(data.keys()) if data else 'Empty response'}")
                
                if not data or 'data' not in data:
                    raise HTTPException(status_code=404, detail="No trending hashtags found")
                
                challenges = data['data']
                result = [
                    {
                        'id': str(challenge.get('id')),
                        'title': challenge.get('title'),
                        'views': challenge.get('view_count', 0),
                        'video_count': challenge.get('video_count', 0),
                        'desc': challenge.get('desc', '')
                    }
                    for challenge in challenges
                    if challenge
                ]
                
                if not result:
                    raise HTTPException(status_code=404, detail="No valid challenges found in response")
                
                logger.info(f"Successfully parsed {len(result)} challenges")
                return result
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching trending hashtags: {str(e)}")
            logger.exception("Full traceback:")
            raise HTTPException(status_code=500, detail=f"Failed to fetch TikTok data: {str(e)}")

    async def fetch_hashtag_details(self, hashtag_id: str) -> Dict:
        """Получение детальной информации о хештеге"""
        try:
            url = f"{self.base_url}/hashtag/detail/"
            
            params = {
                'hashtag_id': hashtag_id
            }
            
            async with self.session.get(url, params=params) as response:
                if response.status != 200:
                    raise HTTPException(status_code=response.status, detail=f"TikTok API returned status {response.status}")
                
                data = await response.json()
                if not data or 'data' not in data:
                    raise HTTPException(status_code=404, detail="Hashtag details not found")
                
                return data['data']
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching hashtag details: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch hashtag details: {str(e)}")

    async def fetch_trending_videos(self, hashtag_id: str = None) -> List[Dict]:
        """Получение трендовых видео"""
        try:
            url = f"{self.base_url}/video/trending/"
            
            params = {
                'region': 'US',
                'limit': 30
            }
            
            if hashtag_id:
                params['hashtag_id'] = hashtag_id
            
            async with self.session.get(url, params=params) as response:
                if response.status != 200:
                    raise HTTPException(status_code=response.status, detail=f"TikTok API returned status {response.status}")
                
                data = await response.json()
                if not data or 'data' not in data:
                    raise HTTPException(status_code=404, detail="No trending videos found")
                
                return data['data']
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error fetching trending videos: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to fetch trending videos: {str(e)}")

@app.get("/api/tiktok/trends/all")
async def get_all_tiktok_trends():
    try:
        logger.info("Fetching TikTok trends data...")
        
        async with TikTokScraper() as scraper:
            # Получаем трендовые хештеги
            trending_hashtags = await scraper.fetch_trending_hashtags()
            logger.info(f"Found {len(trending_hashtags)} trending hashtags")
            
            # Получаем видео для каждого хештега
            all_videos = []
            hashtag_stats = {}
            
            for hashtag in trending_hashtags[:5]:
                hashtag_name = hashtag['title']
                videos = await scraper.fetch_trending_videos(hashtag['id'])
                all_videos.extend(videos)
                
                # Анализируем видео для каждого хештега
                hashtag_stats[hashtag_name] = {
                    'total_engagement': sum(video['stats'].get('play_count', 0) for video in videos),
                    'average_views': sum(video['stats'].get('play_count', 0) for video in videos) / len(videos) if videos else 0,
                    'viral_videos': len([v for v in videos if v['stats'].get('play_count', 0) > 1000000])
                }
                logger.info(f"Analyzed {len(videos)} videos for hashtag {hashtag_name}")

            # Общий анализ всех видео
            overall_stats = {
                'average_engagement_rate': sum(video['stats'].get('play_count', 0) for video in all_videos) / len(all_videos) if all_videos else 0,
                'viral_videos': len([v for v in all_videos if v['stats'].get('play_count', 0) > 1000000])
            }
            
            # Группируем данные по времени публикации
            time_distribution = {'morning': 0, 'afternoon': 0, 'evening': 0, 'night': 0}
            for video in all_videos:
                hour = datetime.fromtimestamp(video['create_time']).hour
                if 6 <= hour < 12:
                    time_distribution['morning'] += 1
                elif 12 <= hour < 18:
                    time_distribution['afternoon'] += 1
                elif 18 <= hour < 24:
                    time_distribution['evening'] += 1
                else:
                    time_distribution['night'] += 1

            response_data = {
                "trending_categories": {
                    "labels": list(hashtag_stats.keys()),
                    "data": [stats['total_engagement'] for stats in hashtag_stats.values()]
                },
                "growth_rate": {
                    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                    "datasets": [
                        {
                            "label": hashtag,
                            "data": [stats['average_views']] * 7
                        }
                        for hashtag, stats in hashtag_stats.items()
                    ]
                },
                "engagement": {
                    "labels": ["Likes", "Comments", "Shares", "Saves"],
                    "data": [
                        sum(video['stats'].get('like_count', 0) for video in all_videos),
                        sum(video['stats'].get('comment_count', 0) for video in all_videos),
                        sum(video['stats'].get('share_count', 0) for video in all_videos),
                        sum(video['stats'].get('collect_count', 0) for video in all_videos)
                    ]
                },
                "top_content": [
                    {
                        "rank": idx + 1,
                        "title": video.get('desc', 'No description'),
                        "views": f"{video['stats'].get('play_count', 0):,}",
                        "likes": f"{video['stats'].get('like_count', 0):,}",
                        "shares": f"{video['stats'].get('share_count', 0):,}"
                    }
                    for idx, video in enumerate(sorted(
                        all_videos,
                        key=lambda x: x['stats'].get('play_count', 0),
                        reverse=True
                    )[:5])
                ],
                "stats": {
                    "engagement_rate": {
                        "value": f"{overall_stats['average_engagement_rate']:.1f}%",
                        "change": "0%"
                    },
                    "viral_potential": {
                        "score": min(overall_stats['viral_videos'] * 20, 100),
                        "status": "High potential for growth" if overall_stats['viral_videos'] > 2 else "Medium potential"
                    },
                    "content_saturation": {
                        "level": "High" if len(all_videos) > 1000 else "Medium",
                        "description": "Competitive market" if len(all_videos) > 1000 else "Room for growth"
                    },
                    "monetization_potential": {
                        "level": "High" if overall_stats['average_engagement_rate'] > 100000 else "Medium",
                        "description": "Strong monetization potential" if overall_stats['average_engagement_rate'] > 100000 else "Growing potential"
                    }
                },
                "audience": {
                    "peak_activity_times": [
                        {"time": "6AM-12PM", "percentage": time_distribution['morning']},
                        {"time": "12PM-6PM", "percentage": time_distribution['afternoon']},
                        {"time": "6PM-12AM", "percentage": time_distribution['evening']},
                        {"time": "12AM-6AM", "percentage": time_distribution['night']}
                    ]
                }
            }
            
            logger.info("Successfully prepared TikTok trends response")
            return response_data
            
    except Exception as e:
        logger.error(f"Error in get_all_tiktok_trends: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)