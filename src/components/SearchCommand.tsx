'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { SearchCoin } from '@/types/coingecko';
import { cn } from '@/lib/utils';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchResults: SearchCoin[] | undefined;
  isSearching: boolean;
  searchError: string | null;
  onSearch: (query: string) => void;
  onSelectCoin: (coinId: string) => void;
  className?: string;
}

export function SearchCommand({
  open,
  onOpenChange,
  searchResults,
  isSearching,
  searchError,
  onSearch,
  onSelectCoin,
  className,
}: SearchCommandProps): JSX.Element {
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleSelect = (coinId: string) => {
    onSelectCoin(coinId);
    onOpenChange(false);
    setQuery('');
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className={cn('max-w-2xl', className)}
    >
      <CommandInput
        placeholder="Search cryptocurrencies..."
        value={query}
        onValueChange={handleSearch}
      />
      <CommandList>
        {searchError && (
          <div className="px-2 py-6 text-center text-sm text-destructive">
            {searchError}
          </div>
        )}
        {isSearching && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        )}
        {!isSearching && !searchError && query && (
          <>
            <CommandEmpty>No cryptocurrencies found.</CommandEmpty>
            {searchResults && searchResults.length > 0 && (
              <CommandGroup heading="Cryptocurrencies">
                {searchResults.map(coin => (
                  <CommandItem
                    key={coin.id}
                    value={`${coin.name} ${coin.symbol}`}
                    onSelect={() => handleSelect(coin.id)}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={coin.thumb}
                      alt={coin.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{coin.name}</span>
                      <span className="text-xs text-muted-foreground uppercase">
                        {coin.symbol}
                      </span>
                    </div>
                    {coin.market_cap_rank && (
                      <div className="ml-auto text-xs text-muted-foreground">
                        #{coin.market_cap_rank}
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
        {!query && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            <Search className="mx-auto mb-2 h-6 w-6" />
            Start typing to search cryptocurrencies...
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
