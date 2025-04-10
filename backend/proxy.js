const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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
    const response = await axios.get(
      `https://www.reddit.com/r/${subreddit}/top.json`,
      {
        params: { limit, t },
        headers: {
          'User-Agent': 'TrendWhisperer/1.0',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log(`Successfully fetched ${response.data.data.children.length} posts from r/${subreddit}`);
    res.json(response.data);
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    if (error.response) {
      // Если Reddit API вернул ошибку
      res.status(error.response.status).json({
        error: 'Reddit API Error',
        message: error.response.data?.message || 'Unknown error',
        status: error.response.status
      });
    } else if (error.request) {
      // Если запрос не дошел до Reddit
      res.status(500).json({
        error: 'Network Error',
        message: 'Could not reach Reddit servers'
      });
    } else {
      // Другие ошибки
      res.status(500).json({
        error: 'Server Error',
        message: error.message
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
    message: 'An unexpected error occurred'
  });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 