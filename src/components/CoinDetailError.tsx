/**
 * Error state component for coin detail page
 */

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import { CoinNotFoundError, RateLimitError } from '@/hooks/useCoinDetail';

interface CoinDetailErrorProps {
  error: Error;
  retry?: () => void;
}

export const CoinDetailError: FC<CoinDetailErrorProps> = ({ error, retry }) => {
  const router = useRouter();
  const is404 = error instanceof CoinNotFoundError;
  const isRateLimit = error instanceof RateLimitError;

  const [countdown, setCountdown] = useState<number>(
    isRateLimit && error.retryAfter ? error.retryAfter : 0
  );

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const getErrorTitle = () => {
    if (is404) return 'Coin Not Found';
    if (isRateLimit) return 'Rate Limit Reached';
    return 'Error Loading Coin Data';
  };

  const getErrorDescription = () => {
    if (is404) {
      return 'The cryptocurrency you are looking for does not exist or has been removed.';
    }
    if (isRateLimit) {
      return (
        <div className="space-y-2">
          <p>{error.message}</p>
          {countdown > 0 && (
            <p className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              You can try again in {countdown} seconds
            </p>
          )}
        </div>
      );
    }
    return 'Failed to load coin data. Please check your connection and try again.';
  };

  const canRetry = !is404 && !isRateLimit && retry;
  const canRetryAfterCooldown = isRateLimit && countdown === 0 && retry;

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert
        variant={isRateLimit ? 'default' : 'destructive'}
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
        {(canRetry || canRetryAfterCooldown) && (
          <Button onClick={retry} disabled={isRateLimit && countdown > 0}>
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};
