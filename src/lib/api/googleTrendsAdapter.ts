import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/trends';

interface TrendData {
  title: string;
  value: number;
}

interface DailyTrendsResponse {
  trends: Array<{ query: string }>;
}

interface InterestResponse {
  values: number[];
}

interface RegionResponse {
  regions: { [key: string]: number };
}

interface QueriesResponse {
  queries: string[];
}

interface DailyTrend {
  title: string;
  formattedTraffic: string;
  relatedQueries: string[];
}

interface InterestPoint {
  date: string;
  value: number;
}

export async function fetchRealTimeTrends(): Promise<string[]> {
  try {
    const { data } = await axios.get<DailyTrendsResponse>(`${API_BASE_URL}/daily`);
    return data.trends.map(trend => trend.query);
  } catch (error) {
    console.error('Error fetching trends:', error);
    return [];
  }
}

export async function fetchDailyTrends(): Promise<DailyTrend[]> {
  // Return mock trends data
  return [
    {
      title: "Remote Work Tools",
      formattedTraffic: "200K+",
      relatedQueries: ["best remote work software", "remote collaboration tools"]
    },
    {
      title: "AI Development",
      formattedTraffic: "500K+",
      relatedQueries: ["machine learning courses", "AI programming tutorials"]
    },
    {
      title: "Digital Marketing",
      formattedTraffic: "300K+",
      relatedQueries: ["social media strategy", "content marketing tips"]
    }
  ];
}

export async function fetchInterestOverTime(query: string): Promise<InterestPoint[]> {
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100)
    };
  });
  
  return last7Days;
}

export async function fetchInterestByRegion(keyword: string): Promise<{ [key: string]: number }> {
  try {
    const { data } = await axios.get<RegionResponse>(`${API_BASE_URL}/region/${encodeURIComponent(keyword)}`);
    return data.regions;
  } catch (error) {
    console.error('Error fetching interest by region:', error);
    return {};
  }
}

export async function fetchRelatedQueries(query: string): Promise<string[]> {
  // Return mock related queries based on the input query
  const mockRelatedQueries = {
    "Remote Work Tools": ["productivity apps", "video conferencing", "project management"],
    "AI Development": ["python machine learning", "deep learning frameworks", "AI tutorials"],
    "Digital Marketing": ["SEO tips", "social media marketing", "content strategy"]
  };
  
  return mockRelatedQueries[query] || ["related search 1", "related search 2", "related search 3"];
} 