import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={mockOnPageChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders pagination with correct page numbers', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('handles previous page click', async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );

    const previousButton = screen.getByText('Previous');
    await user.click(previousButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
  });

  it('handles next page click', async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(4);
    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
  });

  it('handles specific page click', async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );

    const pageButton = screen.getByText('5');
    await user.click(pageButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(5);
    expect(mockOnPageChange).toHaveBeenCalledTimes(1);
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );

    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
    expect(previousButton).toHaveClass('cursor-not-allowed');
  });

  it('disables next button on last page', () => {
    render(
      <Pagination
        currentPage={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );

    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
    expect(nextButton).toHaveClass('cursor-not-allowed');
  });

  it('does not call onPageChange when disabled', async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        onPageChange={mockOnPageChange}
        disabled={true}
      />
    );

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it('does not call onPageChange when clicking current page', async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );

    const currentPageButton = screen.getByLabelText('Page 3');
    await user.click(currentPageButton);

    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it('shows ellipsis and first page when current page is far from start', () => {
    render(
      <Pagination
        currentPage={8}
        totalPages={15}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getAllByText('...')).toHaveLength(2);
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows ellipsis and last page when current page is far from end', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={15}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-pagination';
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
        className={customClass}
      />
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass(customClass);
  });

  it('has proper ARIA attributes', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Pagination Navigation');

    const currentPageButton = screen.getByLabelText('Page 3');
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');

    const previousButton = screen.getByText('Previous');
    expect(previousButton).toHaveAttribute('aria-label', 'Previous page');

    const nextButton = screen.getByText('Next');
    expect(nextButton).toHaveAttribute('aria-label', 'Next page');
  });

  it('highlights current page correctly', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );

    const currentPageButton = screen.getByLabelText('Page 3');
    expect(currentPageButton).toHaveClass('bg-primary-600');
    expect(currentPageButton).toHaveClass('text-white');
  });

  it('handles edge case with very few pages', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('does not show first page button when already in range', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );

    const firstPageButtons = screen.getAllByText('1');
    expect(firstPageButtons).toHaveLength(1);
  });

  it('does not show last page button when already in range', () => {
    render(
      <Pagination
        currentPage={9}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );

    const lastPageButtons = screen.getAllByText('10');
    expect(lastPageButtons).toHaveLength(1);
  });

  it('handles clicking first page when showing ellipsis', async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        currentPage={8}
        totalPages={15}
        onPageChange={mockOnPageChange}
      />
    );

    const firstPageButton = screen.getByText('1');
    await user.click(firstPageButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('handles clicking last page when showing ellipsis', async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        currentPage={3}
        totalPages={15}
        onPageChange={mockOnPageChange}
      />
    );

    const lastPageButton = screen.getByText('15');
    await user.click(lastPageButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(15);
  });
});
