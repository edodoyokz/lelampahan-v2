// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import ScannerPage from '../../app/partner/scanner/page';

describe('Partner scanner page', () => {
  it('renders demo note and camera action', () => {
    render(<ScannerPage />);
    expect(screen.getByText('Validasi manual saat ini berjalan dalam mode demo.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aktifkan Kamera' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Validasi' })).toBeDisabled();
  });
});
