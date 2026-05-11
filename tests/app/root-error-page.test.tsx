// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import RootError from '../../app/error';

describe('Root error boundary', () => {
  it('renders a global fallback with retry action', () => {
    const reset = vi.fn();

    render(<RootError error={new Error('Boom')} reset={reset} />);

    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    expect(screen.getByText(/Coba muat ulang halaman/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Coba Lagi' })).toBeInTheDocument();
  });
});
