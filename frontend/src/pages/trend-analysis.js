import React, { useState } from 'react';
import TrendHistory from '../components/TrendHistory';

const TrendAnalysis = () => {
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchKeyword(keyword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Trend Analysis</span>
            <span className="block text-indigo-600">Discover Insights</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Analyze historical trends and discover patterns in search interest over time
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter a keyword or phrase
                </label>
                <input
                  id="keyword"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g., looksmaxxing, artificial intelligence, sustainable fashion"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 transform hover:scale-105"
                >
                  Analyze Trend
                </button>
              </div>
            </div>
          </form>
        </div>

        {searchKeyword && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <TrendHistory keyword={searchKeyword} />
          </div>
        )}

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Data provided by Google Trends • Updated in real-time</p>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysis; 