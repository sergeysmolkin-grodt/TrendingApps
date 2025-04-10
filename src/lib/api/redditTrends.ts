import axios from 'axios';
// import { validateTrend, ValidationResult } from './aiTrendValidator';
// import { analyzeWord } from './aiWordAnalyzer';
// import { analyzeProblem } from './aiProblemAnalyzer';
// import { openAILimiter } from './rateLimiter';
// import { analyzePattern } from './aiPatternAnalyzer';

interface RedditComment {
  id: string;
  body: string;
  score: number;
  created_utc: number;
  author: string;
  permalink: string;
}

interface CommentAnalysis {
  insights: string[];
  alternativeSolutions: string[];
  commonProblems: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
}

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
  comments?: RedditComment[];
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

interface RedditCommentResponse {
  data: {
    children: Array<{
      data: RedditComment;
    }>;
  };
}

interface CrossPostAnalysis {
  crossPosts: {
    title: string;
    subreddits: string[];
    score: number;
    firstSeen: number;
    lastSeen: number;
  }[];
  metrics: {
    totalCrossPosts: number;
    averageSubredditsPerPost: number;
    averageTimeBetweenPosts: number;
  };
}

interface HistoricalAnalysis {
  trends: {
    keyword: string;
    timeline: {
      time: number;
      score: number;
      comments: number;
    }[];
    metrics: {
      lifetime: number;
      peakScore: number;
      peakComments: number;
      growthRate: number;
    };
  }[];
}

interface SubredditSearchResponse {
  data: {
    children: Array<{
      data: {
        display_name: string;
        subscribers: number;
        over18: boolean;
      };
    }>;
  };
}

class RedditTrendAnalyzer {
  private static readonly BASE_URL = 'http://localhost:3002/api/reddit';
  
  private static readonly SUBREDDIT_DISCOVERY_KEYWORDS = [
    'tools', 'apps', 'ideas', 'problem', 'startup', 'hack',
    'saas', 'tech', 'software', 'automation', 'business',
    'product', 'indie', 'maker', 'entrepreneur'
  ];

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

  private static readonly EXCLUDED_SUBREDDITS = new Set([
    'gaming', 'funny', 'pics', 'videos', 'news',
    'worldnews', 'memes', 'askreddit', 'aww'
  ]);

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

  private static readonly COMMENT_PATTERNS = {
    problems: [
      'i hate when',
      'i wish there was',
      'the problem is',
      'the issue is',
      'it sucks that',
      'annoying when',
      'frustrated with',
      'tired of',
      'difficult to',
      'hard to'
    ],
    solutions: [
      'i use',
      'i built',
      'i created',
      'i made',
      'you can try',
      'check out',
      'look into',
      'consider using',
      'alternative is',
      'solution is'
    ],
    insights: [
      'actually',
      'in my experience',
      'from what i\'ve seen',
      'the key is',
      'what works best',
      'the real issue',
      'the main problem',
      'the biggest challenge',
      'most people don\'t realize',
      'the trick is'
    ]
  };

  private static readonly MIN_COMMENT_SCORE = 5;
  private static readonly MAX_COMMENTS_PER_POST = 50;

  private async fetchComments(postId: string, subreddit: string): Promise<RedditComment[]> {
    try {
      console.log(`Fetching comments for post ${postId} from r/${subreddit}...`);
      const response = await axios.get<RedditCommentResponse>(
        `${RedditTrendAnalyzer.BASE_URL}/r/${subreddit}/comments/${postId}`,
        { 
          params: { limit: RedditTrendAnalyzer.MAX_COMMENTS_PER_POST },
          timeout: 10000
        }
      );
      
      if (!response.data?.data?.children) {
        console.error('Unexpected response format for comments:', response.data);
        return [];
      }
      
      return response.data.data.children
        .map(child => child.data)
        .filter(comment => 
          comment.score >= RedditTrendAnalyzer.MIN_COMMENT_SCORE &&
          !comment.body.includes('[deleted]') &&
          !comment.body.includes('[removed]')
        );
    } catch (error: any) {
      console.error(`Error fetching comments for post ${postId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return [];
    }
  }

  private analyzeComments(comments: RedditComment[]): CommentAnalysis {
    const insights: string[] = [];
    const alternativeSolutions: string[] = [];
    const commonProblems: string[] = [];
    let positiveCount = 0;
    let negativeCount = 0;
    let totalScore = 0;

    comments.forEach(comment => {
      const lowerBody = comment.body.toLowerCase();
      
      // Analyze patterns
      RedditTrendAnalyzer.COMMENT_PATTERNS.insights.forEach(pattern => {
        if (lowerBody.includes(pattern)) {
          insights.push(comment.body);
        }
      });

      RedditTrendAnalyzer.COMMENT_PATTERNS.solutions.forEach(pattern => {
        if (lowerBody.includes(pattern)) {
          alternativeSolutions.push(comment.body);
        }
      });

      RedditTrendAnalyzer.COMMENT_PATTERNS.problems.forEach(pattern => {
        if (lowerBody.includes(pattern)) {
          commonProblems.push(comment.body);
        }
      });

      // Basic sentiment analysis
      if (comment.score > 10) positiveCount++;
      if (comment.score < 0) negativeCount++;
      totalScore += comment.score;
    });

    // Calculate overall sentiment
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount * 2) sentiment = 'positive';
    else if (negativeCount > positiveCount * 2) sentiment = 'negative';

    return {
      insights: [...new Set(insights)].slice(0, 5),
      alternativeSolutions: [...new Set(alternativeSolutions)].slice(0, 5),
      commonProblems: [...new Set(commonProblems)].slice(0, 5),
      sentiment,
      score: totalScore / comments.length || 0
    };
  }

  private async fetchPosts(subreddit: string, limit: number = 100): Promise<RedditPost[]> {
    try {
      console.log(`Fetching posts from r/${subreddit}...`);
      const response = await axios.get<RedditApiResponse>(
        `${RedditTrendAnalyzer.BASE_URL}/${subreddit}`,
        { 
          params: { limit, t: 'day' },
          timeout: 10000
        }
      );
      
      if (!response.data?.data?.children) {
        console.error('Unexpected response format:', response.data);
        throw new Error('Invalid response format from Reddit API');
      }
      
      const posts = response.data.data.children.map(child => child.data);
      
      // Fetch comments for each post
      const postsWithComments = await Promise.all(
        posts.map(async post => {
          const comments = await this.fetchComments(post.id, subreddit);
          return { ...post, comments };
        })
      );
      
      console.log(`Successfully fetched ${postsWithComments.length} posts with comments from r/${subreddit}`);
      return postsWithComments;
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

  private async discoverSubreddits(): Promise<string[]> {
    const discoveredSubreddits = new Set<string>();
    
    try {
      for (const keyword of RedditTrendAnalyzer.SUBREDDIT_DISCOVERY_KEYWORDS) {
        console.log(`Discovering subreddits for keyword: ${keyword}`);
        
        const response = await axios.get<SubredditSearchResponse>(
          `${RedditTrendAnalyzer.BASE_URL}/search`,
          { 
            params: { 
              q: keyword,
              type: 'sr',
              limit: 25
            },
            timeout: 10000
          }
        );

        const responseData = response.data;
        if (responseData.data?.children) {
          responseData.data.children
            .filter(subreddit => 
              // Filter criteria
              !RedditTrendAnalyzer.EXCLUDED_SUBREDDITS.has(subreddit.data.display_name) &&
              subreddit.data.display_name.length > 2 &&
              !subreddit.data.display_name.includes('bot') &&
              !subreddit.data.display_name.includes('meme') &&
              !subreddit.data.display_name.includes('circle') &&
              subreddit.data.subscribers > 1000 &&
              subreddit.data.over18 === false
            )
            .forEach(subreddit => discoveredSubreddits.add(subreddit.data.display_name));
        }
      }
  } catch (error) {
      console.error('Error discovering subreddits:', error);
    }

    const allSubreddits = new Set([
      ...RedditTrendAnalyzer.TRENDING_SUBREDDITS,
      ...Array.from(discoveredSubreddits)
    ]);

    return Array.from(allSubreddits);
  }

  public async analyzeTrends(): Promise<Trend[]> {
    // Get combined list of subreddits
    const subreddits = await this.discoverSubreddits();
    console.log(`Analyzing trends in ${subreddits.length} subreddits...`);
    
    const allPosts: RedditPost[] = [];
    
    // Use the combined list for analysis
    for (const subreddit of subreddits) {
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

      // Analyze comments for all posts
      const allComments = posts.flatMap(post => post.comments || []);
      const commentAnalysis = this.analyzeComments(allComments);

      trends.push({
        keyword,
        metrics,
        posts,
        subreddits: [...new Set(posts.map(post => post.subreddit))],
        firstSeen: Math.min(...posts.map(post => post.created_utc)),
        lastSeen: Math.max(...posts.map(post => post.created_utc)),
        examples: {
          posts: posts.slice(0, 3).map(p => `${p.title}\n${p.selftext}`),
          comments: [
            ...commentAnalysis.insights,
            ...commentAnalysis.alternativeSolutions,
            ...commentAnalysis.commonProblems
          ].slice(0, 5)
        }
      });
    }
    
    return trends.sort((a, b) => {
      const scoreA = this.scoreTrend(a.keyword, a.posts, a.metrics);
      const scoreB = this.scoreTrend(b.keyword, b.posts, b.metrics);
      return scoreB - scoreA;
    });
  }

  private analyzeCrossPosts(posts: RedditPost[]): CrossPostAnalysis {
    const crossPosts = new Map<string, {
      title: string;
      subreddits: Set<string>;
      score: number;
      firstSeen: number;
      lastSeen: number;
    }>();

    // Group similar posts
    posts.forEach(post => {
      const normalizedTitle = post.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const existing = crossPosts.get(normalizedTitle);
      
      if (existing) {
        existing.subreddits.add(post.subreddit);
        existing.score += post.score;
        existing.firstSeen = Math.min(existing.firstSeen, post.created_utc);
        existing.lastSeen = Math.max(existing.lastSeen, post.created_utc);
      } else {
        crossPosts.set(normalizedTitle, {
          title: post.title,
          subreddits: new Set([post.subreddit]),
          score: post.score,
          firstSeen: post.created_utc,
          lastSeen: post.created_utc
        });
      }
    });

    // Filter and sort cross-posts
    const filteredCrossPosts = Array.from(crossPosts.values())
      .filter(cp => cp.subreddits.size > 1)
      .sort((a, b) => b.score - a.score)
      .map(cp => ({
        ...cp,
        subreddits: Array.from(cp.subreddits)
      }));

    // Calculate metrics
    const totalCrossPosts = filteredCrossPosts.length;
    const averageSubredditsPerPost = totalCrossPosts > 0
      ? filteredCrossPosts.reduce((sum, cp) => sum + cp.subreddits.length, 0) / totalCrossPosts
      : 0;
    
    const averageTimeBetweenPosts = totalCrossPosts > 0
      ? filteredCrossPosts.reduce((sum, cp) => sum + (cp.lastSeen - cp.firstSeen), 0) / totalCrossPosts
      : 0;

    return {
      crossPosts: filteredCrossPosts,
      metrics: {
        totalCrossPosts,
        averageSubredditsPerPost,
        averageTimeBetweenPosts
      }
    };
  }

  private analyzeHistoricalTrends(trends: Trend[]): HistoricalAnalysis {
    const now = Date.now() / 1000;
    const timeWindow = 24 * 3600; // 24 hours

    const historicalTrends = trends.map(trend => {
      const timeline = [];
      let currentTime = trend.firstSeen;
      
      while (currentTime <= trend.lastSeen) {
        const postsInWindow = trend.posts.filter(post => 
          post.created_utc >= currentTime && 
          post.created_utc < currentTime + timeWindow
        );

        if (postsInWindow.length > 0) {
          timeline.push({
            time: currentTime,
            score: postsInWindow.reduce((sum, post) => sum + post.score, 0),
            comments: postsInWindow.reduce((sum, post) => sum + post.num_comments, 0)
          });
        }

        currentTime += timeWindow;
      }

      const lifetime = (trend.lastSeen - trend.firstSeen) / 3600; // in hours
      const peakScore = Math.max(...timeline.map(t => t.score));
      const peakComments = Math.max(...timeline.map(t => t.comments));
      const growthRate = timeline.length > 1
        ? (timeline[timeline.length - 1].score - timeline[0].score) / lifetime
        : 0;

      return {
        keyword: trend.keyword,
        timeline,
        metrics: {
          lifetime,
          peakScore,
          peakComments,
          growthRate
        }
      };
    });

    return {
      trends: historicalTrends.sort((a, b) => b.metrics.lifetime - a.metrics.lifetime)
    };
  }
}

export const fetchRedditTrends = async (): Promise<Trend[]> => {
  const analyzer = new RedditTrendAnalyzer();
  return await analyzer.analyzeTrends();
}; 