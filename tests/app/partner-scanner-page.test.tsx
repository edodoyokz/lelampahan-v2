// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import ScannerPage from '../../app/partner/scanner/page';

describe('Partner scanner page', () => {
  it('renders scanner and manual validation actions', () => {
    render(<ScannerPage />);
    expect(screen.getByText('Pemindai Tiket')).toBeInTheDocument();
    expect(screen.getByText('Input Manual')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aktifkan Kamera' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Validasi' })).toBeDisabled();
  });
});
