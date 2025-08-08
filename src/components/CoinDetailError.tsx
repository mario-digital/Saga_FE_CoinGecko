/**
 * Error state component for coin detail page
 */

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Clock, RefreshCw } from 'lucide-react';
import {
  CoinNotFoundError,
  RateLimitError,
  CorsError,
} from '@/hooks/useCoinDetail';

interface CoinDetailErrorProps {
  error: Error;
  retry?: () => void;
}

export const CoinDetailError: FC<CoinDetailErrorProps> = ({ error, retry }) => {
  const router = useRouter();
  const is404 = error instanceof CoinNotFoundError;
  const isRateLimit = error instanceof RateLimitError;
  const isCorsError = error instanceof CorsError;

  const [countdown, setCountdown] = useState<number>(
    isRateLimit && error.retryAfter ? error.retryAfter : 0
  );

  // Auto-retry for CORS errors after a delay
  const [corsRetryCountdown, setCorsRetryCountdown] = useState<number>(
    isCorsError ? 3 : 0
  );

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (corsRetryCountdown > 0) {
      const timer = setTimeout(() => {
        setCorsRetryCountdown(corsRetryCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (corsRetryCountdown === 0 && isCorsError && retry) {
      // Auto-retry when countdown reaches 0
      retry();
    }
  }, [corsRetryCountdown, isCorsError, retry]);

  const getErrorTitle = () => {
    if (is404) return 'Coin Not Found';
    if (isRateLimit) return 'Rate Limit Reached';
    if (isCorsError) return 'Connection Issue';
    return 'Error Loading Coin Data';
  };

  const getErrorDescription = () => {
    if (is404) {
      return 'The cryptocurrency you are looking for does not exist or has been removed.';
    }
    if (isRateLimit) {
      return (
        <div className="space-y-2">
          <div>{error.message}</div>
          {countdown > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>
                Please wait{' '}
                <strong className="text-foreground">{countdown}</strong> seconds
                before trying again
              </span>
            </div>
          )}
        </div>
      );
    }
    if (isCorsError) {
      return (
        <div className="space-y-2">
          <div>
            Having trouble connecting to CoinGecko API. This is usually
            temporary.
          </div>
          {corsRetryCountdown > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
          <div className="text-sm text-muted-foreground">
            If this persists, try refreshing the page or check if you have any
            browser extensions blocking requests.
          </div>
        </div>
      );
    }
    // Use the actual error message instead of generic one
    return (
      error.message ||
      'Failed to load coin data. Please check your connection and try again.'
    );
  };

  const canRetry = !is404 && !isRateLimit && !isCorsError && retry;
  const canRetryAfterCooldown = isRateLimit && retry; // Show button for rate limit if retry is provided
  const canRetryManuallyForCors =
    isCorsError && corsRetryCountdown === 0 && retry;

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert
        variant={isRateLimit || isCorsError ? 'default' : 'destructive'}
        className="max-w-2xl mx-auto"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{getErrorTitle()}</AlertTitle>
        <AlertDescription className="mt-2">
          {getErrorDescription()}
        </AlertDescription>
      </Alert>

      <div className="flex gap-4 justify-center mt-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
        {(canRetry || canRetryAfterCooldown || canRetryManuallyForCors) && (
          <Button
            onClick={retry}
            disabled={
              (isRateLimit && countdown > 0) ||
              (isCorsError && corsRetryCountdown > 0)
            }
            variant={
              (isRateLimit && countdown > 0) ||
              (isCorsError && corsRetryCountdown > 0)
                ? 'secondary'
                : 'default'
            }
          >
            {isRateLimit && countdown > 0
              ? `Wait ${countdown}s`
              : isCorsError && corsRetryCountdown > 0
                ? 'Auto-retrying...'
                : 'Try Again'}
          </Button>
        )}
      </div>
    </div>
  );
};
