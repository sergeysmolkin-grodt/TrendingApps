
import { analyzeTrend } from './aiFilter';
import {
  fetchDailyTrends,
  fetchInterestOverTime,
  fetchRelatedQueries
} from './googleTrendsAdapter';

interface Trend {
  query: string;
  traffic: number;
  date: string;
  country: string;
  isRelevant?: boolean;
  potentialScore?: number;
  validation?: {
    category: string;
    relevanceScore: number;
    reason: string;
  };
  productPotential?: {
    appIdea: string;
    targetAudience: string;
    problemSolved: string;
    viralPotential: number;
    simplicity: number;
  };
}

export async function fetchGoogleTrends(): Promise<Trend[]> {
  try {
    // Get trending searches
    const dailyTrends = await fetchDailyTrends();
    
    // Analyze each trend
    const analyzedTrends = await Promise.all(
      dailyTrends.map(async (trend) => {
        // Get interest over time for traffic calculation
        const interestData = await fetchInterestOverTime(trend.title);
        const traffic = interestData.length > 0 ? Math.max(...interestData.map(p => p.value)) : 0;

        // Get related queries for validation
        const relatedQueries = await fetchRelatedQueries(trend.title);
        
        // Analyze the trend
        const analysis = await analyzeTrend(trend.title);
        
        return {
          query: trend.title,
          traffic,
          date: new Date().toISOString(),
          country: 'US',
          isRelevant: analysis.isRelevant,
          potentialScore: analysis.potentialScore,
          validation: analysis.validation,
          productPotential: analysis.productPotential
        };
      })
    );

    // Filter out irrelevant trends
    return analyzedTrends.filter(trend => trend.isRelevant);
  } catch (error) {
    console.error('Error fetching Google Trends:', error);
    return [];
  }
}
