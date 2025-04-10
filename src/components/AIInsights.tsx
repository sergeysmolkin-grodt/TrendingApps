
import React from 'react';
import { BrainCircuit, Lightbulb, TrendingUp, PieChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AIInsights = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <BrainCircuit className="h-5 w-5 mr-2 text-brand-teal" />
          AI Insights
        </h2>
        <Badge variant="outline" className="bg-brand-blue/10 text-brand-blue">Updated 2h ago</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
              Opportunity Analysis
            </CardTitle>
            <CardDescription>Based on trend data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              The current data suggests high potential for applications in the 
              education technology space, particularly focusing on AI-powered learning 
              tools and personalized education.
            </p>
            <div className="text-sm font-medium">
              Suggested App Concepts:
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                <li>AI Study Assistant</li>
                <li>Personalized Learning Path Creator</li>
                <li>Interactive Knowledge Assessment Tool</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
              Growth Prediction
            </CardTitle>
            <CardDescription>6-month forecast</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Based on current trajectory and seasonal factors, we predict the following 
              trends will continue to show strong growth over the next 6 months:
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">AI Learning Tools</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">+68%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mental Health Apps</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">+52%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Virtual Reality Fitness</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">+47%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <PieChart className="h-4 w-4 mr-2 text-blue-500" />
              Market Analysis
            </CardTitle>
            <CardDescription>Competitive landscape</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Current market analysis shows several underserved areas with high potential:
            </p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">AI Learning Tools</span>
                  <span className="text-xs text-gray-500">Market Saturation</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div className="bg-brand-teal h-1.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Mental Health Apps</span>
                  <span className="text-xs text-gray-500">Market Saturation</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div className="bg-brand-teal h-1.5 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Virtual Reality Fitness</span>
                  <span className="text-xs text-gray-500">Market Saturation</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div className="bg-brand-teal h-1.5 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIInsights;
