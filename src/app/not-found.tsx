import Link from 'next/link';
import { Home, Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* 404 Error */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Page Not Found
          </h2>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist. It might have been moved, deleted, 
          or you may have typed the URL incorrectly.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/" className="gap-2">
              <Home className="w-4 h-4" />
              Go to Homepage
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/?filter=top10" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              View Top Coins
            </Link>
          </Button>
        </div>

        {/* Helpful tip */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            Try searching for a specific cryptocurrency using the search feature
          </p>
        </div>
      </div>
    </div>
  );
}