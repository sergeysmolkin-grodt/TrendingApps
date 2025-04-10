import React, { useState, useEffect } from 'react';
import { fetchRedditTrends } from '@/lib/api/redditTrends';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const RedditTrendTest = () => {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testRedditTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchRedditTrends();
      setTrends(results);
      console.log('Reddit Trends Results:', results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching Reddit trends:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Reddit Trends Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <button
            onClick={testRedditTrends}
            disabled={loading}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              'Test Reddit Trends'
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-100 text-red-800 rounded-lg">
              Error: {error}
            </div>
          )}

          {trends.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Found {trends.length} trends:</h3>
              {trends.map((trend, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{trend.keyword}</h4>
                    <Badge variant="outline">
                      {trend.metrics.score} points
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>Comments: {trend.metrics.comments}</div>
                    <div>Growth: {trend.metrics.growth.toFixed(2)}/hour</div>
                    <div>Velocity: {trend.metrics.velocity.toFixed(2)}</div>
                    <div>Subreddits: {trend.subreddits.length}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RedditTrendTest; 