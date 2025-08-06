import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';

// Mock @radix-ui/react-tooltip
jest.mock('@radix-ui/react-tooltip', () => {
  const Provider = ({ children }: any) => (
    <div data-testid="tooltip-provider">{children}</div>
  );
  Provider.displayName = 'Tooltip.Provider';

  const Root = ({ children }: any) => (
    <div data-testid="tooltip-root">{children}</div>
  );
  Root.displayName = 'Tooltip.Root';

  const Trigger = React.forwardRef(
    ({ children, asChild, ...props }: any, ref: any) => {
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
          ...props,
          ref,
          'data-testid': 'tooltip-trigger',
        });
      }
      return (
        <button ref={ref} data-testid="tooltip-trigger" {...props}>
          {children}
        </button>
      );
    }
  );
  Trigger.displayName = 'Tooltip.Trigger';

  const Portal = ({ children }: any) => (
    <div data-testid="tooltip-portal">{children}</div>
  );
  Portal.displayName = 'Tooltip.Portal';

  const Content = React.forwardRef(
    ({ children, className, sideOffset = 4, ...props }: any, ref: any) => (
      <div
        ref={ref}
        className={className}
        data-testid="tooltip-content"
        data-side-offset={sideOffset}
        {...props}
      >
        {children}
      </div>
    )
  );
  Content.displayName = 'Tooltip.Content';

  return { Provider, Root, Trigger, Portal, Content };
});

describe('Tooltip Components', () => {
  describe('TooltipProvider', () => {
    it('renders provider with children', () => {
      render(
        <TooltipProvider>
          <div>Child content</div>
        </TooltipProvider>
      );

      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('renders tooltip root', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('tooltip-root')).toBeInTheDocument();
    });
  });

  describe('TooltipTrigger', () => {
    it('renders trigger element', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger ref={ref}>Button</TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('TooltipContent', () => {
    it('renders content with text', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover</TooltipTrigger>
            <TooltipContent>This is a tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('This is a tooltip')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipContent className="custom-tooltip">Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass('custom-tooltip');
    });

    it('applies default styling classes', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const content = screen.getByTestId('tooltip-content');
      expect(content.className).toContain('z-50');
      expect(content.className).toContain('rounded-md');
      expect(content.className).toContain('bg-primary');
      expect(content.className).toContain('text-primary-foreground');
    });

    it('uses default sideOffset', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('data-side-offset', '4');
    });

    it('accepts custom sideOffset', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipContent sideOffset={8}>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveAttribute('data-side-offset', '8');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipContent ref={ref}>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Integration', () => {
    it('renders complete tooltip setup', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Hover for info</button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This is helpful information</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-root')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
      expect(
        screen.getByText('This is helpful information')
      ).toBeInTheDocument();
    });

    it('supports multiple tooltips', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>First</TooltipTrigger>
            <TooltipContent>First tooltip</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>Second</TooltipTrigger>
            <TooltipContent>Second tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('First tooltip')).toBeInTheDocument();
      expect(screen.getByText('Second tooltip')).toBeInTheDocument();
    });
  });
});
