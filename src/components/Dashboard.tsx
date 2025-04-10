import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Search, Clock, BarChart2, Star, Download, Moon, Sun, User, Settings, MessageCircleMore, TrendingUp, Activity, Instagram, Music } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Header from './Header';
import FilterBar from './FilterBar';
import TrendAnalysis from './TrendAnalysis';
import AIInsights from './AIInsights';
import TrendGrid from './TrendGrid';
import SocialMediaTrendAnalysis from './SocialMediaTrendAnalysis';
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { fetchGoogleTrends } from '@/lib/api/googleTrends';
import { fetchRedditTrends } from '@/lib/api/redditTrends';
import { searchRedditPosts } from '@/lib/api/reddit';
import { analyzeTrend } from '@/lib/api/aiFilter';
import RedditTrendTest from './RedditTrendTest';

interface Trend {
  query: string;
  traffic: number;
  date: string;
  country: string;
  isRelevant?: boolean;
  potentialScore?: number;
  redditPosts?: any[];
}

interface TrendAnalytics {
  id: string;
  title: string;
  source: 'google' | 'reddit' | 'instagram' | 'tiktok';
  mentions: number;
  growth: number;
  date: string;
}

const TrendAnalyticsList = ({ trends }: { trends: TrendAnalytics[] }) => {
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'google':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'reddit':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'instagram':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'tiktok':
        return 'bg-black text-white dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'google':
        return <Play className="h-4 w-4" />;
      case 'reddit':
        return <MessageCircleMore className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'tiktok':
        return <Music className="h-4 w-4" />;
      default:
        return <BarChart2 className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart2 className="h-5 w-5 mr-2" />
          Trend Analytics
        </CardTitle>
        <CardDescription>
          Top trending topics across all platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.map((trend) => (
            <div key={trend.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${getSourceColor(trend.source)}`}>
                  {getSourceIcon(trend.source)}
                </div>
                <div>
                  <h3 className="font-medium">{trend.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(trend.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-gray-100 dark:bg-gray-700">
                  {trend.mentions.toLocaleString()} mentions
                </Badge>
                <Badge variant="outline" className={trend.growth > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}>
                  {trend.growth > 0 ? '+' : ''}{trend.growth}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isAnalyzingReddit, setIsAnalyzingReddit] = useState(false);
  const [isAnalyzingInstagram, setIsAnalyzingInstagram] = useState(false);
  const [isAnalyzingTikTok, setIsAnalyzingTikTok] = useState(false);
  const [lastRunData, setLastRunData] = useState<{date: string, trendsCount: number, source: 'google' | 'reddit' | 'instagram' | 'tiktok'} | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [trends, setTrends] = useState<Trend[]>([]);

  // Enhanced trend data with more metrics
  const trendData = [
    { date: '1 Apr', trends: 30, engagement: 45, potential: 75 },
    { date: '2 Apr', trends: 42, engagement: 52, potential: 82 },
    { date: '3 Apr', trends: 35, engagement: 48, potential: 78 },
    { date: '4 Apr', trends: 60, engagement: 65, potential: 85 },
    { date: '5 Apr', trends: 78, engagement: 72, potential: 92 },
    { date: '6 Apr', trends: 55, engagement: 58, potential: 80 },
    { date: '7 Apr', trends: 70, engagement: 68, potential: 88 },
    { date: '8 Apr', trends: 85, engagement: 75, potential: 95 },
    { date: '9 Apr', trends: 92, engagement: 82, potential: 98 },
    { date: '10 Apr', trends: 78, engagement: 70, potential: 90 },
  ];

  const handleExecute = async () => {
    setIsExecuting(true);
    
    toast({
      title: "Starting trend analysis",
      description: "Connecting to Google Trends and analyzing popular searches...",
    });
    
    try {
      // Fetch trends from Google Trends
      const googleTrends = await fetchGoogleTrends();
      
      // Analyze each trend
      const analyzedTrends = await Promise.all(
        googleTrends.map(async (trend) => {
          const analysis = await analyzeTrend(trend.query);
          const redditPosts = await searchRedditPosts(trend.query);
          
          return {
            ...trend,
            isRelevant: analysis.isRelevant,
            potentialScore: analysis.potentialScore,
            redditPosts
          };
        })
      );
      
      setTrends(analyzedTrends);
      
      // Update last run data
      const now = new Date();
      setLastRunData({
        date: now.toLocaleString(),
        trendsCount: analyzedTrends.length,
        source: 'google'
      });
      
      toast({
        title: "Analysis complete",
        description: `Found ${analyzedTrends.length} potential trends`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze trends. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRedditAnalysis = async () => {
    setIsAnalyzingReddit(true);
    
    toast({
      title: "Starting Reddit analysis",
      description: "Fetching and analyzing trending posts from Reddit...",
    });
    
    try {
      const redditTrends = await fetchRedditTrends();
      
      // Update last run data
      const now = new Date();
      setLastRunData({
        date: now.toLocaleString(),
        trendsCount: redditTrends.length,
        source: 'reddit'
      });
      
      toast({
        title: "Reddit analysis complete",
        description: `Found ${redditTrends.length} trending discussions`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze Reddit trends. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingReddit(false);
    }
  };

  const handleInstagramAnalysis = async () => {
    setIsAnalyzingInstagram(true);
    
    toast({
      title: "Starting Instagram analysis",
      description: "Fetching and analyzing trending hashtags and posts...",
    });
    
    try {
      // In a real implementation, this would call the Instagram API
      const instagramTrends = await new Promise(resolve => setTimeout(() => resolve([{query: 'test', traffic: 100}]), 2000));
      
      const now = new Date();
      setLastRunData({
        date: now.toLocaleString(),
        trendsCount: instagramTrends.length,
        source: 'instagram'
      });
      
      toast({
        title: "Instagram analysis complete",
        description: `Found ${instagramTrends.length} trending topics`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze Instagram trends. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingInstagram(false);
    }
  };

  const handleTikTokAnalysis = async () => {
    setIsAnalyzingTikTok(true);
    
    toast({
      title: "Starting TikTok analysis",
      description: "Fetching and analyzing trending hashtags and sounds...",
    });
    
    try {
      // In a real implementation, this would call the TikTok API
      const tiktokTrends = await new Promise(resolve => setTimeout(() => resolve([{query: 'test', traffic: 100}]), 2000));
      
      const now = new Date();
      setLastRunData({
        date: now.toLocaleString(),
        trendsCount: tiktokTrends.length,
        source: 'tiktok'
      });
      
      toast({
        title: "TikTok analysis complete",
        description: `Found ${tiktokTrends.length} trending topics`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze TikTok trends. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingTikTok(false);
    }
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
          <RedditTrendTest />
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trend Discovery</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Real-time trend analysis and opportunity discovery
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <Button 
                onClick={handleExecute} 
                disabled={isExecuting || isAnalyzingReddit || isAnalyzingInstagram || isAnalyzingTikTok}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-lg shadow-sm flex items-center justify-center w-full"
                size="lg"
              >
                <Play className="mr-2 h-5 w-5" />
                {isExecuting ? "Analyzing..." : "Google Trends"}
              </Button>
              <Button 
                onClick={handleRedditAnalysis} 
                disabled={isExecuting || isAnalyzingReddit || isAnalyzingInstagram || isAnalyzingTikTok}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-lg shadow-sm flex items-center justify-center w-full"
                size="lg"
              >
                <MessageCircleMore className="mr-2 h-5 w-5" />
                {isAnalyzingReddit ? "Analyzing..." : "Reddit Trends"}
              </Button>
              <Button 
                onClick={handleInstagramAnalysis} 
                disabled={isExecuting || isAnalyzingReddit || isAnalyzingInstagram || isAnalyzingTikTok}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-lg shadow-sm flex items-center justify-center w-full"
                size="lg"
              >
                <Instagram className="mr-2 h-5 w-5" />
                {isAnalyzingInstagram ? "Analyzing..." : "Instagram Trends"}
              </Button>
              <Button 
                onClick={handleTikTokAnalysis} 
                disabled={isExecuting || isAnalyzingReddit || isAnalyzingInstagram || isAnalyzingTikTok}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-lg shadow-sm flex items-center justify-center w-full"
                size="lg"
              >
                <Music className="mr-2 h-5 w-5" />
                {isAnalyzingTikTok ? "Analyzing..." : "TikTok Trends"}
              </Button>
            </div>
            
            <div className="md:col-span-1">
              {lastRunData ? (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Last Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Date</span>
                        <span className="font-medium">{lastRunData.date}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Source</span>
                        <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                          {lastRunData.source === 'reddit' ? 'Reddit' : lastRunData.source === 'instagram' ? 'Instagram' : lastRunData.source === 'tiktok' ? 'TikTok' : 'Google Trends'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Trends</span>
                        <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                          {lastRunData.trendsCount}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm h-full flex items-center justify-center">
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No recent analysis</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Trend Analysis
                </CardTitle>
                <CardDescription>
                  Last 10 days trend performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorTrends" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0D9488" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="trends" 
                        stroke="#0D9488" 
                        fillOpacity={1} 
                        fill="url(#colorTrends)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2" />
                  Engagement Metrics
                </CardTitle>
                <CardDescription>
                  Trend engagement and potential
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="potential" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
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
            <TrendGrid trends={trends} />
          </div>
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
