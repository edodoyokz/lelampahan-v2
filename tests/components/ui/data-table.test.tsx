// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { DataTable, type Column } from '@/components/ui/data-table';

interface TestItem {
  id: number;
  name: string;
  status: string;
}

const columns: Column<TestItem>[] = [
  { key: 'name', header: 'Name', render: (item) => item.name },
  { key: 'status', header: 'Status', render: (item) => item.status },
];

const sampleData: TestItem[] = [
  { id: 1, name: 'Item One', status: 'Active' },
  { id: 2, name: 'Item Two', status: 'Inactive' },
];

describe('DataTable', () => {
  describe('desktop table view', () => {
    it('renders a table with headers and rows', () => {
      const { container } = render(<DataTable columns={columns} data={sampleData} />);

      // Table headers exist within the table
      const table = container.querySelector('table')!;
      expect(table.querySelector('th')).toBeInTheDocument();
      expect(table).toHaveTextContent('Name');
      expect(table).toHaveTextContent('Status');

      // Table data
      expect(table).toHaveTextContent('Item One');
      expect(table).toHaveTextContent('Active');
      expect(table).toHaveTextContent('Item Two');
      expect(table).toHaveTextContent('Inactive');
    });

    it('renders desktop table container with hidden md:block classes', () => {
      const { container } = render(<DataTable columns={columns} data={sampleData} />);
      const desktopView = container.querySelector('.hidden.md\\:block');
      expect(desktopView).toBeInTheDocument();
    });

    it('renders a <table> element inside desktop view', () => {
      const { container } = render(<DataTable columns={columns} data={sampleData} />);
      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('mobile card list view', () => {
    it('renders mobile card container with md:hidden class', () => {
      const { container } = render(<DataTable columns={columns} data={sampleData} />);
      const mobileView = container.querySelector('.md\\:hidden');
      expect(mobileView).toBeInTheDocument();
    });

    it('renders default card layout when no mobileCardRender provided', () => {
      const { container } = render(<DataTable columns={columns} data={sampleData} />);
      const mobileView = container.querySelector('.md\\:hidden');
      // Each item gets a card with column headers as labels
      const cards = mobileView?.querySelectorAll('.rounded-lg.border');
      expect(cards).toHaveLength(2);
    });

    it('uses custom mobileCardRender when provided', () => {
      const mobileCardRender = (item: TestItem) => (
        <div data-testid={`mobile-card-${item.id}`}>{item.name}</div>
      );

      render(
        <DataTable
          columns={columns}
          data={sampleData}
          mobileCardRender={mobileCardRender}
        />
      );

      expect(screen.getByTestId('mobile-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-card-2')).toBeInTheDocument();
    });

    it('hides columns marked with hideOnMobile in default card view', () => {
      const columnsWithHidden: Column<TestItem>[] = [
        { key: 'name', header: 'Name', render: (item) => item.name },
        { key: 'status', header: 'Status', render: (item) => item.status, hideOnMobile: true },
      ];

      const { container } = render(
        <DataTable columns={columnsWithHidden} data={[sampleData[0]]} />
      );

      const mobileView = container.querySelector('.md\\:hidden');
      const labels = mobileView?.querySelectorAll('.text-xs.font-medium');
      const labelTexts = Array.from(labels ?? []).map((el) => el.textContent);

      expect(labelTexts).toContain('Name');
      expect(labelTexts).not.toContain('Status');
    });
  });

  describe('loading state', () => {
    it('shows skeleton loaders when loading', () => {
      render(<DataTable columns={columns} data={[]} loading />);

      const skeletons = screen.getAllByRole('status');
      expect(skeletons.length).toBeGreaterThan(0);
      skeletons.forEach((skeleton) => {
        expect(skeleton).toHaveAttribute('aria-label', 'Loading table row');
      });
    });

    it('does not render table or cards when loading', () => {
      const { container } = render(<DataTable columns={columns} data={[]} loading />);
      expect(container.querySelector('table')).not.toBeInTheDocument();
      expect(container.querySelector('.md\\:hidden')).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('displays default empty state when data is empty', () => {
      render(<DataTable columns={columns} data={[]} />);
      expect(screen.getByText('Tidak ada data')).toBeInTheDocument();
    });

    it('displays custom empty state props', () => {
      render(
        <DataTable
          columns={columns}
          data={[]}
          emptyState={{
            title: 'No items found',
            description: 'Try adjusting your filters',
          }}
        />
      );

      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
    });

    it('does not render table or cards when empty', () => {
      const { container } = render(<DataTable columns={columns} data={[]} />);
      expect(container.querySelector('table')).not.toBeInTheDocument();
      expect(container.querySelector('.md\\:hidden')).not.toBeInTheDocument();
    });
  });
});
