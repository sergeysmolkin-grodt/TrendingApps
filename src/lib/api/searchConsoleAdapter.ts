import axios from 'axios';

interface SearchQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchAnalyticsResponse {
  rows: Array<{
    keys: string[];
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

// Mock data for development
const MOCK_SEARCH_QUERIES: SearchQuery[] = [
  {
    query: "remote work tools",
    clicks: 1200,
    impressions: 5000,
    ctr: 0.24,
    position: 2.5
  },
  {
    query: "best productivity apps",
    clicks: 800,
    impressions: 3000,
    ctr: 0.27,
    position: 3.1
  },
  {
    query: "AI development tools",
    clicks: 1500,
    impressions: 4500,
    ctr: 0.33,
    position: 1.8
  }
];

export async function fetchSearchQueries(days: number = 30): Promise<SearchQuery[]> {
  try {
    // In development, return mock data
    return MOCK_SEARCH_QUERIES;
    
    // In production, uncomment this code:
    /*
    const response = await axios.get<SearchAnalyticsResponse>(
      `https://www.googleapis.com/webmasters/v3/sites/${process.env.SITE_URL}/searchAnalytics/query`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`
        },
        params: {
          startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          dimensions: ['query'],
          rowLimit: 1000
        }
      }
    );

    return response.data.rows.map(row => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position
    }));
    */
  } catch (error) {
    console.error('Error fetching search queries:', error);
    return MOCK_SEARCH_QUERIES; // Fallback to mock data
  }
}

export async function fetchSearchAnalytics(days: number = 30): Promise<SearchAnalyticsResponse> {
  try {
    // In development, return mock data
    return {
      rows: MOCK_SEARCH_QUERIES.map(query => ({
        keys: [query.query],
        clicks: query.clicks,
        impressions: query.impressions,
        ctr: query.ctr,
        position: query.position
      }))
    };
    
    // In production, uncomment this code:
    /*
    const response = await axios.get<SearchAnalyticsResponse>(
      `https://www.googleapis.com/webmasters/v3/sites/${process.env.SITE_URL}/searchAnalytics/query`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`
        },
        params: {
          startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          dimensions: ['query', 'date'],
          rowLimit: 1000
        }
      }
    );
    return response.data;
    */
  } catch (error) {
    console.error('Error fetching search analytics:', error);
    return {
      rows: MOCK_SEARCH_QUERIES.map(query => ({
        keys: [query.query],
        clicks: query.clicks,
        impressions: query.impressions,
        ctr: query.ctr,
        position: query.position
      }))
    };
  }
} 