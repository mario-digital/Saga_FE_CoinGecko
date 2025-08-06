import {
  formatCurrency,
  formatLargeNumber,
  formatMarketCap,
  formatPercentage,
  getPercentageChangeColor,
  truncateText,
  debounce,
  cn,
  safeFormatCurrency,
  safeFormatMarketCap,
  safeFormatPercentage,
  sanitizeHTML,
  formatDate,
} from '../utils';

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('formats prices above $1 with 2 decimal places', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(45000)).toBe('$45,000.00');
    });

    it('formats prices below $1 with 6 decimal places', () => {
      expect(formatCurrency(0.123456)).toBe('$0.123456');
      expect(formatCurrency(0.000001)).toBe('$0.000001');
    });

    it('handles zero price', () => {
      expect(formatCurrency(0)).toBe('$0.000000');
    });

    it('supports different currencies', () => {
      expect(formatCurrency(100, 'EUR')).toBe('€100.00');
    });

    it('handles very large numbers', () => {
      expect(formatCurrency(1234567890.12)).toBe('$1,234,567,890.12');
    });
  });

  describe('formatLargeNumber', () => {
    it('formats numbers without prefix', () => {
      expect(formatLargeNumber(1500000000, false)).toBe('1.50B');
      expect(formatLargeNumber(2340000, false)).toBe('2.34M');
    });

    it('formats numbers with prefix', () => {
      expect(formatLargeNumber(1500000000, true)).toBe('$1.50B');
      expect(formatLargeNumber(2340000, true)).toBe('$2.34M');
    });

    it('handles small numbers', () => {
      expect(formatLargeNumber(500000, false)).toBe('500,000');
      expect(formatLargeNumber(1234, true)).toBe('$1,234');
    });
  });

  describe('formatMarketCap', () => {
    it('formats trillions correctly', () => {
      expect(formatMarketCap(1500000000000)).toBe('$1.50T');
      expect(formatMarketCap(2340000000000)).toBe('$2.34T');
    });

    it('formats billions correctly', () => {
      expect(formatMarketCap(850000000000)).toBe('$850.00B');
      expect(formatMarketCap(1200000000)).toBe('$1.20B');
    });

    it('formats millions correctly', () => {
      expect(formatMarketCap(750000000)).toBe('$750.00M');
      expect(formatMarketCap(1500000)).toBe('$1.50M');
    });

    it('formats smaller numbers with locale formatting', () => {
      expect(formatMarketCap(500000)).toBe('$500,000');
      expect(formatMarketCap(1234)).toBe('$1,234');
    });

    it('handles zero market cap', () => {
      expect(formatMarketCap(0)).toBe('$0');
    });

    it('handles edge cases at boundaries', () => {
      expect(formatMarketCap(999999999999)).toBe('$1000.00B');
      expect(formatMarketCap(1000000000000)).toBe('$1.00T');
      expect(formatMarketCap(999999999)).toBe('$1000.00M');
      expect(formatMarketCap(1000000000)).toBe('$1.00B');
    });
  });

  describe('formatPercentage', () => {
    it('formats positive changes with plus sign', () => {
      expect(formatPercentage(2.5)).toBe('+2.50%');
      expect(formatPercentage(0.1)).toBe('+0.10%');
    });

    it('formats negative changes with minus sign', () => {
      expect(formatPercentage(-3.2)).toBe('-3.20%');
      expect(formatPercentage(-0.05)).toBe('-0.05%');
    });

    it('formats zero change', () => {
      expect(formatPercentage(0)).toBe('+0.00%');
    });

    it('handles very small changes', () => {
      expect(formatPercentage(0.001)).toBe('+0.00%');
      expect(formatPercentage(-0.001)).toBe('-0.00%');
    });

    it('handles large changes', () => {
      expect(formatPercentage(150.789)).toBe('+150.79%');
      expect(formatPercentage(-99.999)).toBe('-100.00%');
    });
  });

  describe('getPercentageChangeColor', () => {
    it('returns success color for positive changes', () => {
      expect(getPercentageChangeColor(2.5)).toBe('text-success');
      expect(getPercentageChangeColor(0.01)).toBe('text-success');
    });

    it('returns danger color for negative changes', () => {
      expect(getPercentageChangeColor(-3.2)).toBe('text-danger');
      expect(getPercentageChangeColor(-0.01)).toBe('text-danger');
    });

    it('returns gray color for zero change', () => {
      expect(getPercentageChangeColor(0)).toBe(
        'text-gray-600 dark:text-gray-400'
      );
    });

    it('returns gray color for null or undefined', () => {
      expect(getPercentageChangeColor(null)).toBe(
        'text-gray-600 dark:text-gray-400'
      );
      expect(getPercentageChangeColor(undefined)).toBe(
        'text-gray-600 dark:text-gray-400'
      );
    });

    it('returns gray color for NaN', () => {
      expect(getPercentageChangeColor(NaN)).toBe(
        'text-gray-600 dark:text-gray-400'
      );
    });
  });

  describe('truncateText', () => {
    it('truncates text longer than maxLength', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is a ...');
      expect(truncateText('Hello World', 5)).toBe('Hello...');
    });

    it('returns original text when shorter than maxLength', () => {
      expect(truncateText('Short', 10)).toBe('Short');
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('returns original text when exactly maxLength', () => {
      expect(truncateText('Exactly10!', 10)).toBe('Exactly10!');
    });

    it('handles empty strings', () => {
      expect(truncateText('', 5)).toBe('');
    });

    it('handles zero maxLength', () => {
      expect(truncateText('Hello', 0)).toBe('...');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('delays function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('cancels previous calls when called multiple times', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      debouncedFn('second');
      debouncedFn('third');

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('handles multiple arguments', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2', 'arg3');
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('works with different wait times', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 200);

      debouncedFn('test');

      jest.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('test');
    });
  });

  describe('cn', () => {
    it('joins valid class names', () => {
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('filters out falsy values', () => {
      expect(cn('class1', null, 'class2', undefined, 'class3', false)).toBe(
        'class1 class2 class3'
      );
    });

    it('handles empty input', () => {
      expect(cn()).toBe('');
    });

    it('handles all falsy values', () => {
      expect(cn(null, undefined, false, '')).toBe('');
    });

    it('handles single class name', () => {
      expect(cn('single-class')).toBe('single-class');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const isDisabled = false;

      expect(
        cn('base-class', isActive && 'active', isDisabled && 'disabled')
      ).toBe('base-class active');
    });
  });

  describe('safeFormatCurrency', () => {
    it('formats valid numbers', () => {
      expect(safeFormatCurrency(100)).toBe('$100.00');
      expect(safeFormatCurrency(0.5)).toBe('$0.500000');
    });

    it('returns N/A for null', () => {
      expect(safeFormatCurrency(null)).toBe('N/A');
    });

    it('returns N/A for undefined', () => {
      expect(safeFormatCurrency(undefined)).toBe('N/A');
    });

    it('returns N/A for NaN', () => {
      expect(safeFormatCurrency(NaN)).toBe('N/A');
    });

    it('supports different currencies', () => {
      expect(safeFormatCurrency(100, 'EUR')).toBe('€100.00');
    });
  });

  describe('safeFormatMarketCap', () => {
    it('formats valid numbers', () => {
      expect(safeFormatMarketCap(1000000000)).toBe('$1.00B');
      expect(safeFormatMarketCap(500000)).toBe('$500,000');
    });

    it('returns N/A for null', () => {
      expect(safeFormatMarketCap(null)).toBe('N/A');
    });

    it('returns N/A for undefined', () => {
      expect(safeFormatMarketCap(undefined)).toBe('N/A');
    });

    it('returns N/A for NaN', () => {
      expect(safeFormatMarketCap(NaN)).toBe('N/A');
    });
  });

  describe('safeFormatPercentage', () => {
    it('formats valid numbers', () => {
      expect(safeFormatPercentage(2.5)).toBe('+2.50%');
      expect(safeFormatPercentage(-1.5)).toBe('-1.50%');
    });

    it('returns 0.00% for null', () => {
      expect(safeFormatPercentage(null)).toBe('0.00%');
    });

    it('returns 0.00% for undefined', () => {
      expect(safeFormatPercentage(undefined)).toBe('0.00%');
    });

    it('returns 0.00% for NaN', () => {
      expect(safeFormatPercentage(NaN)).toBe('0.00%');
    });
  });

  describe('sanitizeHTML', () => {
    it('removes HTML tags', () => {
      expect(sanitizeHTML('<p>Hello</p>')).toBe('Hello');
      expect(sanitizeHTML('<div>Test<span>Content</span></div>')).toBe(
        'TestContent'
      );
    });

    it('handles plain text', () => {
      expect(sanitizeHTML('Plain text')).toBe('Plain text');
    });

    it('handles empty string', () => {
      expect(sanitizeHTML('')).toBe('');
    });

    it('handles complex HTML', () => {
      // The browser's DOMParser removes script content for security
      const result = sanitizeHTML('<script>alert("xss")</script>Safe text');
      expect(result).toBe('Safe text');
    });

    it('handles self-closing tags', () => {
      expect(sanitizeHTML('Text<br/>More text')).toBe('TextMore text');
    });
  });

  describe('formatDate', () => {
    it('formats ISO date string', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      // Check it's a valid date string
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('formats date with different formats', () => {
      const result = formatDate('2023-12-25');
      // Check it's a valid date string
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      // Should contain Dec for December
      expect(result).toMatch(/Dec|12/);
    });
  });
});
