import { analysisCache } from './cache';
import axios from 'axios';
import { openAILimiter } from './rateLimiter';
import {
  fetchInterestOverTime,
  fetchInterestByRegion
} from './googleTrendsAdapter';

interface TrendAnalysis {
  query: string;
  isRelevant: boolean;
  relevanceReason: string;
  category: string;
  metrics: {
    growthRate: number;
    stability: number;
  };
}

const EXCLUDED_KEYWORDS = [
  'vs', 'match', 'actor', 'movie', 'game', 'championship',
  'celebrity', 'star', 'singer', 'player', 'team', 'series',
  'episode', 'season', 'trailer', 'release', 'premiere'
];

const PRODUCT_INDICATORS = [
  'how to', 'best', 'alternative', 'tool', 'app',
  'software', 'platform', 'solution', 'generator'
];

async function calculateGrowthRate(query: string): Promise<number> {
  try {
    const values = await fetchInterestOverTime(query);
    
    if (values.length < 2) return 0;
    
    const oldValue = values[0].value;
    const newValue = values[values.length - 1].value;
    
    return oldValue === 0 ? 0 : ((newValue - oldValue) / oldValue) * 100;
  } catch (error) {
    console.error(`Error calculating growth rate for ${query}:`, error);
    return 0;
  }
}

async function calculateStability(query: string): Promise<number> {
  try {
    const values = await fetchInterestOverTime(query);
    
    if (values.length === 0) return 0.5;
    
    // Calculate standard deviation
    const mean = values.reduce((a, b) => a + b.value, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b.value - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to stability score (0-1), where lower std dev means higher stability
    return Math.max(0, 1 - (stdDev / mean));
  } catch (error) {
    console.error(`Error calculating stability for ${query}:`, error);
    return 0.5;
  }
}

async function detectCyclicalPattern(query: string): Promise<boolean> {
  try {
    const values = await fetchInterestOverTime(query);
    
    if (values.length === 0) return false;
    
    // Simple cyclical detection: check if pattern repeats
    const halfLength = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, halfLength);
    const secondHalf = values.slice(halfLength);
    
    // Calculate correlation between first and second half
    const correlation = calculateCorrelation(
      firstHalf.map(p => p.value),
      secondHalf.map(p => p.value)
    );
    return correlation > 0.7; // Strong correlation indicates cyclical pattern
  } catch (error) {
    console.error(`Error detecting cyclical pattern for ${query}:`, error);
    return false;
  }
}

function calculateCorrelation(array1: number[], array2: number[]): number {
  const n = Math.min(array1.length, array2.length);
  let sum1 = 0;
  let sum2 = 0;
  let sum1Sq = 0;
  let sum2Sq = 0;
  let pSum = 0;
  
  for (let i = 0; i < n; i++) {
    sum1 += array1[i];
    sum2 += array2[i];
    sum1Sq += array1[i] ** 2;
    sum2Sq += array2[i] ** 2;
    pSum += array1[i] * array2[i];
  }
  
  const num = pSum - (sum1 * sum2 / n);
  const den = Math.sqrt((sum1Sq - sum1 ** 2 / n) * (sum2Sq - sum2 ** 2 / n));
  
  return den === 0 ? 0 : num / den;
}

async function calculateGeographyScore(query: string): Promise<number> {
  try {
    const regions = await fetchInterestByRegion(query);
    
    // Count countries with significant interest (value > 0)
    const activeCountries = Object.values(regions).filter(value => value > 0).length;
    
    // Convert to a 0-1 score, assuming max of 50 countries would be "global"
    return Math.min(1, activeCountries / 50);
  } catch (error) {
    console.error(`Error calculating geography score for ${query}:`, error);
    return 0.5;
  }
}

async function analyzeCompetition(query: string): Promise<number> {
  // Placeholder: Would check SERP competition
  return Math.random();
}

function checkContextRelevance(query: string): boolean {
  // Placeholder: Would check if trend relates to real problem
  return Math.random() > 0.3;
}

function determineCompetitionLevel(score: number): 'Low' | 'Medium' | 'High' {
  if (score < 0.3) return 'Low';
  if (score < 0.7) return 'Medium';
  return 'High';
}

async function identifyTargetAudience(query: string): Promise<string[]> {
  // Placeholder: Would use AI to identify target audience
  return ['Early Adopters', 'Tech Enthusiasts'];
}

async function generateProductIdea(query: string): Promise<string> {
  // Placeholder: Would use AI to generate product idea
  return `Mobile app for ${query}`;
}

async function findRelatedQueries(query: string): Promise<string[]> {
  // Placeholder: Would use Google Trends API
  return [`${query} alternative`, `best ${query}`, `how to ${query}`];
}

async function determineCategory(query: string): Promise<string> {
  // Placeholder: Would use AI to categorize
  return 'Technology';
}

// Simple analyzer that returns mock data since we're not using AI
export async function analyzeTrend(query: string): Promise<TrendAnalysis> {
  // For now, we'll consider all trends relevant with random metrics
  return {
    query,
    isRelevant: true,
    relevanceReason: "Trending topic with significant interest",
    category: "General",
    metrics: {
      growthRate: Math.random() * 100,
      stability: Math.random()
    }
  };
}

export async function batchAnalyzeTrends(queries: string[]): Promise<TrendAnalysis[]> {
  return Promise.all(queries.map(query => analyzeTrend(query)));
} 