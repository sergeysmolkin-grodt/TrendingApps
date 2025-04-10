
import React, { useState } from 'react';
import Header from './Header';
import FilterBar from './FilterBar';
import TrendAnalysis from './TrendAnalysis';
import AIInsights from './AIInsights';
import TrendGrid from './TrendGrid';
import SocialMediaTrendAnalysis from './SocialMediaTrendAnalysis';
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    
    // Simulate the process of analyzing trends
    toast({
      title: "Starting trend analysis",
      description: "Connecting to Google Trends and analyzing popular searches...",
    });
    
    // Simulate the processing time
    setTimeout(() => {
      setIsExecuting(false);
      toast({
        title: "Analysis complete",
        description: "Filtered out celebrity names and non-relevant queries. View results below.",
        variant: "success",
      });
      
      // In a real implementation, this would trigger the actual API calls and data processing
      window.open('https://trends.google.com/trends/explore', '_blank');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trend Discovery Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Discover emerging trends and opportunities for innovative app development
          </p>
          
          <Button 
            onClick={handleExecute} 
            disabled={isExecuting}
            className="bg-brand-teal hover:bg-brand-teal/90 text-white font-bold py-3 px-6 rounded-lg shadow-md flex items-center justify-center w-full md:w-auto mb-8"
          >
            <Play className="mr-2 h-5 w-5" />
            {isExecuting ? "Analyzing Trends..." : "Execute Trend Analysis"}
          </Button>
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
