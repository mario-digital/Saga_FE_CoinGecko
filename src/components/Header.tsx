'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { SearchCommand } from '@/components/SearchCommand';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSearch } from '@/hooks/useSearch';

export function Header(): ReactNode {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  const {
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    setSearchQuery,
    clearSearch,
  } = useSearch();

  const handleSelectCoin = (coinId: string) => {
    router.push(`/${coinId}`);
    clearSearch();
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cryptocurrency Market
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time cryptocurrency prices and market data
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search trigger button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <Search className="w-4 h-4 mr-2" />
                Search coins...
                <kbd className="ml-2 hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-300 dark:bg-gray-700 border border-gray-400 dark:border-gray-600 rounded-lg">
                  ⌘K
                </kbd>
              </button>

              {/* Theme toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Search Command Dialog */}
      <SearchCommand
        open={searchOpen}
        onOpenChange={setSearchOpen}
        searchResults={searchResults}
        isSearching={isSearching}
        searchError={searchError}
        onSearch={setSearchQuery}
        onSelectCoin={handleSelectCoin}
      />
    </>
  );
}
