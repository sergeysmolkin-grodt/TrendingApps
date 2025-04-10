const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Reddit OAuth2 credentials
const REDDIT_CLIENT_ID = 'mU4-M3vgeIdX37lZhLLXrg';
const REDDIT_CLIENT_SECRET = 'LhqkAHyRepeQbpCbpdl4czLHs6n9Ng';
const REDDIT_USER_AGENT = 'TrendWhisperer/1.0';

// Initialize axios instance for Reddit API
const redditApi = axios.create({
  baseURL: 'https://oauth.reddit.com',
  headers: {
    'User-Agent': REDDIT_USER_AGENT
  }
});

let accessToken = null;
let tokenExpiration = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiration) {
    return accessToken;
  }

  try {
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        auth: {
          username: REDDIT_CLIENT_ID,
          password: REDDIT_CLIENT_SECRET
        },
        headers: {
          'User-Agent': REDDIT_USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    accessToken = response.data.access_token;
    tokenExpiration = Date.now() + (response.data.expires_in * 1000);
    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error.message);
    throw error;
  }
}

app.use(cors());
app.use(express.json());

// Root route handler
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Trend Whisperer Proxy Server',
    endpoints: {
      '/api/reddit/:subreddit': 'Get top posts from a subreddit',
      params: {
        limit: 'Number of posts to fetch (default: 100)',
        t: 'Time period (day, week, month, year, all)'
      }
    }
  });
});

// Middleware для логирования
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get('/api/reddit/:subreddit', async (req, res) => {
  const { subreddit } = req.params;
  const { limit = 100, t = 'day' } = req.query;
  
  console.log(`Fetching posts from r/${subreddit} with limit=${limit}, time=${t}`);
  
  try {
    const token = await getAccessToken();
    const response = await redditApi.get(
      `/r/${subreddit}/top`,
      {
        params: { limit, t },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.data || !response.data.data || !Array.isArray(response.data.data.children)) {
      throw new Error('Invalid response format from Reddit API');
    }
    
    console.log(`Successfully fetched ${response.data.data.children.length} posts from r/${subreddit}`);
    res.json(response.data);
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      stack: error.stack
    });
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Reddit API Error',
        message: error.response.data?.message || 'Unknown error',
        status: error.response.status,
        details: error.response.data
      });
    } else if (error.request) {
      res.status(500).json({
        error: 'Network Error',
        message: 'Could not reach Reddit servers',
        details: error.message
      });
    } else {
      res.status(500).json({
        error: 'Server Error',
        message: error.message,
        details: error.stack
      });
    }
  }
});

// Обработка несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'Route not found' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    details: err.stack
  });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 