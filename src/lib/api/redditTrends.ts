import axios from 'axios';
// import { validateTrend, ValidationResult } from './aiTrendValidator';
// import { analyzeWord } from './aiWordAnalyzer';
// import { analyzeProblem } from './aiProblemAnalyzer';
// import { openAILimiter } from './rateLimiter';
// import { analyzePattern } from './aiPatternAnalyzer';

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
  crossPostingScore: number;
  problemSolvingScore: number;
  uniquenessScore: number;
  monetizationPotential: number;
  patternScore: number;
}

interface Trend {
  keyword: string;
  metrics: TrendMetric;
  posts: RedditPost[];
  subreddits: string[];
  firstSeen: number;
  lastSeen: number;
  // validation?: ValidationResult;
  problemDescription?: string;
  targetAudience?: string[];
  monetizationIdeas?: string[];
  examples: {
    posts: string[];
    comments: string[];
  };
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
    'startups', 'Entrepreneur', 'technology', 'SaaS',
    'InternetIsBeautiful', 'edtech', 'healthtech',
    'growthhacking', 'digitalnomad', 'AItools',
    'productivity', 'freelance', 'smallbusiness',
    'webdev', 'programming', 'artificial',
    'MachineLearning', 'datascience', 'coding',
    'nocode', 'lowcode', 'automation',
    'remotework', 'sidehustle', 'passive_income'
  ];

  private static readonly PROBLEM_KEYWORDS = [
    'is there a tool for', 'how do you manage',
    'need help with', 'looking for solution',
    'problem with', 'frustrated with',
    'hate when', 'wish there was',
    'alternative to', 'better way to'
  ];

  private static readonly SOLUTION_KEYWORDS = [
    'I built this', 'I made a', 'launching',
    'created a tool', 'built a solution',
    'check out my', 'just released'
  ];

  private static readonly MIN_SCORE_THRESHOLD = 100;
  private static readonly MIN_COMMENTS_THRESHOLD = 25;
  private static readonly TIME_WINDOW_HOURS = 72;
  private static readonly MIN_WORD_LENGTH = 4;
  private static readonly MIN_TERM_FREQUENCY = 3;

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
    
    const growth = recentPosts.length / RedditTrendAnalyzer.TIME_WINDOW_HOURS;
    
    const velocity = recentPosts.reduce((sum, post) => {
      const age = (now - post.created_utc) / 3600;
      return sum + (post.score / age);
    }, 0);

    const uniqueSubreddits = new Set(posts.map(post => post.subreddit));
    const crossPostingScore = uniqueSubreddits.size / RedditTrendAnalyzer.TRENDING_SUBREDDITS.length;

    const problemSolvingScore = posts.reduce((score, post) => {
      const text = `${post.title} ${post.selftext}`.toLowerCase();
      const hasProblems = RedditTrendAnalyzer.PROBLEM_KEYWORDS.some(kw => text.includes(kw));
      const hasSolutions = RedditTrendAnalyzer.SOLUTION_KEYWORDS.some(kw => text.includes(kw));
      return score + (hasProblems ? 0.5 : 0) + (hasSolutions ? 0.5 : 0);
    }, 0) / posts.length;

    // const patternScore = posts.reduce((score, post) => {
    //   const text = `${post.title} ${post.selftext}`;
    //   const pattern = analyzePattern(text);
      
    //   let postScore = 0;
    //   if (pattern.stage === 'mixed') postScore = 1;
    //   else if (pattern.stage === 'idea') postScore = 0.8;
    //   else if (pattern.stage === 'request') postScore = 0.6;
    //   else if (pattern.stage === 'frustration') postScore = 0.4;
      
    //   return score + postScore;
    // }, 0) / posts.length;

    const patternScore = 0.5; // Default value without AI analysis

    const uniquenessScore = 0.8;
    const monetizationPotential = 0.7;

    return {
      score,
      comments,
      growth,
      velocity,
      crossPostingScore,
      problemSolvingScore,
      uniquenessScore,
      monetizationPotential,
      patternScore
    };
  }

  private async extractKeywords(posts: RedditPost[]): Promise<Map<string, RedditPost[]>> {
    const keywordMap = new Map<string, RedditPost[]>();
    const wordFrequency = new Map<string, number>();
    
    // First pass: count word frequencies
    for (const post of posts) {
      const text = `${post.title} ${post.selftext}`.toLowerCase();
      const words = text.split(/\b/)
        .map(word => word.replace(/[^a-z0-9]/g, ''))
        .filter(word => word.length >= RedditTrendAnalyzer.MIN_WORD_LENGTH);

      const uniqueWords = new Set(words);
      for (const word of uniqueWords) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }
    }

    // Filter words by frequency
    const wordsToAnalyze = Array.from(wordFrequency.entries())
      .filter(([_, freq]) => freq >= RedditTrendAnalyzer.MIN_TERM_FREQUENCY)
      .map(([word]) => word);

    // Add words to keyword map without AI analysis
    for (const word of wordsToAnalyze) {
      const relevantPosts = posts.filter(p => 
        `${p.title} ${p.selftext}`.toLowerCase().includes(word)
      );
      keywordMap.set(word, relevantPosts);
    }
    
    return keywordMap;
  }

  // private async analyzeProblemContext(posts: RedditPost[]): Promise<{
  //   problemDescription: string;
  //   targetAudience: string[];
  //   monetizationIdeas: string[];
  // }> {
  //   const analysis = await analyzeProblem(
  //     posts.map(post => ({
  //       title: post.title,
  //       text: post.selftext,
  //       subreddit: post.subreddit
  //     }))
  //   );

  //   return {
  //     problemDescription: analysis.problemDescription,
  //     targetAudience: analysis.targetAudience,
  //     monetizationIdeas: analysis.monetizationIdeas
  //   };
  // }

  private scoreTrend(keyword: string, posts: RedditPost[], metrics: TrendMetric): number {
    let score = metrics.score * 0.2 + 
                metrics.comments * 0.15 + 
                metrics.growth * 0.15 + 
                metrics.velocity * 0.15 +
                metrics.patternScore * 0.2 +
                metrics.problemSolvingScore * 0.15;

    const subreddits = new Set(posts.map(post => post.subreddit));
    score *= (1 + (subreddits.size * 0.1));

    const isUnusualTerm = !/^[a-z]+$/i.test(keyword) || keyword.length > 8;
    if (isUnusualTerm) {
      score *= 1.2;
    }

    return score;
  }

  public async analyzeTrends(): Promise<Trend[]> {
    const allPosts: RedditPost[] = [];
    
    for (const subreddit of RedditTrendAnalyzer.TRENDING_SUBREDDITS) {
      const posts = await this.fetchPosts(subreddit);
      allPosts.push(...posts);
    }

    const keywordMap = await this.extractKeywords(allPosts);
    const trends: Trend[] = [];
    
    for (const [keyword, posts] of keywordMap) {
      if (posts.length < 3) continue;
      
      const metrics = this.calculateTrendMetrics(posts);
      
      if (metrics.score < RedditTrendAnalyzer.MIN_SCORE_THRESHOLD ||
          metrics.comments < RedditTrendAnalyzer.MIN_COMMENTS_THRESHOLD) {
        continue;
      }

      // const validation = await validateTrend(keyword, posts.map(post => ({
      //   title: post.title,
      //   text: post.selftext
      // })));

      // if (validation.isValid) {
        // const problemAnalysis = await this.analyzeProblemContext(posts);

        trends.push({
          keyword,
          metrics,
          posts,
          subreddits: [...new Set(posts.map(post => post.subreddit))],
          firstSeen: Math.min(...posts.map(post => post.created_utc)),
          lastSeen: Math.max(...posts.map(post => post.created_utc)),
          // validation,
          // problemDescription: problemAnalysis.problemDescription,
          // targetAudience: problemAnalysis.targetAudience,
          // monetizationIdeas: problemAnalysis.monetizationIdeas,
          examples: {
            posts: posts.slice(0, 3).map(p => `${p.title}\n${p.selftext}`),
            comments: [] // TODO: Implement comment fetching
          }
        });
      // }
    }
    
    return trends.sort((a, b) => {
      const scoreA = this.scoreTrend(a.keyword, a.posts, a.metrics);
      const scoreB = this.scoreTrend(b.keyword, b.posts, b.metrics);
      return scoreB - scoreA;
    });
  }
}

export const fetchRedditTrends = async (): Promise<Trend[]> => {
  const analyzer = new RedditTrendAnalyzer();
  return await analyzer.analyzeTrends();
}; 