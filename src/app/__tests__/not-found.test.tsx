import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotFound from '../not-found';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Home: ({ className }: { className?: string }) => (
    <svg data-testid="home-icon" className={className} />
  ),
  Search: ({ className }: { className?: string }) => (
    <svg data-testid="search-icon" className={className} />
  ),
  TrendingUp: ({ className }: { className?: string }) => (
    <svg data-testid="trending-icon" className={className} />
  ),
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild,
    variant,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    variant?: string;
  }) => {
    if (asChild && React.isValidElement(children)) {
      const elementProps = variant ? { 'data-variant': variant } : {};
      return React.cloneElement(children as React.ReactElement, elementProps);
    }
    const buttonProps = variant ? { 'data-variant': variant } : {};
    return <button {...buttonProps}>{children}</button>;
  },
}));

describe('NotFound', () => {
  beforeEach(() => {
    render(<NotFound />);
  });

  describe('Error Display', () => {
    it('should display 404 error code', () => {
      const errorCode = screen.getByText('404');
      expect(errorCode).toBeInTheDocument();
      expect(errorCode).toHaveClass('text-6xl', 'font-bold');
    });

    it('should display page not found heading', () => {
      const heading = screen.getByText('Page Not Found');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-2xl', 'font-semibold');
    });

    it('should display descriptive error message', () => {
      const description = screen.getByText(
        /The page you're looking for doesn't exist/
      );
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-gray-600', 'dark:text-gray-400');
    });
  });

  describe('Navigation Links', () => {
    it('should render homepage link with correct href', () => {
      const homepageLink = screen.getByRole('link', {
        name: /Go to Homepage/i,
      });
      expect(homepageLink).toBeInTheDocument();
      expect(homepageLink).toHaveAttribute('href', '/');
    });

    it('should render top coins link with correct href and filter', () => {
      const topCoinsLink = screen.getByRole('link', {
        name: /View Top Coins/i,
      });
      expect(topCoinsLink).toBeInTheDocument();
      expect(topCoinsLink).toHaveAttribute('href', '/?filter=top10');
    });

    it('should display home icon in homepage button', () => {
      const homeIcon = screen.getByTestId('home-icon');
      expect(homeIcon).toBeInTheDocument();
      expect(homeIcon).toHaveClass('w-4', 'h-4');
    });

    it('should display trending icon in top coins button', () => {
      const trendingIcon = screen.getByTestId('trending-icon');
      expect(trendingIcon).toBeInTheDocument();
      expect(trendingIcon).toHaveClass('w-4', 'h-4');
    });
  });

  describe('Search Tip Section', () => {
    it('should display search tip message', () => {
      const searchTip = screen.getByText(
        /Try searching for a specific cryptocurrency/
      );
      expect(searchTip).toBeInTheDocument();
      expect(searchTip).toHaveClass('text-sm', 'text-gray-500');
    });

    it('should display search icon in tip section', () => {
      const searchIcon = screen.getByTestId('search-icon');
      expect(searchIcon).toBeInTheDocument();
      expect(searchIcon).toHaveClass('w-4', 'h-4');
    });

    it('should have proper border styling for tip section', () => {
      const tipSection = screen
        .getByText(/Try searching for a specific cryptocurrency/)
        .closest('div');
      expect(tipSection).toHaveClass('pt-6', 'border-t', 'border-gray-200');
    });
  });

  describe('Layout and Styling', () => {
    it('should have proper container styling', () => {
      const container = screen.getByText('404').closest('div')
        ?.parentElement?.parentElement;
      expect(container).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'min-h-[70vh]',
        'px-4'
      );
    });

    it('should have max width constraint on content', () => {
      const contentContainer = screen
        .getByText('404')
        .closest('div')?.parentElement;
      expect(contentContainer).toHaveClass(
        'text-center',
        'space-y-6',
        'max-w-md'
      );
    });

    it('should have responsive button layout', () => {
      const buttonContainer = screen.getByRole('link', {
        name: /Go to Homepage/i,
      }).parentElement;
      expect(buttonContainer).toHaveClass(
        'flex',
        'flex-col',
        'sm:flex-row',
        'gap-3',
        'justify-center'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have accessible link labels', () => {
      const homepageLink = screen.getByRole('link', {
        name: /Go to Homepage/i,
      });
      const topCoinsLink = screen.getByRole('link', {
        name: /View Top Coins/i,
      });

      expect(homepageLink).toHaveAccessibleName();
      expect(topCoinsLink).toHaveAccessibleName();
    });

    it('should render semantic HTML structure', () => {
      const heading1 = screen.getByRole('heading', { level: 1 });
      const heading2 = screen.getByRole('heading', { level: 2 });

      expect(heading1).toHaveTextContent('404');
      expect(heading2).toHaveTextContent('Page Not Found');
    });

    it('should have proper text contrast classes for dark mode', () => {
      const errorCode = screen.getByText('404');
      const heading = screen.getByText('Page Not Found');
      const description = screen.getByText(
        /The page you're looking for doesn't exist/
      );

      expect(errorCode).toHaveClass('dark:text-white');
      expect(heading).toHaveClass('dark:text-gray-200');
      expect(description).toHaveClass('dark:text-gray-400');
    });
  });

  describe('Button Variants', () => {
    it('should render two action buttons', () => {
      const links = screen.getAllByRole('link');
      const actionLinks = links.filter(
        link =>
          link.textContent?.includes('Homepage') ||
          link.textContent?.includes('Top Coins')
      );
      expect(actionLinks).toHaveLength(2);
    });

    it('should have different button styles for each action', () => {
      const homepageLink = screen.getByRole('link', {
        name: /Go to Homepage/i,
      });
      const topCoinsLink = screen.getByRole('link', {
        name: /View Top Coins/i,
      });

      // Check that both buttons exist and are distinct
      expect(homepageLink).toBeInTheDocument();
      expect(topCoinsLink).toBeInTheDocument();
      expect(homepageLink).not.toBe(topCoinsLink);
    });
  });

  describe('Content Accuracy', () => {
    it('should display complete error description', () => {
      const description = screen.getByText(
        /The page you're looking for doesn't exist\. It might have been moved, deleted, or you may have typed the URL incorrectly\./
      );
      expect(description).toBeInTheDocument();
    });

    it('should display complete search tip', () => {
      const tip = screen.getByText(
        /Try searching for a specific cryptocurrency using the search feature/
      );
      expect(tip).toBeInTheDocument();
    });
  });
});
