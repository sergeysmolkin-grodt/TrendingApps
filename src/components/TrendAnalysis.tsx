
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const trendData = [
  { name: 'Jan', value: 35, comparison: 30 },
  { name: 'Feb', value: 40, comparison: 32 },
  { name: 'Mar', value: 45, comparison: 35 },
  { name: 'Apr', value: 55, comparison: 40 },
  { name: 'May', value: 65, comparison: 45 },
  { name: 'Jun', value: 70, comparison: 50 },
  { name: 'Jul', value: 85, comparison: 55 },
  { name: 'Aug', value: 95, comparison: 65 },
];

const TrendAnalysis = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Trend Analysis</CardTitle>
        <CardDescription>Comparative analysis of selected trend patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="lineChart">
          <TabsList className="mb-4">
            <TabsTrigger value="lineChart">Line Chart</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="regional">Regional</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lineChart">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0D9488" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-lg mb-2">AI Analysis</h4>
              <p className="text-gray-600 dark:text-gray-300">
                This trend shows strong growth potential with a 42% increase over the last 6 months. 
                The consistent upward trajectory suggests sustained user interest and minimal 
                seasonal fluctuations, making it a good candidate for app development.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="comparison">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Primary Trend"
                    stroke="#0D9488" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="comparison" 
                    name="Comparison Trend"
                    stroke="#3B82F6" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="regional">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Top Regions</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>United States</span>
                    <span className="font-medium">100</span>
                  </li>
                  <li className="flex justify-between">
                    <span>United Kingdom</span>
                    <span className="font-medium">78</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Canada</span>
                    <span className="font-medium">65</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Australia</span>
                    <span className="font-medium">58</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Germany</span>
                    <span className="font-medium">42</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Regional Growth</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>India</span>
                    <span className="text-green-600">+125%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Brazil</span>
                    <span className="text-green-600">+87%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Japan</span>
                    <span className="text-green-600">+42%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>France</span>
                    <span className="text-green-600">+28%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Italy</span>
                    <span className="text-blue-600">+5%</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TrendAnalysis;
