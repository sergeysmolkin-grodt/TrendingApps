from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import praw
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Reddit API
reddit = praw.Reddit(
    client_id=os.getenv('REDDIT_CLIENT_ID'),
    client_secret=os.getenv('REDDIT_CLIENT_SECRET'),
    user_agent='TrendWhisperer/1.0'
)

@app.get("/api/trends")
async def get_trends():
    try:
        print("Starting Reddit trends analysis...")
        results = []
        
        # List of subreddits to monitor
        subreddits = ['startups', 'Entrepreneur', 'AppIdeas', 'sideproject', 'technology', 'AskReddit']
        
        for subreddit_name in subreddits:
            try:
                print(f"Fetching posts from r/{subreddit_name}...")
                subreddit = reddit.subreddit(subreddit_name)
                
                # Get top posts from the last 7 days
                for post in subreddit.top(time_filter='week', limit=10):
                    result = {
                        "query": post.title,
                        "traffic": post.score,
                        "date": datetime.fromtimestamp(post.created_utc).isoformat(),
                        "country": "Global",  # Reddit is global
                        "related_queries": [],
                        "related_topics": [],
                        "url": f"https://reddit.com{post.permalink}",
                        "subreddit": subreddit_name,
                        "num_comments": post.num_comments
                    }
                    results.append(result)
                    
            except Exception as e:
                print(f"Error fetching from r/{subreddit_name}: {str(e)}")
                continue
        
        if not results:
            raise HTTPException(status_code=404, detail="No trends data available")
            
        print(f"Successfully generated {len(results)} trend results")
        return results
        
    except Exception as e:
        print(f"Unexpected error in get_trends: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081) 