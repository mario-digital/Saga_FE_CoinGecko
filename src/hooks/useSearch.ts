/**
 * Custom hook for cryptocurrency search functionality
 * Implements debounced search with SWR integration
 */

import { useState, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { SearchResponse, SearchCoin } from '@/types/coingecko';
import { api } from '@/lib/api';
import { debounce } from '@/lib/utils';

interface UseSearchReturn {
  searchQuery: string;
  searchResults: SearchCoin[] | undefined;
  isSearching: boolean;
  searchError: string | null;
  setSearchQuery: (_query: string) => void;
  clearSearch: () => void;
}

const SEARCH_DEBOUNCE_MS = 400;
const MIN_SEARCH_LENGTH = 2;

export const useSearch = (): UseSearchReturn => {
  const [searchQuery, setSearchQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query changes
  const debouncedSetQuery = useMemo(
    () =>
      debounce((query: string) => {
        setDebouncedQuery(query);
      }, SEARCH_DEBOUNCE_MS),
    []
  );

  const setSearchQuery = useCallback(
    (query: string) => {
      setSearchQueryState(query);
      if (query.trim().length >= MIN_SEARCH_LENGTH) {
        debouncedSetQuery(query.trim());
      } else {
        setDebouncedQuery('');
      }
    },
    [debouncedSetQuery]
  );

  const clearSearch = useCallback(() => {
    setSearchQueryState('');
    setDebouncedQuery('');
  }, []);

  // Build search key only if we have a valid debounced query
  const searchKey = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < MIN_SEARCH_LENGTH) {
      return null;
    }
    return `search-${debouncedQuery}`;
  }, [debouncedQuery]);

  // Fetch search results using SWR
  const {
    data: searchResponse,
    error,
    isLoading,
  } = useSWR<SearchResponse>(
    searchKey,
    searchKey ? () => api.searchCoins(debouncedQuery) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // 30 seconds
      errorRetryCount: 2,
      errorRetryInterval: 1000,
    }
  );

  // Extract coins from search response
  const searchResults = useMemo(() => {
    return searchResponse?.coins;
  }, [searchResponse]);

  // Determine if we're currently searching
  const isSearching = useMemo(() => {
    return isLoading && !!searchKey;
  }, [isLoading, searchKey]);

  // Format error message
  const searchError = useMemo(() => {
    if (!error) return null;
    if (error.status === 429) {
      return 'Too many search requests. Please wait a moment and try again.';
    }
    if (error.status >= 500) {
      return 'Search service is temporarily unavailable. Please try again later.';
    }
    return (
      error.message || 'An error occurred while searching. Please try again.'
    );
  }, [error]);

  return {
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    setSearchQuery,
    clearSearch,
  };
};
