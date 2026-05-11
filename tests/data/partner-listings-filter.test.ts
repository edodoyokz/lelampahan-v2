import { describe, expect, it, vi, beforeEach } from 'vitest';
import { listListingsForPartner } from '@/data/listing';

const findMany = vi.fn();
const count = vi.fn();

vi.mock('@/db/prisma', () => ({
  prisma: { listing: { findMany: (...args: unknown[]) => findMany(...args), count: (...args: unknown[]) => count(...args) } },
}));

describe('listListingsForPartner', () => {
  beforeEach(() => { findMany.mockReset(); count.mockReset(); });

  it('filters partner listings by status on the server', async () => {
    findMany.mockResolvedValueOnce([]);
    count.mockResolvedValueOnce(0);

    await listListingsForPartner('p1', 'PUBLISHED', 2, 20);

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { partnerId: 'p1', status: 'PUBLISHED' },
      skip: 20,
      take: 20,
    }));
    expect(count).toHaveBeenCalledWith({ where: { partnerId: 'p1', status: 'PUBLISHED' } });
  });
});
