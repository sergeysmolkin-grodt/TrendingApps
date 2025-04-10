import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WordCloud } from '@ant-design/plots';
import { List, ListItem, ListItemText } from '@mui/material';
import { BarChart, Bar, ScatterChart, Scatter } from 'recharts';

interface AnalyticsSectionProps {
  title: string;
  description: string;
  metrics?: {
    label: string;
    value: number | string;
  }[];
  chartData?: {
    name: string;
    value: number;
  }[];
  wordCloudData?: {
    text: string;
    value: number;
  }[];
  listItems?: {
    primary: string;
    secondary?: string;
  }[];
  compact?: boolean;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  title,
  description,
  metrics,
  chartData,
  wordCloudData,
  listItems,
  compact = false
}) => {
  if (!chartData && !wordCloudData) return null;

  // Transform word cloud data into scatter plot data
  const scatterData = wordCloudData?.map(item => ({
    x: Math.random() * 100, // Random position
    y: Math.random() * 100,
    z: item.value, // Size based on value
    name: item.text
  }));

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {description}
        </Typography>

        {metrics && (
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {metrics.map((metric, index) => (
              <Card key={index} variant="outlined" sx={{ p: 2, flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {metric.label}
                </Typography>
                <Typography variant="h6">
                  {metric.value}
                </Typography>
              </Card>
            ))}
          </Box>
        )}

        <Box sx={{ width: '100%', height: '100%' }}>
          {chartData && (
            <ResponsiveContainer width="100%" height={compact ? "50%" : "100%"}>
              <BarChart data={chartData} margin={compact ? { top: 5, right: 5, bottom: 5, left: 5 } : undefined}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: compact ? 10 : 12 }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: compact ? 10 : 12 }}
                  width={compact ? 30 : 40}
                />
                <Tooltip />
                <Bar 
                  dataKey="value" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {wordCloudData && (
            <ResponsiveContainer width="100%" height={compact ? "50%" : "100%"}>
              <ScatterChart margin={compact ? { top: 5, right: 5, bottom: 5, left: 5 } : undefined}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" hide />
                <YAxis type="number" dataKey="y" hide />
                <Tooltip 
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const data = payload[0].payload;
                    return (
                      <div style={{ 
                        backgroundColor: 'white', 
                        padding: '5px',
                        border: '1px solid #ccc'
                      }}>
                        <p>{data.name}: {data.z}</p>
                      </div>
                    );
                  }}
                />
                <Scatter
                  data={scatterData}
                  fill="#8884d8"
                  shape={(props) => {
                    const { cx, cy, payload } = props;
                    const size = (payload.z / 100) * 20 + 10; // Scale size based on value
                    return (
                      <g>
                        <text
                          x={cx}
                          y={cy}
                          textAnchor="middle"
                          fontSize={size}
                          fill="#8884d8"
                        >
                          {payload.name}
                        </text>
                      </g>
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </Box>

        {listItems && (
          <List>
            {listItems.map((item, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={item.primary}
                  secondary={item.secondary}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}; 