'use client';

import { FC } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export interface FilterMarketCapProps {
  value: string;
  onChange: (value: string) => void;
}

const FilterMarketCap: FC<FilterMarketCapProps> = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={onChange}
        className="justify-start flex-wrap sm:flex-nowrap gap-2 sm:gap-3"
        aria-label="Filter coins by market cap"
      >
        <ToggleGroupItem
          value="all"
          aria-label="Show all coins"
          className="min-w-[80px] sm:min-w-[100px] px-3 sm:px-4 py-2 sm:py-2.5"
        >
          <span className="sm:hidden">All</span>
          <span className="hidden sm:inline">All Coins</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="top10"
          aria-label="Show top 10 coins"
          className="min-w-[80px] sm:min-w-[100px] px-3 sm:px-4 py-2 sm:py-2.5"
        >
          Top 10
        </ToggleGroupItem>
        <ToggleGroupItem
          value="top50"
          aria-label="Show top 50 coins"
          className="min-w-[80px] sm:min-w-[100px] px-3 sm:px-4 py-2 sm:py-2.5"
        >
          Top 50
        </ToggleGroupItem>
        <ToggleGroupItem
          value="top100"
          aria-label="Show top 100 coins"
          className="min-w-[80px] sm:min-w-[100px] px-3 sm:px-4 py-2 sm:py-2.5"
        >
          Top 100
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default FilterMarketCap;
