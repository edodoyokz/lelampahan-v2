import fs from 'node:fs';
import path from 'node:path';
import nextConfig from '../../next.config';

describe('production asset configuration', () => {
  it('allows the production CDN host for Next image optimization', () => {
    expect(nextConfig.images?.remotePatterns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          protocol: 'https',
          hostname: 'cdn.lelampahan.tech',
          pathname: '/**',
        }),
      ])
    );
  });

  it('ships a favicon.ico at the public root', () => {
    const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico');
    expect(fs.existsSync(faviconPath)).toBe(true);
    expect(fs.statSync(faviconPath).size).toBeGreaterThan(0);
  });
});
