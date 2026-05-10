/**
 * Formats a number as IDR currency string.
 * Output: "Rp 150.000" (with space after Rp, using Indonesian locale separators)
 */
export function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}
