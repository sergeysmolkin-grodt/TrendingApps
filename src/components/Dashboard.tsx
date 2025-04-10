
import React from 'react';
import Header from './Header';
import FilterBar from './FilterBar';
import TrendAnalysis from './TrendAnalysis';
import AIInsights from './AIInsights';
import TrendGrid from './TrendGrid';
import SocialMediaTrendAnalysis from './SocialMediaTrendAnalysis';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trend Discovery Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover emerging trends and opportunities for innovative app development
          </p>
        </div>
        
        <FilterBar />
        <TrendAnalysis />
        <AIInsights />
        <SocialMediaTrendAnalysis />
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Trending Opportunities</h2>
            <button className="text-sm text-brand-blue hover:text-brand-teal">View All</button>
          </div>
          <TrendGrid />
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                © 2023 Trend Whisperer | Ideas Forge
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-teal">About</a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-teal">API</a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-teal">Privacy</a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-brand-teal">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
