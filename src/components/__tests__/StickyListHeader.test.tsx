import React from 'react';
import { render, screen } from '@testing-library/react';
import { StickyListHeader } from '../StickyListHeader';

describe('StickyListHeader', () => {
  it('renders children content', () => {
    render(
      <StickyListHeader>
        <div>Header Content</div>
      </StickyListHeader>
    );

    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('applies sticky positioning classes', () => {
    const { container } = render(
      <StickyListHeader>
        <div>Sticky Header</div>
      </StickyListHeader>
    );

    const header = container.firstChild;
    expect(header).toHaveClass('sticky', 'top-14', 'z-20');
  });

  it('applies background and border classes', () => {
    const { container } = render(
      <StickyListHeader>
        <div>Header</div>
      </StickyListHeader>
    );

    const header = container.firstChild;
    expect(header).toHaveClass('border-b', 'border-gray-200');
  });

  it('renders multiple children', () => {
    render(
      <StickyListHeader>
        <div>First Child</div>
        <div>Second Child</div>
        <span>Third Child</span>
      </StickyListHeader>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();
  });

  it('maintains header structure', () => {
    const { container } = render(
      <StickyListHeader>
        <h1>Title</h1>
      </StickyListHeader>
    );

    const title = container.querySelector('h1');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Title');
  });
});
