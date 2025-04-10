import axios from 'axios';

interface RedditPost {
  id: string;
  title: string;
  score: number;
  num_comments: number;
  created_utc: number;
  subreddit: string;
  url: string;
  author: string;
  selftext: string;
}

interface TrendMetric {
  score: number;
  comments: number;
  growth: number;
  velocity: number;
}

interface Trend {
  keyword: string;
  metrics: TrendMetric;
  posts: RedditPost[];
  subreddits: string[];
  firstSeen: number;
  lastSeen: number;
}

interface RedditApiResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
  };
}

class RedditTrendAnalyzer {
  private static readonly BASE_URL = 'http://localhost:3002/api/reddit';
  private static readonly TRENDING_SUBREDDITS = [
    'technology',
    'programming',
    'startups',
    'webdev',
    'artificial',
    'MachineLearning',
    'gadgets',
    'appdev',
    'Entrepreneur'
  ];

  private static readonly MIN_SCORE_THRESHOLD = 100;
  private static readonly MIN_COMMENTS_THRESHOLD = 20;
  private static readonly TIME_WINDOW_HOURS = 24;

  private async fetchPosts(subreddit: string, limit: number = 100): Promise<RedditPost[]> {
    try {
      console.log(`Fetching posts from r/${subreddit}...`);
      const response = await axios.get<RedditApiResponse>(
        `${RedditTrendAnalyzer.BASE_URL}/${subreddit}`,
        { 
          params: { limit, t: 'day' },
          timeout: 10000 // 10 секунд таймаут
        }
      );
      
      if (!response.data?.data?.children) {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from Reddit API');
      }
      
      console.log(`Successfully fetched ${response.data.data.children.length} posts from r/${subreddit}`);
      return response.data.data.children.map(child => child.data);
    } catch (error: any) {
      console.error(`Error fetching posts from ${subreddit}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return [];
    }
  }

  private calculateTrendMetrics(posts: RedditPost[]): TrendMetric {
    const now = Date.now() / 1000;
    const timeWindow = RedditTrendAnalyzer.TIME_WINDOW_HOURS * 3600;

    const recentPosts = posts.filter(post => 
      (now - post.created_utc) < timeWindow
    );

    const score = recentPosts.reduce((sum, post) => sum + post.score, 0);
    const comments = recentPosts.reduce((sum, post) => sum + post.num_comments, 0);
    
    // Calculate growth rate (posts per hour)
    const growth = recentPosts.length / RedditTrendAnalyzer.TIME_WINDOW_HOURS;
    
    // Calculate velocity (rate of score increase)
    const velocity = recentPosts.reduce((sum, post) => {
      const age = (now - post.created_utc) / 3600; // hours
      return sum + (post.score / age);
    }, 0);

    return { score, comments, growth, velocity };
  }

  private extractKeywords(posts: RedditPost[]): Map<string, RedditPost[]> {
    const keywordMap = new Map<string, RedditPost[]>();
    
    posts.forEach(post => {
      // Extract keywords from title and selftext
      const text = `${post.title} ${post.selftext}`.toLowerCase();
      const words = text.split(/\s+/);
      
      // Filter out common words and short words
      const keywords = words.filter(word => 
        word.length > 3 && 
        !['the', 'and', 'for', 'with', 'this', 'that', 'are', 'was'].includes(word)
      );
      
      keywords.forEach(keyword => {
        if (!keywordMap.has(keyword)) {
          keywordMap.set(keyword, []);
        }
        keywordMap.get(keyword)?.push(post);
      });
    });
    
    return keywordMap;
  }

  private scoreTrend(keyword: string, posts: RedditPost[], metrics: TrendMetric): number {
    // Base score from metrics
    let score = metrics.score * 0.4 + 
                metrics.comments * 0.3 + 
                metrics.growth * 0.2 + 
                metrics.velocity * 0.1;

    // Bonus for multiple subreddits
    const subreddits = new Set(posts.map(post => post.subreddit));
    score *= (1 + (subreddits.size * 0.1));

    // Penalty for common words
    const commonWords = new Set(['new', 'best', 'top', 'first', 'latest']);
    if (commonWords.has(keyword)) {
      score *= 0.7;
    }

    return score;
  }

  public async analyzeTrends(): Promise<Trend[]> {
    const allPosts: RedditPost[] = [];
    
    // Fetch posts from trending subreddits
    for (const subreddit of RedditTrendAnalyzer.TRENDING_SUBREDDITS) {
      const posts = await this.fetchPosts(subreddit);
      allPosts.push(...posts);
    }

    // Extract keywords and group posts
    const keywordMap = this.extractKeywords(allPosts);
    
    // Analyze trends
    const trends: Trend[] = [];
    
    for (const [keyword, posts] of keywordMap) {
      if (posts.length < 3) continue; // Skip keywords with too few posts
      
      const metrics = this.calculateTrendMetrics(posts);
      
      // Apply thresholds
      if (metrics.score < RedditTrendAnalyzer.MIN_SCORE_THRESHOLD ||
          metrics.comments < RedditTrendAnalyzer.MIN_COMMENTS_THRESHOLD) {
        continue;
      }
      
      const score = this.scoreTrend(keyword, posts, metrics);
      
      trends.push({
        keyword,
        metrics,
        posts,
        subreddits: [...new Set(posts.map(post => post.subreddit))],
        firstSeen: Math.min(...posts.map(post => post.created_utc)),
        lastSeen: Math.max(...posts.map(post => post.created_utc))
      });
    }
    
    // Sort trends by score
    return trends.sort((a, b) => 
      this.scoreTrend(b.keyword, b.posts, b.metrics) - 
      this.scoreTrend(a.keyword, a.posts, a.metrics)
    );
  }
}

export const fetchRedditTrends = async (): Promise<Trend[]> => {
  const analyzer = new RedditTrendAnalyzer();
  return await analyzer.analyzeTrends();
}; 