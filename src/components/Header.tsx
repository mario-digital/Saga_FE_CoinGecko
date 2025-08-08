'use client';

import { Search, Menu, X, Home, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { SearchCommand } from '@/components/SearchCommand';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSearch } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

export function Header(): ReactNode {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    searchQuery: _searchQuery,
    searchResults,
    isSearching,
    searchError,
    setSearchQuery,
    clearSearch,
  } = useSearch();

  const handleSelectCoin = (coinId: string) => {
    router.push(`/coin?id=${coinId}`);
    clearSearch();
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900 backdrop-blur-md shadow-lg shadow-gray-100/50 dark:shadow-none border-b border-gray-200/50 dark:border-gray-800">
        <div className="container py-2 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Title - responsive text */}
            <div className="flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                <span className="hidden sm:inline">Cryptocurrency Market</span>
                <span className="sm:hidden">Crypto Market</span>
              </h1>
              <p className="hidden sm:block text-gray-600 dark:text-gray-400 mt-1">
                Real-time cryptocurrency prices and market data
              </p>
            </div>

            {/* Desktop navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              {/* Search trigger button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:from-gray-100 hover:to-gray-150 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
              >
                <Search className="w-4 h-4 mr-2" />
                Search coins...
                <kbd className="ml-2 hidden md:inline-block px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-300 dark:bg-gray-700 border border-gray-400 dark:border-gray-600 rounded-lg">
                  ⌘K
                </kbd>
              </button>

              {/* Theme toggle */}
              <ThemeToggle />
            </div>

            {/* Mobile menu button and search */}
            <div className="flex items-center gap-2 sm:hidden">
              {/* Mobile search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile theme toggle */}
              <ThemeToggle />

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        <div
          className={cn(
            'sm:hidden border-t border-gray-200 dark:border-gray-700 transition-all duration-200 overflow-hidden',
            mobileMenuOpen ? 'max-h-64' : 'max-h-0'
          )}
        >
          <nav className="px-4 py-2 space-y-1">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              href="/?filter=top10"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Top 10 Coins
            </Link>
            <button
              onClick={() => {
                setSearchOpen(true);
                closeMobileMenu();
              }}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-left"
            >
              <Search className="w-4 h-4" />
              Search Coins
            </button>
          </nav>
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
