// @vitest-environment jsdom
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CheckoutSummary } from '@/components/feature/checkout-summary';

const baseProps = {
  listingName: 'Borobudur Sunrise Tour',
  sessionDate: 'Sabtu, 15 Maret 2025, 09.00',
  ticketType: 'Regular',
  quantity: 2,
  totalPrice: 300000,
};

describe('CheckoutSummary', () => {
  describe('order summary card', () => {
    it('renders listing name', () => {
      render(<CheckoutSummary {...baseProps} />);
      expect(screen.getByText('Borobudur Sunrise Tour')).toBeInTheDocument();
    });

    it('renders session date', () => {
      render(<CheckoutSummary {...baseProps} />);
      expect(screen.getByText('Sabtu, 15 Maret 2025, 09.00')).toBeInTheDocument();
    });

    it('renders ticket type', () => {
      render(<CheckoutSummary {...baseProps} />);
      expect(screen.getByText('Regular')).toBeInTheDocument();
    });

    it('renders quantity', () => {
      render(<CheckoutSummary {...baseProps} />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders total price formatted as IDR', () => {
      render(<CheckoutSummary {...baseProps} />);
      // formatIDR(300000) → "Rp 300.000"
      expect(screen.getByText('Rp 300.000')).toBeInTheDocument();
    });

    it('renders "Ringkasan Pesanan" heading', () => {
      render(<CheckoutSummary {...baseProps} />);
      expect(screen.getByText('Ringkasan Pesanan')).toBeInTheDocument();
    });
  });

  describe('QRIS payment section', () => {
    it('does not render QRIS section when qrisUrl is not provided', () => {
      render(<CheckoutSummary {...baseProps} />);
      expect(screen.queryByText('Pembayaran QRIS')).not.toBeInTheDocument();
    });

    it('renders QRIS section when qrisUrl and expiresAt are provided', () => {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      render(
        <CheckoutSummary
          {...baseProps}
          qrisUrl="https://example.com/qr.png"
          expiresAt={expiresAt}
        />
      );
      expect(screen.getByText('Pembayaran QRIS')).toBeInTheDocument();
    });

    it('renders QR code image when qrisUrl is provided', () => {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      render(
        <CheckoutSummary
          {...baseProps}
          qrisUrl="https://example.com/qr.png"
          expiresAt={expiresAt}
        />
      );
      const qrImage = screen.getByAltText('QRIS Kode QR');
      expect(qrImage).toBeInTheDocument();
      expect(qrImage.getAttribute('src')).toContain(encodeURIComponent('https://example.com/qr.png'));
    });

    it('renders countdown timer when not expired', () => {
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      render(
        <CheckoutSummary
          {...baseProps}
          qrisUrl="https://example.com/qr.png"
          expiresAt={expiresAt}
        />
      );
      expect(screen.getByText(/Selesaikan pembayaran dalam/i)).toBeInTheDocument();
    });
  });

  describe('expired state', () => {
    it('shows expired message when expiresAt is in the past', () => {
      const expiresAt = new Date(Date.now() - 1000); // already expired
      render(
        <CheckoutSummary
          {...baseProps}
          qrisUrl="https://example.com/qr.png"
          expiresAt={expiresAt}
        />
      );
      expect(screen.getByText(/Waktu pembayaran habis/i)).toBeInTheDocument();
    });

    it('renders retry button when onRetry is provided and expired', () => {
      const expiresAt = new Date(Date.now() - 1000);
      const onRetry = vi.fn();
      render(
        <CheckoutSummary
          {...baseProps}
          qrisUrl="https://example.com/qr.png"
          expiresAt={expiresAt}
          onRetry={onRetry}
        />
      );
      const retryButton = screen.getByRole('button', { name: /Buat Pembayaran Baru/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', () => {
      const expiresAt = new Date(Date.now() - 1000);
      const onRetry = vi.fn();
      render(
        <CheckoutSummary
          {...baseProps}
          qrisUrl="https://example.com/qr.png"
          expiresAt={expiresAt}
          onRetry={onRetry}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Buat Pembayaran Baru/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('auto-expire via countdown', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('transitions to expired state when countdown reaches zero', () => {
      const expiresAt = new Date(Date.now() + 2000); // 2 seconds from now
      render(
        <CheckoutSummary
          {...baseProps}
          qrisUrl="https://example.com/qr.png"
          expiresAt={expiresAt}
          onRetry={vi.fn()}
        />
      );

      // Initially shows countdown
      expect(screen.getByText(/Selesaikan pembayaran dalam/i)).toBeInTheDocument();

      // Advance past expiry
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.getByText(/Waktu pembayaran habis/i)).toBeInTheDocument();
    });
  });
});
