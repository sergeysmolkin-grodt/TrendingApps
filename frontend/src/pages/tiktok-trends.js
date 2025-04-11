import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TikTokTrends = () => {
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchTrendData();
  }, [timeRange]);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching trend data...');
      const response = await fetch('http://localhost:8000/api/tiktok/trends/all');
      console.log('Response received:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch trend data');
      }
      
      const data = await response.json();
      console.log('Data received:', data);
      setTrendData(data);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Trends</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTrendData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trend data...</p>
        </div>
      </div>
    );
  }

  if (!trendData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">No trend data is currently available.</p>
          <button
            onClick={fetchTrendData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">TikTok Trend Analysis</h1>
        <p className="text-gray-600 mt-2">Real-time analysis of viral trends and opportunities</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex space-x-4">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Trending Categories</h2>
          <div className="h-80">
            <Bar
              data={{
                labels: ['AI Apps', 'Beauty', 'Fitness', 'Education', 'Lifestyle'],
                datasets: [
                  {
                    label: 'View Count (millions)',
                    data: [150, 120, 100, 80, 60],
                    backgroundColor: [
                      'rgba(99, 102, 241, 0.5)',
                      'rgba(167, 139, 250, 0.5)',
                      'rgba(236, 72, 153, 0.5)',
                      'rgba(248, 113, 113, 0.5)',
                      'rgba(251, 146, 60, 0.5)',
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* Growth Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Trend Growth Rate</h2>
          <div className="h-80">
            <Line
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                  {
                    label: 'AI Apps',
                    data: [65, 75, 85, 95, 120, 150, 180],
                    borderColor: 'rgb(99, 102, 241)',
                    tension: 0.4,
                  },
                  {
                    label: 'Beauty',
                    data: [45, 55, 65, 75, 85, 95, 105],
                    borderColor: 'rgb(236, 72, 153)',
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Engagement Distribution</h2>
          <div className="h-80">
            <Doughnut
              data={{
                labels: ['Likes', 'Comments', 'Shares', 'Saves'],
                datasets: [
                  {
                    data: [45, 25, 20, 10],
                    backgroundColor: [
                      'rgba(99, 102, 241, 0.8)',
                      'rgba(236, 72, 153, 0.8)',
                      'rgba(251, 146, 60, 0.8)',
                      'rgba(167, 139, 250, 0.8)',
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* Trend Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Top Trending Content</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                  #{item}
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">AI Photo Editor Trend</h3>
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <span>1.2M views</span>
                    <span>234K likes</span>
                    <span>45K shares</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Average Engagement Rate</h3>
          <p className="mt-2 text-3xl font-semibold text-indigo-600">8.7%</p>
          <p className="text-sm text-gray-500">+2.1% from last week</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Viral Potential Score</h3>
          <p className="mt-2 text-3xl font-semibold text-pink-600">92/100</p>
          <p className="text-sm text-gray-500">High potential for growth</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Content Saturation</h3>
          <p className="mt-2 text-3xl font-semibold text-orange-600">Medium</p>
          <p className="text-sm text-gray-500">Room for new creators</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Monetization Potential</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">High</p>
          <p className="text-sm text-gray-500">Multiple revenue streams</p>
        </div>
      </div>

      {/* Audience Insights */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Audience Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Age Distribution</h3>
              <div className="space-y-2">
                {[
                  { age: '13-17', percentage: 15 },
                  { age: '18-24', percentage: 35 },
                  { age: '25-34', percentage: 30 },
                  { age: '35+', percentage: 20 },
                ].map((item) => (
                  <div key={item.age} className="flex items-center">
                    <span className="w-16 text-sm text-gray-600">{item.age}</span>
                    <div className="flex-1 ml-2">
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Geographic Distribution</h3>
              <div className="space-y-2">
                {[
                  { country: 'United States', percentage: 40 },
                  { country: 'United Kingdom', percentage: 20 },
                  { country: 'Canada', percentage: 15 },
                  { country: 'Australia', percentage: 10 },
                  { country: 'Others', percentage: 15 },
                ].map((item) => (
                  <div key={item.country} className="flex items-center">
                    <span className="w-24 text-sm text-gray-600 truncate">{item.country}</span>
                    <div className="flex-1 ml-2">
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-pink-500"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Peak Activity Times</h3>
              <div className="space-y-2">
                {[
                  { time: '6AM-12PM', percentage: 20 },
                  { time: '12PM-6PM', percentage: 30 },
                  { time: '6PM-12AM', percentage: 40 },
                  { time: '12AM-6AM', percentage: 10 },
                ].map((item) => (
                  <div key={item.time} className="flex items-center">
                    <span className="w-20 text-sm text-gray-600">{item.time}</span>
                    <div className="flex-1 ml-2">
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikTokTrends; 