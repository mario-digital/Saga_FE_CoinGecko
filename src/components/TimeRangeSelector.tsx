/**
 * Time range selector component for price history chart
 */

import { FC } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TimeRange } from '@/hooks/usePriceHistory';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1Y' },
];

export const TimeRangeSelector: FC<TimeRangeSelectorProps> = ({
  value,
  onChange,
}) => {
  const handleValueChange = (newValue: string) => {
    if (newValue) {
      onChange(newValue as TimeRange);
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={handleValueChange}
      className="justify-start gap-1 sm:gap-2"
    >
      {timeRangeOptions.map(option => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={`Select ${option.label} time range`}
          className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};
