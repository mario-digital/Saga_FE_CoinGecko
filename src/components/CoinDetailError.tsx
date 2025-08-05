/**
 * Error state component for coin detail page
 */

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { CoinNotFoundError } from '@/hooks/useCoinDetail';

interface CoinDetailErrorProps {
  error: Error;
  retry?: () => void;
}

export const CoinDetailError: FC<CoinDetailErrorProps> = ({ error, retry }) => {
  const router = useRouter();
  const is404 = error instanceof CoinNotFoundError;

  return (
    <div className="container mx-auto px-4 py-8">
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>
          {is404 ? 'Coin Not Found' : 'Error Loading Coin Data'}
        </AlertTitle>
        <AlertDescription className="mt-2">
          {is404
            ? 'The cryptocurrency you are looking for does not exist or has been removed.'
            : 'Failed to load coin data. Please check your connection and try again.'}
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
        {!is404 && retry && <Button onClick={retry}>Try Again</Button>}
      </div>
    </div>
  );
};
