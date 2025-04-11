import { useState, useEffect } from 'react';
import Link from 'next/link';

const DailyTrends = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/trends/daily');
        if (!response.ok) {
          throw new Error('Failed to fetch trends');
        }
        const data = await response.json();
        setTrends(data.trends);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Daily Trends</h1>
          <Link href="/">
            <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition duration-200">
              Back to Home
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-lg font-medium mb-2">Error loading trends</div>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trends.map((trend, index) => (
              <Link href={`/trend-analysis?keyword=${encodeURIComponent(trend.keyword)}`} key={index}>
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-200 cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{trend.keyword}</h3>
                    <span className="text-sm text-indigo-600">#{index + 1}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Current Interest</span>
                    <span className="text-lg font-medium text-indigo-600">{trend.current_interest}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTrends; 