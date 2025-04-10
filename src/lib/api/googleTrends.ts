import axios from 'axios';

interface TrendData {
  query: string;
  traffic: number;
  date: string;
  country: string;
  related_queries?: Array<{
    query: string;
    value: number;
  }>;
  related_topics?: Array<{
    topic: string;
    value: number;
  }>;
}

export const fetchGoogleTrends = async (): Promise<TrendData[]> => {
  try {
    const response = await axios.get<TrendData[]>('http://localhost:8081/api/trends');
    
    return response.data;
  } catch (error) {
    console.error('Error fetching Google Trends:', error);
    throw error;
  }
}; 