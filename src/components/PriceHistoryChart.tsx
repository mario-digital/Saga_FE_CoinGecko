/**
 * Price history chart component with time range selector
 */

import { FC, memo } from 'react';
import * as React from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { TimeRangeSelector } from '@/components/TimeRangeSelector';
import { usePriceHistory, TimeRange } from '@/hooks/usePriceHistory';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface PriceHistoryChartProps {
  coinId: string;
  coinName?: string;
}

const chartConfig = {
  price: {
    label: 'Price',
    color: '#3b82f6', // Direct color instead of CSS variable
  },
} satisfies ChartConfig;

export const PriceHistoryChart: FC<PriceHistoryChartProps> = memo(
  ({ coinId, coinName }) => {
    const [timeRange, setTimeRange] = React.useState<TimeRange>('7d');
    const { data, isLoading, error, retry } = usePriceHistory(
      coinId,
      timeRange
    );

    if (isLoading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
            <CardDescription>Loading price data...</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[350px] w-full" />
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
            <CardDescription>Unable to load price data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[350px] text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                {error || 'Failed to load price history'}
              </p>
              <Button onClick={retry} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!data || data.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
            <CardDescription>No price data available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No price history data available for this time range
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Price History</CardTitle>
              <CardDescription>
                {coinName ? `${coinName} price over time` : 'Price over time'}
              </CardDescription>
            </div>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <ChartContainer
            config={chartConfig}
            className="h-[250px] sm:h-[350px] w-full"
          >
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                bottom: 5,
                left: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
                domain={['dataMin', 'dataMax']}
                tickFormatter={value => {
                  const price = parseFloat(value);
                  if (price >= 1000) {
                    return `$${(price / 1000).toFixed(1)}k`;
                  }
                  return `$${price.toFixed(price < 1 ? 4 : 2)}`;
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={value => value}
                    formatter={(value: any) => {
                      if (typeof value === 'number') {
                        return new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: value < 1 ? 4 : 2,
                          maximumFractionDigits: value < 1 ? 6 : 2,
                        }).format(value);
                      }
                      return value;
                    }}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }
);

PriceHistoryChart.displayName = 'PriceHistoryChart';

export default PriceHistoryChart;
