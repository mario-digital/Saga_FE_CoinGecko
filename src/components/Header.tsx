'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { SearchCommand } from '@/components/SearchCommand';
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cryptocurrency Market
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time cryptocurrency prices and market data
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search trigger button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm text-gray-500 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <Search className="w-4 h-4 mr-2" />
                Search coins...
                <kbd className="ml-2 hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-300 border border-gray-400 rounded-lg">
                  ⌘K
                </kbd>
              </button>
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
