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
        className="justify-start flex-col sm:flex-row"
        aria-label="Filter coins by market cap"
      >
        <ToggleGroupItem value="all" aria-label="Show all coins">
          All
        </ToggleGroupItem>
        <ToggleGroupItem value="top10" aria-label="Show top 10 coins">
          Top 10
        </ToggleGroupItem>
        <ToggleGroupItem value="top50" aria-label="Show top 50 coins">
          Top 50
        </ToggleGroupItem>
        <ToggleGroupItem value="top100" aria-label="Show top 100 coins">
          Top 100
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default FilterMarketCap;
