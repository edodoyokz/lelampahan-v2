function randomSuffix(length = 4): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function makeSlug(title: string, existingSlugs: string[]): string {
  const base = generateSlug(title);
  if (!existingSlugs.includes(base)) return base;
  let candidate: string;
  do {
    candidate = `${base}-${randomSuffix()}`;
  } while (existingSlugs.includes(candidate));
  return candidate;
}
