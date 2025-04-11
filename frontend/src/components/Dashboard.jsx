import React from 'react';
import Link from 'next/link';

const Dashboard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <Link href="/trend-analysis">
          <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 transform hover:scale-105">
            Analyze Trends
          </button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-indigo-50 rounded-xl p-4">
          <h3 className="text-lg font-medium text-indigo-900">Daily Trends</h3>
          <p className="text-indigo-600">View current trending topics</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <h3 className="text-lg font-medium text-purple-900">Historical Analysis</h3>
          <p className="text-purple-600">Track interest over time</p>
        </div>
        <div className="bg-pink-50 rounded-xl p-4">
          <h3 className="text-lg font-medium text-pink-900">Related Queries</h3>
          <p className="text-pink-600">Discover related topics</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 