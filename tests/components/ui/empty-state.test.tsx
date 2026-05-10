// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '@/components/ui/empty-state';

// Mock next/link to render a simple anchor tag
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('EmptyState', () => {
  it('renders title text', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <EmptyState title="No items" description="Try adjusting your filters" />
    );
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="No items" />);
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('renders illustration when provided', () => {
    render(
      <EmptyState
        title="Empty"
        illustration={<svg data-testid="illustration" />}
      />
    );
    expect(screen.getByTestId('illustration')).toBeInTheDocument();
  });

  it('renders CTA button with correct label', () => {
    render(
      <EmptyState
        title="No orders"
        action={{ label: 'Jelajahi Listing', onClick: () => {} }}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Jelajahi Listing' })
    ).toBeInTheDocument();
  });

  it('calls onClick handler when CTA button is clicked', () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="No orders"
        action={{ label: 'Browse', onClick: handleClick }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Browse' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders CTA as a link when href is provided', () => {
    render(
      <EmptyState
        title="No tickets"
        action={{ label: 'Explore', href: '/marketplace' }}
      />
    );
    const link = screen.getByRole('link', { name: 'Explore' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/marketplace');
  });
});
