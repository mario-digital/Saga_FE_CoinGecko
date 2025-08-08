/**
 * Price history chart component with time range selector
 */

import { AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { FC, memo, useState, useEffect } from 'react';
import * as React from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts';

import { TimeRangeSelector } from '@/components/TimeRangeSelector';
import { Button } from '@/components/ui/button';
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
import { usePriceHistory, TimeRange } from '@/hooks/usePriceHistory';

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

    // CORS error detection and auto-retry timer
    const isCorsError =
      error?.toLowerCase().includes('cors') ||
      error?.toLowerCase().includes('network') ||
      error?.toLowerCase().includes('failed to fetch') ||
      error?.toLowerCase().includes('unable to connect to coingecko');
    const isRateLimited = error?.includes('Rate limit exceeded');

    const [corsRetryCountdown, setCorsRetryCountdown] = useState<number>(0);
    const [hasRetriedOnce, setHasRetriedOnce] = useState(false);

    // Reset retry flag when timeRange changes
    useEffect(() => {
      setHasRetriedOnce(false);
      setCorsRetryCountdown(0);
    }, [timeRange]);

    useEffect(() => {
      // Only set countdown if we have a CORS error and haven't retried yet
      if (isCorsError && error && !hasRetriedOnce) {
        setCorsRetryCountdown(45);
      }
    }, [error, isCorsError, hasRetriedOnce]);

    useEffect(() => {
      if (corsRetryCountdown > 0) {
        const timer = setTimeout(() => {
          setCorsRetryCountdown(corsRetryCountdown - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (
        corsRetryCountdown === 0 &&
        isCorsError &&
        !hasRetriedOnce &&
        retry
      ) {
        // Auto-retry ONCE when countdown reaches 0
        setHasRetriedOnce(true);
        retry();
      }
    }, [corsRetryCountdown, isCorsError, hasRetriedOnce, retry]);

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
              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  {isCorsError
                    ? 'Having trouble connecting to CoinGecko API. This is usually temporary.'
                    : error || 'Failed to load price history'}
                </p>
                {corsRetryCountdown > 0 && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>
                      Retrying automatically in{' '}
                      <strong className="text-foreground">
                        {corsRetryCountdown}
                      </strong>{' '}
                      seconds...
                    </span>
                  </div>
                )}
                {isCorsError && (
                  <p className="text-xs text-muted-foreground">
                    If this persists, try refreshing the page or check your
                    browser extensions.
                  </p>
                )}
                {isRateLimited && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span>Please wait before trying again</span>
                  </div>
                )}
              </div>
              {!isRateLimited && !isCorsError && (
                <Button onClick={retry} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
              {isCorsError && corsRetryCountdown === 0 && (
                <Button
                  onClick={() => {
                    setHasRetriedOnce(false);
                    setCorsRetryCountdown(45);
                    // Don't call retry() here - let the countdown effect handle it
                  }}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
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
