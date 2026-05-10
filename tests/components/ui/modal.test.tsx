// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/components/ui/modal';

describe('Modal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    title: 'Test Modal',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('open/close behavior', () => {
    it('renders nothing when open is false', () => {
      const { container } = render(
        <Modal open={false} onClose={vi.fn()} title="Hidden Modal" />
      );
      expect(container.innerHTML).toBe('');
    });

    it('renders content when open is true', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('title and description', () => {
    it('shows the title', () => {
      render(<Modal {...defaultProps} title="My Title" />);
      expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('shows the description when provided', () => {
      render(
        <Modal {...defaultProps} description="Some description text" />
      );
      expect(screen.getByText('Some description text')).toBeInTheDocument();
    });

    it('does not render description element when not provided', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.queryByText('modal-description')).not.toBeInTheDocument();
    });
  });

  describe('Escape key', () => {
    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(<Modal open={true} onClose={onClose} title="Escape Test" />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('backdrop click', () => {
    it('calls onClose when clicking the backdrop', () => {
      const onClose = vi.fn();
      render(<Modal open={true} onClose={onClose} title="Backdrop Test" />);
      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
      fireEvent.click(backdrop!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('confirm button', () => {
    it('calls confirm onClick when confirm button is clicked', () => {
      const confirmClick = vi.fn();
      render(
        <Modal
          {...defaultProps}
          actions={{
            confirm: {
              label: 'Confirm',
              variant: 'primary',
              onClick: confirmClick,
            },
          }}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
      expect(confirmClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancel button', () => {
    it('calls cancel onClick when cancel button is clicked', () => {
      const cancelClick = vi.fn();
      render(
        <Modal
          {...defaultProps}
          actions={{
            confirm: {
              label: 'Confirm',
              variant: 'primary',
              onClick: vi.fn(),
            },
            cancel: { label: 'Cancel', onClick: cancelClick },
          }}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(cancelClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button has no onClick handler', () => {
      const onClose = vi.fn();
      render(
        <Modal
          open={true}
          onClose={onClose}
          title="Cancel Fallback"
          actions={{
            confirm: {
              label: 'Confirm',
              variant: 'primary',
              onClick: vi.fn(),
            },
            cancel: { label: 'Cancel' },
          }}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
