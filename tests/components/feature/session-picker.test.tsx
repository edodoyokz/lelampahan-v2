// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionPicker, type Session } from '@/components/feature/session-picker';

const sessions: Session[] = [
  {
    id: 'session-1',
    startsAt: new Date('2025-03-15T09:00:00Z'),
    capacity: 20,
    remainingCapacity: 15,
    ticketTypes: [{ id: 'tt-1', name: 'Regular', price: 150000 }],
  },
  {
    id: 'session-2',
    startsAt: new Date('2025-03-16T09:00:00Z'),
    capacity: 10,
    remainingCapacity: 0,
    ticketTypes: [{ id: 'tt-2', name: 'VIP', price: 300000 }],
  },
];

const defaultProps = {
  sessions,
  timezone: 'Asia/Jakarta',
  onSelect: vi.fn(),
};

describe('SessionPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renders sessions with correct date format', () => {
    it('displays formatted date for each session', () => {
      render(<SessionPicker {...defaultProps} />);
      // Session dates should be rendered in Indonesian locale
      // 2025-03-15 in Asia/Jakarta (UTC+7) = Sabtu, 15 Mar 2025
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
      // Check that date text is present (Indonesian locale format)
      expect(screen.getByText(/15 Mar/i)).toBeInTheDocument();
      expect(screen.getByText(/16 Mar/i)).toBeInTheDocument();
    });

    it('displays remaining capacity for available sessions', () => {
      render(<SessionPicker {...defaultProps} />);
      expect(screen.getByText('15 tersisa')).toBeInTheDocument();
    });
  });

  describe('disables full-capacity sessions', () => {
    it('shows "Kuota penuh" for sessions with remainingCapacity === 0', () => {
      render(<SessionPicker {...defaultProps} />);
      expect(screen.getByText('Kuota penuh')).toBeInTheDocument();
    });

    it('disables the button for full sessions', () => {
      render(<SessionPicker {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      // The second session button should be disabled
      const fullSessionButton = buttons.find(
        (btn) => btn.getAttribute('aria-disabled') === 'true'
      ) as HTMLButtonElement | undefined;
      expect(fullSessionButton).toBeDefined();
      expect(fullSessionButton).toBeDisabled();
    });

    it('does not expand ticket types when clicking a disabled session', () => {
      render(<SessionPicker {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      const fullSessionButton = buttons.find(
        (btn) => btn.getAttribute('aria-disabled') === 'true'
      ) as HTMLButtonElement | undefined;
      fireEvent.click(fullSessionButton!);
      // VIP ticket type should not appear
      expect(screen.queryByText('VIP')).not.toBeInTheDocument();
    });
  });

  describe('expand/collapse behavior', () => {
    it('expands ticket types when clicking an available session', () => {
      render(<SessionPicker {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      // Click the first session (available)
      const availableButton = buttons.find(
        (btn) => btn.getAttribute('aria-expanded') === 'false' && !(btn as HTMLButtonElement).disabled
      ) as HTMLButtonElement | undefined;
      fireEvent.click(availableButton!);
      // Ticket type should now be visible
      expect(screen.getByText('Regular')).toBeInTheDocument();
      expect(screen.getByText(/150\.000/)).toBeInTheDocument();
    });

    it('collapses ticket types when clicking the same session again', () => {
      render(<SessionPicker {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      const availableButton = buttons.find(
        (btn) => btn.getAttribute('aria-expanded') === 'false' && !(btn as HTMLButtonElement).disabled
      ) as HTMLButtonElement | undefined;
      // Expand
      fireEvent.click(availableButton!);
      expect(screen.getByText('Regular')).toBeInTheDocument();
      // Collapse
      fireEvent.click(availableButton!);
      expect(screen.queryByText('Regular')).not.toBeInTheDocument();
    });
  });

  describe('calls onSelect with correct IDs', () => {
    it('calls onSelect with sessionId and ticketTypeId when "Pesan" is clicked', () => {
      const onSelect = vi.fn();
      render(<SessionPicker {...defaultProps} onSelect={onSelect} />);
      // Expand the first session
      const buttons = screen.getAllByRole('button');
      const availableButton = buttons.find(
        (btn) => btn.getAttribute('aria-expanded') === 'false' && !(btn as HTMLButtonElement).disabled
      ) as HTMLButtonElement | undefined;
      fireEvent.click(availableButton!);
      // Click the "Pesan" button
      const pesanButton = screen.getByRole('button', { name: 'Pesan' });
      fireEvent.click(pesanButton);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('session-1', 'tt-1');
    });
  });

  describe('empty state', () => {
    it('shows empty message when no sessions are provided', () => {
      render(<SessionPicker sessions={[]} timezone="Asia/Jakarta" onSelect={vi.fn()} />);
      expect(screen.getByText('Jadwal belum tersedia')).toBeInTheDocument();
    });

    it('does not render session buttons when empty', () => {
      render(<SessionPicker sessions={[]} timezone="Asia/Jakarta" onSelect={vi.fn()} />);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });
  });
});
