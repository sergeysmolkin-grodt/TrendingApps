
interface TrendAnalysis {
  isRelevant: boolean;
  reason: string;
  potentialScore: number;
  validation: {
    category: string;
    relevanceScore: number;
    reason: string;
  };
  productPotential: {
    appIdea: string;
    targetAudience: string;
    problemSolved: string;
    viralPotential: number;
    simplicity: number;
  };
}

// Irrelevant categories that should be filtered out
const EXCLUDED_CATEGORIES = [
  'celebrity', 'actor', 'actress', 'singer', 'movie', 'film', 'tv show', 'series',
  'match', 'game', 'sport', 'tournament', 'championship', 'concert', 'fashion',
  'premiere', 'trailer', 'episode', 'season', 'awards'
];

// Categories with potential for app development
const POTENTIAL_CATEGORIES = [
  'productivity', 'health', 'education', 'finance', 'lifestyle',
  'technology', 'ai', 'tools', 'automation', 'communication',
  'organization', 'wellness', 'mindfulness', 'learning', 'personal development'
];

// Patterns indicating problem statements or needs
const PROBLEM_PATTERNS = [
  'how to', 'best way to', 'alternative to', 'tool for', 
  'app for', 'solution for', 'problem with', 'automate',
  'simplify', 'improve', 'optimize', 'track', 'manage'
];

export const analyzeTrend = async (query: string): Promise<TrendAnalysis> => {
  try {
    const queryLower = query.toLowerCase();
    
    // Check if the trend contains any excluded categories
    const containsExcludedCategory = EXCLUDED_CATEGORIES.some(category => 
      queryLower.includes(category)
    );
    
    // Check if the trend matches potential app categories
    const matchesPotentialCategory = POTENTIAL_CATEGORIES.some(category => 
      queryLower.includes(category)
    );
    
    // Check if contains problem patterns indicating user needs
    const containsProblemPattern = PROBLEM_PATTERNS.some(pattern => 
      queryLower.includes(pattern)
    );
    
    // Determine relevance based on our criteria
    const isRelevant = !containsExcludedCategory && (matchesPotentialCategory || containsProblemPattern);
    
    // Calculate potential score (0-1)
    let potentialScore = 0.5; // Default medium score
    
    if (containsExcludedCategory) {
      potentialScore = 0.1;
    } else {
      // Increase score for potential categories
      if (matchesPotentialCategory) {
        potentialScore += 0.2;
      }
      
      // Increase score for problem patterns
      if (containsProblemPattern) {
        potentialScore += 0.2;
      }
      
      // Adjust for specific high-value patterns
      if (queryLower.includes('how to') || queryLower.includes('best tool')) {
        potentialScore += 0.1;
      }
    }
    
    // Cap the score at 1.0
    potentialScore = Math.min(potentialScore, 1.0);
    
    // Determine the category
    let category = 'general';
    for (const potentialCategory of POTENTIAL_CATEGORIES) {
      if (queryLower.includes(potentialCategory)) {
        category = potentialCategory;
        break;
      }
    }
    
    // Generate product potential analysis
    const productPotential = {
      appIdea: isRelevant ? `An app that helps users ${query.replace(/how to|best way to/gi, '')}` : "Not applicable",
      targetAudience: isRelevant ? "People interested in " + category : "Not applicable",
      problemSolved: isRelevant ? `Difficulty with ${query.replace(/how to|best way to/gi, '')}` : "Not applicable",
      viralPotential: isRelevant ? potentialScore * 10 : 0,
      simplicity: isRelevant ? (queryLower.length < 30 ? 8 : 5) : 0, // Simpler queries are easier to understand
    };
    
    return {
      isRelevant,
      reason: isRelevant ? 
        "This trend shows potential for product development" : 
        "This trend is related to entertainment/celebrities/sports",
      potentialScore,
      validation: {
        category,
        relevanceScore: potentialScore,
        reason: isRelevant ? 
          `This trend relates to ${category} and indicates a user need` : 
          `This trend is related to ${containsExcludedCategory ? 'entertainment/celebrities' : 'general topics'} with low app potential`
      },
      productPotential
    };
  } catch (error) {
    console.error('Error analyzing trend:', error);
    throw error;
  }
};
