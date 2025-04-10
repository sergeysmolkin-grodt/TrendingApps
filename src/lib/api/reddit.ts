import axios from 'axios';

interface RedditPost {
  title: string;
  score: number;
  num_comments: number;
  created_utc: number;
  subreddit: string;
}

export const searchRedditPosts = async (query: string): Promise<RedditPost[]> => {
  try {
    // TODO: Implement actual Reddit API integration
    // For now, return mock data
    return [
      {
        title: "New AI tools for small businesses",
        score: 150,
        num_comments: 45,
        created_utc: Date.now() / 1000,
        subreddit: "Entrepreneur"
      },
      {
        title: "Sustainable fashion startups",
        score: 200,
        num_comments: 78,
        created_utc: Date.now() / 1000,
        subreddit: "startups"
      }
    ];
  } catch (error) {
    console.error('Error searching Reddit:', error);
    throw error;
  }
}; 