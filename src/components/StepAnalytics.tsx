
import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { AnalyticsSection } from './AnalyticsSection';
import { Trend, RedditPost } from '../lib/api/redditTrends';

interface StepAnalyticsProps {
  step: number;
  trends: Trend[];
  posts: RedditPost[];
}

export const StepAnalytics: React.FC<StepAnalyticsProps> = ({ step, trends, posts }) => {
  const getStepAnalytics = () => {
    switch (step) {
      case 1:
        return {
          title: 'Subreddit Analysis',
          description: 'Distribution',
          metrics: [
            { label: 'Subreddits', value: new Set(posts.map(p => p.subreddit)).size },
            { label: 'Posts', value: posts.length }
          ],
          chartData: Array.from(new Set(posts.map(p => p.subreddit))).slice(0, 5).map(subreddit => ({
            name: subreddit,
            value: posts.filter(p => p.subreddit === subreddit).length
          }))
        };

      case 2:
        return {
          title: 'Trend Analysis',
          description: 'Top Trends',
          metrics: [
            { label: 'Trends', value: trends.length },
            { label: 'Avg Score', value: Math.round(trends.reduce((acc, t) => acc + t.metrics.score, 0) / trends.length) }
          ],
          chartData: trends.slice(0, 5).map(trend => ({
            name: trend.keyword,
            value: trend.metrics.score
          }))
        };

      case 3:
        return {
          title: 'Comment Analysis',
          description: 'Engagement',
          metrics: [
            { label: 'Comments', value: posts.reduce((acc, p) => acc + (p.comments?.length || 0), 0) },
            { label: 'Avg/Post', value: Math.round(posts.reduce((acc, p) => acc + (p.comments?.length || 0), 0) / posts.length) }
          ],
          chartData: posts.slice(0, 5).map(post => ({
            name: post.title.slice(0, 15) + '...',
            value: post.comments?.length || 0
          }))
        };

      case 4:
        const crossPosts = posts.filter(p => 
          posts.some(op => 
            op.id !== p.id && 
            op.title.toLowerCase() === p.title.toLowerCase()
          )
        );
        return {
          title: 'Cross-Posting',
          description: 'Distribution',
          metrics: [
            { label: 'Cross-Posts', value: crossPosts.length },
            { label: 'Unique', value: new Set(crossPosts.map(p => p.title)).size }
          ],
          chartData: Array.from(new Set(crossPosts.map(p => p.subreddit))).slice(0, 5).map(subreddit => ({
            name: subreddit,
            value: crossPosts.filter(p => p.subreddit === subreddit).length
          }))
        };

      case 5:
        const now = Date.now() / 1000;
        const timeRanges = trends.map(t => ({
          keyword: t.keyword,
          age: Math.round((now - t.firstSeen) / 3600)
        }));
        return {
          title: 'Historical',
          description: 'Timeline',
          metrics: [
            { label: 'Avg Age', value: Math.round(timeRanges.reduce((acc, t) => acc + t.age, 0) / timeRanges.length) + 'h' },
            { label: 'Active', value: timeRanges.filter(t => t.age < 24).length }
          ],
          chartData: timeRanges.slice(0, 5).map(trend => ({
            name: trend.keyword.slice(0, 15) + '...',
            value: trend.age
          }))
        };

      default:
        return null;
    }
  };

  const analytics = getStepAnalytics();
  if (!analytics) return null;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {analytics.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {analytics.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {analytics.metrics.map((metric, index) => (
            <Card key={index} variant="outlined" sx={{ p: 1, flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {metric.label}
              </Typography>
              <Typography variant="h6">
                {metric.value}
              </Typography>
            </Card>
          ))}
        </Box>
        <Box sx={{ height: 200 }}>
          <AnalyticsSection
            title={analytics.title}
            description={analytics.description}
            chartData={analytics.chartData}
            compact={true}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
