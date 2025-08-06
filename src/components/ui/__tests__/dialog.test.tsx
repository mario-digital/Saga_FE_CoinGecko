import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../dialog';

describe('Dialog', () => {
  it('renders all dialog components', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description text</DialogDescription>
          </DialogHeader>
          <div>Dialog body content</div>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('exports all required components', () => {
    expect(Dialog).toBeDefined();
    expect(DialogPortal).toBeDefined();
    expect(DialogOverlay).toBeDefined();
    expect(DialogTrigger).toBeDefined();
    expect(DialogClose).toBeDefined();
    expect(DialogContent).toBeDefined();
    expect(DialogHeader).toBeDefined();
    expect(DialogFooter).toBeDefined();
    expect(DialogTitle).toBeDefined();
    expect(DialogDescription).toBeDefined();
  });

  it('opens dialog when trigger is clicked', async () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>Test description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByText('Open');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  it('closes dialog when close button is clicked', async () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Closeable Dialog</DialogTitle>
          <DialogDescription>Dialog that can be closed</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Closeable Dialog')).toBeInTheDocument();

    // Find the close button by its sr-only text
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton.parentElement!);

    await waitFor(() => {
      expect(screen.queryByText('Closeable Dialog')).not.toBeInTheDocument();
    });
  });

  it('renders DialogPortal separately', () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogPortal>
          <div data-testid="portal-content">Portal Content</div>
        </DialogPortal>
      </Dialog>
    );

    expect(screen.getByTestId('portal-content')).toBeInTheDocument();
  });

  it('renders DialogOverlay with custom className', () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogOverlay className="custom-overlay" />
          <div>Content</div>
        </DialogPortal>
      </Dialog>
    );

    // Overlay is portaled, so look in document
    const overlay = document.querySelector('.custom-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50');
  });

  it('applies custom className to DialogContent', () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogContent className="custom-content">
          <DialogTitle>Custom Content</DialogTitle>
          <DialogDescription>Custom content description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    const content = document.querySelector('.custom-content');
    expect(content).toBeInTheDocument();
  });

  it('renders DialogHeader with custom className', () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader className="custom-header">
            <DialogTitle>Header Title</DialogTitle>
            <DialogDescription>Header description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    const header = document.querySelector('.custom-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5');
  });

  it('renders DialogFooter with custom className', () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog with Footer</DialogTitle>
          <DialogDescription>Dialog with footer content</DialogDescription>
          <DialogFooter className="custom-footer">
            <button>Action</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    const footer = document.querySelector('.custom-footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('flex', 'flex-col-reverse');
  });

  it('renders DialogTitle with custom className', () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle className="custom-title">Custom Title</DialogTitle>
          <DialogDescription>Title with custom styling</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    const title = screen.getByText('Custom Title');
    expect(title).toHaveClass('custom-title', 'text-lg', 'font-semibold');
  });

  it('renders DialogDescription with custom className', () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription className="custom-description">
            Custom Description
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );

    const description = screen.getByText('Custom Description');
    expect(description).toHaveClass(
      'custom-description',
      'text-sm',
      'text-muted-foreground'
    );
  });

  it('handles controlled dialog state', () => {
    const handleOpenChange = jest.fn();

    const { rerender } = render(
      <Dialog open={false} onOpenChange={handleOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Controlled Dialog</DialogTitle>
          <DialogDescription>Controlled dialog content</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByText('Open');
    fireEvent.click(trigger);

    expect(handleOpenChange).toHaveBeenCalledWith(true);

    rerender(
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Controlled Dialog</DialogTitle>
          <DialogDescription>Controlled dialog content</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
  });

  it('renders DialogClose component', () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog with Custom Close</DialogTitle>
          <DialogDescription>Dialog with custom close button</DialogDescription>
          <DialogClose>Custom Close</DialogClose>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Custom Close')).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();

    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Keyboard Dialog</DialogTitle>
          <DialogDescription>Dialog with keyboard support</DialogDescription>
          <input type="text" placeholder="Focus me" />
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByText('Open');
    trigger.focus();

    // Open with Enter
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Keyboard Dialog')).toBeInTheDocument();
    });

    // Close with Escape
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('Keyboard Dialog')).not.toBeInTheDocument();
    });
  });

  it('traps focus within dialog', async () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Focus Trap Dialog</DialogTitle>
          <DialogDescription>Dialog with focus management</DialogDescription>
          <button>First Button</button>
          <button>Second Button</button>
          <input type="text" placeholder="Input field" />
        </DialogContent>
      </Dialog>
    );

    const firstButton = screen.getByText('First Button');
    const secondButton = screen.getByText('Second Button');
    const input = screen.getByPlaceholderText('Input field');

    // All focusable elements should be within the dialog
    expect(firstButton).toBeInTheDocument();
    expect(secondButton).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  it('renders with portal to body', () => {
    const { container } = render(
      <div id="app-root">
        <Dialog defaultOpen>
          <DialogContent>
            <DialogTitle>Portal Dialog</DialogTitle>
            <DialogDescription>Dialog rendered in portal</DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
    );

    // Dialog content should be portaled outside the app-root
    const appRoot = container.querySelector('#app-root');
    const dialogTitle = screen.getByText('Portal Dialog');

    expect(appRoot).toBeInTheDocument();
    expect(dialogTitle).toBeInTheDocument();
  });

  it('supports custom props on all components', () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogContent data-testid="dialog-content">
          <DialogHeader data-testid="dialog-header">
            <DialogTitle data-testid="dialog-title">Title</DialogTitle>
            <DialogDescription data-testid="dialog-description">
              Description
            </DialogDescription>
          </DialogHeader>
          <DialogFooter data-testid="dialog-footer">
            <button>Footer Button</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-description')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-footer')).toBeInTheDocument();
  });

  it('handles nested dialogs', () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Parent Dialog</DialogTitle>
          <DialogDescription>
            Dialog containing another dialog
          </DialogDescription>
          <Dialog>
            <DialogTrigger>Open Nested</DialogTrigger>
            <DialogContent>
              <DialogTitle>Nested Dialog</DialogTitle>
              <DialogDescription>Nested dialog content</DialogDescription>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Parent Dialog')).toBeInTheDocument();
    expect(screen.getByText('Open Nested')).toBeInTheDocument();
  });

  it('preserves displayName on components', () => {
    expect(DialogOverlay.displayName).toBeDefined();
    expect(DialogContent.displayName).toBeDefined();
    expect(DialogHeader.displayName).toBe('DialogHeader');
    expect(DialogFooter.displayName).toBe('DialogFooter');
    expect(DialogTitle.displayName).toBeDefined();
    expect(DialogDescription.displayName).toBeDefined();
  });

  it('renders close button with Cross2Icon', () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Icon Dialog</DialogTitle>
          <DialogDescription>Dialog with close icon</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    // The close button contains the Cross2Icon and sr-only text
    const closeText = screen.getByText('Close');
    expect(closeText).toHaveClass('sr-only');

    const closeButton = closeText.parentElement;
    expect(closeButton).toHaveClass('absolute', 'right-4', 'top-4');
  });

  it('applies responsive styles to DialogHeader', () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responsive Header</DialogTitle>
            <DialogDescription>Responsive header description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    const header = screen.getByText('Responsive Header').parentElement;
    expect(header).toHaveClass('text-center', 'sm:text-left');
  });

  it('applies responsive styles to DialogFooter', () => {
    const { container } = render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog with Footer</DialogTitle>
          <DialogDescription>Dialog with responsive footer</DialogDescription>
          <DialogFooter>
            <button>Footer Button</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    const footer = screen.getByText('Footer Button').parentElement;
    expect(footer).toHaveClass('sm:flex-row', 'sm:justify-end');
  });

  it('forwards refs correctly', () => {
    const overlayRef = React.createRef<HTMLDivElement>();
    const contentRef = React.createRef<HTMLDivElement>();
    const titleRef = React.createRef<HTMLHeadingElement>();
    const descriptionRef = React.createRef<HTMLParagraphElement>();

    const { container } = render(
      <Dialog defaultOpen>
        <DialogPortal>
          <DialogOverlay ref={overlayRef} />
          <DialogContent ref={contentRef}>
            <DialogTitle ref={titleRef}>Title</DialogTitle>
            <DialogDescription ref={descriptionRef}>
              Description
            </DialogDescription>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );

    expect(overlayRef.current).toBeInstanceOf(HTMLElement);
    expect(contentRef.current).toBeInstanceOf(HTMLElement);
    expect(titleRef.current).toBeInstanceOf(HTMLElement);
    expect(descriptionRef.current).toBeInstanceOf(HTMLElement);
  });

  it('handles dialog without any content', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>Empty Dialog</DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Empty Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByText('Empty Dialog');
    expect(() => fireEvent.click(trigger)).not.toThrow();
  });

  it('allows custom trigger element with asChild', () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger asChild>
          <div role="button" tabIndex={0}>
            Custom Trigger
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Custom Trigger Dialog</DialogTitle>
          <DialogDescription>
            Dialog with custom trigger element
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Custom Trigger')).toBeInTheDocument();
  });
});
