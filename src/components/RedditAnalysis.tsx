import React, { useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { fetchRedditTrends } from '../lib/api/redditTrends';
import { StepAnalytics } from './StepAnalytics';

const steps = [
  'Subreddit Analysis',
  'Trend Analysis',
  'Comment Analysis',
  'Cross-Posting Analysis',
  'Historical Analysis'
];

export const RedditAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await fetchRedditTrends();
      setTrends(result);
      setPosts(result.flatMap(t => t.posts));
    } catch (error) {
      console.error('Error analyzing Reddit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reddit Trend Analysis
      </Typography>

      <Button
        variant="contained"
        onClick={handleAnalyze}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Analyze Reddit'}
      </Button>

      {trends.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2,
          '& > *': {
            flexGrow: 1,
            flexBasis: {
              xs: '100%',
              md: 'calc(20% - 16px)'
            },
            minWidth: 250
          }
        }}>
          {steps.map((_, index) => (
            <Box
              key={index}
              sx={{ 
                height: '100%',
                animation: 'fadeIn 0.5s ease-in',
                backgroundColor: 'background.paper',
                borderRadius: 1,
                boxShadow: 1,
                p: 2
              }}
            >
              <StepAnalytics
                step={index + 1}
                trends={trends}
                posts={posts}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}; 