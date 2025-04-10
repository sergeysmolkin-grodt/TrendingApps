
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Search, Clock, BarChart2, Star, Download, Moon, Sun, User, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Header from './Header';
import FilterBar from './FilterBar';
import TrendAnalysis from './TrendAnalysis';
import AIInsights from './AIInsights';
import TrendGrid from './TrendGrid';
import SocialMediaTrendAnalysis from './SocialMediaTrendAnalysis';
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastRunData, setLastRunData] = useState<{date: string, trendsCount: number} | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Sample trend data for the graph
  const trendData = [
    { date: '1 Apr', trends: 30 },
    { date: '2 Apr', trends: 42 },
    { date: '3 Apr', trends: 35 },
    { date: '4 Apr', trends: 60 },
    { date: '5 Apr', trends: 78 },
    { date: '6 Apr', trends: 55 },
    { date: '7 Apr', trends: 70 },
    { date: '8 Apr', trends: 85 },
    { date: '9 Apr', trends: 92 },
    { date: '10 Apr', trends: 78 },
  ];

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
      
      // Update last run data
      const now = new Date();
      setLastRunData({
        date: now.toLocaleString(),
        trendsCount: Math.floor(Math.random() * 30) + 20 // Random number between 20-50
      });
      
      toast({
        title: "Analysis complete",
        description: "Filtered out celebrity names and non-relevant queries. View results below.",
        variant: "default", // Changed from "success" to "default" since only "default" and "destructive" are supported
      });
      
      // In a real implementation, this would trigger the actual API calls and data processing
      window.open('https://trends.google.com/trends/explore', '_blank');
    }, 3000);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    // In a real implementation, this would change the app's theme
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onThemeToggle={toggleTheme} 
        theme={theme} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trend Discovery Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Discover emerging trends and opportunities for innovative app development
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <Button 
                onClick={handleExecute} 
                disabled={isExecuting}
                className="bg-brand-teal hover:bg-brand-teal/90 text-white font-bold py-4 px-6 rounded-lg shadow-md flex items-center justify-center w-full"
                size="lg"
              >
                <Play className="mr-2 h-5 w-5" />
                {isExecuting ? "Analyzing Trends..." : "🚀 Execute Analysis"}
              </Button>
              <p className="text-sm text-gray-500 mt-2 text-center">Find potential product trends with AI filtering</p>
            </div>
            
            <div className="md:col-span-1">
              {lastRunData ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Last Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-500">Date:</span>
                        <span className="font-medium">{lastRunData.date}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">Trends found:</span>
                        <Badge variant="outline" className="bg-brand-teal/10 text-brand-teal">
                          {lastRunData.trendsCount} trends
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No recent analysis</p>
                    <p className="text-sm text-gray-400 mt-1">Run an analysis to see results</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-brand-teal" />
                Current Trending Opportunities
              </CardTitle>
              <CardDescription>
                Live trend data from the last 10 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="trends" 
                      stroke="#0D9488" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" className="flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Save Favorites
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </CardFooter>
          </Card>
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
                © 2025 Trend Whisperer | Ideas Forge
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
