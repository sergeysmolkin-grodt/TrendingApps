
import React, { useState } from 'react';
import { Search, Hash, MessageCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SocialMention {
  platform: 'Reddit' | 'TikTok' | 'Instagram';
  type: 'post' | 'comment' | 'hashtag' | 'video';
  content: string;
  engagement: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  url: string;
  date: string;
}

// Sample data for demonstration purposes
const socialMentionsData: Record<string, SocialMention[]> = {
  "AI Learning Tools": [
    {
      platform: 'Reddit',
      type: 'post',
      content: 'This AI learning tool is changing how I study for exams, complete game changer!',
      engagement: 532,
      sentiment: 'positive',
      url: 'https://reddit.com/r/edtech/comments/12345',
      date: '2025-03-15'
    },
    {
      platform: 'TikTok',
      type: 'video',
      content: 'How I went from C to A+ using this AI study assistant #edtech #ailearning',
      engagement: 15400,
      sentiment: 'positive',
      url: 'https://tiktok.com/video/987654',
      date: '2025-03-28'
    },
    {
      platform: 'Instagram',
      type: 'hashtag',
      content: '#ailearningtools has 24.5k posts this month, growing 43% from last month',
      engagement: 24500,
      sentiment: 'neutral',
      url: 'https://instagram.com/explore/tags/ailearningtools',
      date: '2025-04-01'
    },
  ],
  "Mental Health Apps": [
    {
      platform: 'Reddit',
      type: 'comment',
      content: "I've tried 5 different mental health apps and none of them really address my specific anxiety issues.",
      engagement: 78,
      sentiment: 'negative',
      url: 'https://reddit.com/r/mentalhealth/comments/54321',
      date: '2025-03-20'
    },
    {
      platform: 'TikTok',
      type: 'video',
      content: 'Mental health professionals review the top anxiety apps #mentalhealth #anxietyhelp',
      engagement: 8900,
      sentiment: 'neutral',
      url: 'https://tiktok.com/video/765432',
      date: '2025-03-18'
    },
  ],
  "Virtual Reality Fitness": [
    {
      platform: 'Instagram',
      type: 'post',
      content: 'My 30-day VR fitness challenge results! Lost 8 pounds and actually had fun exercising for once.',
      engagement: 3450,
      sentiment: 'positive',
      url: 'https://instagram.com/p/123456',
      date: '2025-03-25'
    },
    {
      platform: 'Reddit',
      type: 'post',
      content: 'VR Fitness App Review: Comparing the top 5 apps for immersive workouts',
      engagement: 421,
      sentiment: 'neutral',
      url: 'https://reddit.com/r/VRFitness/comments/24680',
      date: '2025-03-30'
    },
  ],
};

// Platform icons mapping
const platformIcons = {
  'Reddit': () => <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">R</div>,
  'TikTok': () => <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs">T</div>,
  'Instagram': () => <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs">I</div>,
};

// Type icons mapping
const typeIcons = {
  'post': <MessageCircle className="h-4 w-4" />,
  'comment': <MessageCircle className="h-4 w-4" />,
  'hashtag': <Hash className="h-4 w-4" />,
  'video': <TrendingUp className="h-4 w-4" />,
};

// Sentiment badge colors
const sentimentColors = {
  'positive': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'negative': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'neutral': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
};

const SocialMediaTrendAnalysis = () => {
  const [selectedTrend, setSelectedTrend] = useState("AI Learning Tools");
  const [searchTerm, setSearchTerm] = useState("");

  const trendOptions = Object.keys(socialMentionsData);
  const filteredTrends = trendOptions.filter(trend => 
    trend.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger an API call to fetch social media data
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Search className="h-5 w-5 mr-2 text-brand-teal" />
          Social Media Trend Analysis
        </h2>
        <Badge variant="outline" className="bg-brand-blue/10 text-brand-blue">
          Live Data
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Monitor Social Media Mentions</CardTitle>
          <CardDescription>
            Track trend mentions across Reddit, TikTok, and Instagram
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder="Search trends to analyze..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit">Analyze</Button>
            </form>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Select a trend to view social mentions:</h3>
            <div className="flex flex-wrap gap-2">
              {filteredTrends.map((trend) => (
                <Badge
                  key={trend}
                  className={`cursor-pointer ${
                    selectedTrend === trend
                      ? "bg-brand-teal text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
                  }`}
                  onClick={() => setSelectedTrend(trend)}
                >
                  {trend}
                </Badge>
              ))}
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Platforms</TabsTrigger>
              <TabsTrigger value="reddit">Reddit</TabsTrigger>
              <TabsTrigger value="tiktok">TikTok</TabsTrigger>
              <TabsTrigger value="instagram">Instagram</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {socialMentionsData[selectedTrend]?.map((mention, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {platformIcons[mention.platform]()}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{mention.platform}</span>
                          <div className="flex items-center text-xs text-gray-500">
                            {typeIcons[mention.type]}
                            <span className="ml-1 capitalize">{mention.type}</span>
                          </div>
                        </div>
                        <Badge className={sentimentColors[mention.sentiment]}>
                          {mention.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{mention.content}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{mention.date}</span>
                        <span>{mention.engagement.toLocaleString()} engagements</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="reddit" className="space-y-4">
              {socialMentionsData[selectedTrend]
                ?.filter(mention => mention.platform === 'Reddit')
                .map((mention, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {platformIcons[mention.platform]()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{mention.platform}</span>
                            <div className="flex items-center text-xs text-gray-500">
                              {typeIcons[mention.type]}
                              <span className="ml-1 capitalize">{mention.type}</span>
                            </div>
                          </div>
                          <Badge className={sentimentColors[mention.sentiment]}>
                            {mention.sentiment}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{mention.content}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{mention.date}</span>
                          <span>{mention.engagement.toLocaleString()} engagements</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="tiktok" className="space-y-4">
              {socialMentionsData[selectedTrend]
                ?.filter(mention => mention.platform === 'TikTok')
                .map((mention, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {platformIcons[mention.platform]()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{mention.platform}</span>
                            <div className="flex items-center text-xs text-gray-500">
                              {typeIcons[mention.type]}
                              <span className="ml-1 capitalize">{mention.type}</span>
                            </div>
                          </div>
                          <Badge className={sentimentColors[mention.sentiment]}>
                            {mention.sentiment}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{mention.content}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{mention.date}</span>
                          <span>{mention.engagement.toLocaleString()} engagements</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="instagram" className="space-y-4">
              {socialMentionsData[selectedTrend]
                ?.filter(mention => mention.platform === 'Instagram')
                .map((mention, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {platformIcons[mention.platform]()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{mention.platform}</span>
                            <div className="flex items-center text-xs text-gray-500">
                              {typeIcons[mention.type]}
                              <span className="ml-1 capitalize">{mention.type}</span>
                            </div>
                          </div>
                          <Badge className={sentimentColors[mention.sentiment]}>
                            {mention.sentiment}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{mention.content}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{mention.date}</span>
                          <span>{mention.engagement.toLocaleString()} engagements</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>
              Note: This component displays trend mentions across social media platforms.
              In a complete implementation, it would fetch real data from social media APIs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaTrendAnalysis;
