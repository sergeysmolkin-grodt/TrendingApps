import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, MessageSquare, ThumbsUp, Search, TrendingUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Trend {
  query: string;
  traffic: number;
  date: string;
  country: string;
  isRelevant?: boolean;
  potentialScore?: number;
  redditPosts?: any[];
  related_queries?: Array<{
    query: string;
    value: number;
  }>;
  related_topics?: Array<{
    topic: string;
    value: number;
  }>;
}

interface TrendGridProps {
  trends?: Trend[];
}

const TrendGrid: React.FC<TrendGridProps> = ({ trends = [] }) => {
  if (trends.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No trends analyzed yet</p>
        <p className="text-sm text-gray-400 mt-1">Run an analysis to see results</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trends.map((trend, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{trend.query}</CardTitle>
            <CardDescription>
              {new Date(trend.date).toLocaleDateString()} • {trend.country}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Traffic Score</span>
                <Badge variant="outline">{trend.traffic}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Relevance</span>
                <Badge variant={trend.isRelevant ? "default" : "destructive"}>
                  {trend.isRelevant ? "Relevant" : "Not Relevant"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Potential Score</span>
                <Badge variant="outline" className="bg-brand-teal/10 text-brand-teal">
                  {(trend.potentialScore || 0) * 100}%
                </Badge>
              </div>
              
              {trend.redditPosts && trend.redditPosts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Reddit Activity</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {trend.redditPosts.reduce((sum, post) => sum + post.score, 0)}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {trend.redditPosts.reduce((sum, post) => sum + post.num_comments, 0)}
                    </div>
                  </div>
                </div>
              )}

              {(trend.related_queries?.length || trend.related_topics?.length) && (
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center text-sm text-brand-teal hover:text-brand-teal/80">
                    <Search className="h-4 w-4 mr-1" />
                    View Related Data
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    {trend.related_queries?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Related Queries</p>
                        <div className="space-y-1">
                          {trend.related_queries.map((query, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{query.query}</span>
                              <Badge variant="outline">{query.value}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {trend.related_topics?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Related Topics</p>
                        <div className="space-y-1">
                          {trend.related_topics.map((topic, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{topic.topic}</span>
                              <Badge variant="outline">{topic.value}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default TrendGrid;
