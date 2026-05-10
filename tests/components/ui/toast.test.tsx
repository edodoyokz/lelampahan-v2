// @vitest-environment jsdom
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/ui/toast';

// Helper component that uses useToast to trigger toasts in tests
function ToastTrigger({
  type = 'success',
  message = 'Test message',
  duration,
}: {
  type?: 'success' | 'error' | 'info';
  message?: string;
  duration?: number;
}) {
  const { showToast } = useToast();
  return (
    <button
      onClick={() => showToast({ type, message, duration })}
      data-testid="trigger"
    >
      Show Toast
    </button>
  );
}

describe('Toast notification system', () => {
  describe('ToastProvider', () => {
    it('renders children correctly', () => {
      render(
        <ToastProvider>
          <div data-testid="child">Hello</div>
        </ToastProvider>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByTestId('child')).toHaveTextContent('Hello');
    });
  });

  describe('showToast', () => {
    it('displays a toast message when showToast is called', () => {
      render(
        <ToastProvider>
          <ToastTrigger message="Operation successful" type="success" />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('trigger'));

      expect(screen.getByText('Operation successful')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('displays multiple toasts when showToast is called multiple times', () => {
      render(
        <ToastProvider>
          <ToastTrigger message="First toast" type="info" />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('trigger'));
      fireEvent.click(screen.getByTestId('trigger'));

      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBe(2);
    });
  });

  describe('auto-dismiss', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('auto-dismisses toast after default duration (3000ms)', () => {
      render(
        <ToastProvider>
          <ToastTrigger message="Will disappear" type="success" />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByText('Will disappear')).toBeInTheDocument();

      // Advance past the default 3000ms duration
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // After duration, the toast becomes invisible (translate-x-full opacity-0)
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('opacity-0');

      // Advance past the 300ms animation removal
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('auto-dismisses toast after custom duration', () => {
      render(
        <ToastProvider>
          <ToastTrigger message="Quick toast" type="info" duration={1000} />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('trigger'));
      expect(screen.getByText('Quick toast')).toBeInTheDocument();

      // Should still be visible before custom duration
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByText('Quick toast')).toBeInTheDocument();

      // Advance past the custom 1000ms duration
      act(() => {
        vi.advanceTimersByTime(500);
      });

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('opacity-0');

      // Advance past the 300ms animation removal
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('type variant styling', () => {
    it('success toast has green styling classes', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="success" message="Success!" />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('trigger'));

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-green-100');
      expect(alert).toHaveClass('border-green-500');
      expect(alert).toHaveClass('text-green-800');
    });

    it('error toast has red styling classes', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="error" message="Error!" />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('trigger'));

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-red-100');
      expect(alert).toHaveClass('border-red-500');
      expect(alert).toHaveClass('text-red-800');
    });

    it('info toast has blue styling classes', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="info" message="Info!" />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('trigger'));

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('bg-blue-100');
      expect(alert).toHaveClass('border-blue-500');
      expect(alert).toHaveClass('text-blue-800');
    });
  });

  describe('useToast hook', () => {
    it('throws error when used outside ToastProvider', () => {
      // Suppress console.error for expected error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      function BadComponent() {
        useToast();
        return <div>Should not render</div>;
      }

      expect(() => render(<BadComponent />)).toThrow(
        'useToast must be used within a ToastProvider'
      );

      consoleSpy.mockRestore();
    });
  });
});
