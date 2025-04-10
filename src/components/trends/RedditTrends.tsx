import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchRedditTrends } from '@/lib/api/redditTrends';
import { Skeleton } from '@/components/ui/skeleton';

interface RedditTrend {
  keyword: string;
  metrics: {
    score: number;
    comments: number;
    growth: number;
    velocity: number;
  };
  posts: Array<{
    title: string;
    score: number;
    num_comments: number;
    url: string;
    subreddit: string;
  }>;
}

export function RedditTrends() {
  const [trends, setTrends] = useState<RedditTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrends = async () => {
      try {
        const data = await fetchRedditTrends();
        setTrends(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Reddit trends');
      } finally {
        setLoading(false);
      }
    };

    loadTrends();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-[200px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {trends.map((trend) => (
        <Card key={trend.keyword}>
          <CardHeader>
            <CardTitle className="text-lg">#{trend.keyword}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Score: {trend.metrics.score}</span>
                <span>Comments: {trend.metrics.comments}</span>
                <span>Growth: {trend.metrics.growth.toFixed(2)}/hr</span>
              </div>
              <div className="space-y-1">
                {trend.posts.slice(0, 3).map((post) => (
                  <a
                    key={post.url}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:underline"
                  >
                    <div className="text-sm">
                      <span className="font-medium">r/{post.subreddit}</span>
                      <span className="mx-2">·</span>
                      <span>{post.title}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 