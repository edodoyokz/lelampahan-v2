// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  describe('label rendering', () => {
    it('renders the label text', () => {
      render(<Input label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('associates label with input via htmlFor', () => {
      render(<Input label="Username" />);
      const input = screen.getByLabelText('Username');
      expect(input).toHaveAttribute('id', 'username');
    });

    it('uses custom id when provided', () => {
      render(<Input label="Email" id="custom-email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('id', 'custom-email');
    });
  });

  describe('error state styling', () => {
    it('displays error message when error prop is provided', () => {
      render(<Input label="Email" error="Email is required" />);
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('applies red border class when in error state', () => {
      render(<Input label="Email" error="Invalid email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveClass('border-red-500');
    });

    it('applies default border class when no error', () => {
      render(<Input label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveClass('border-gray-300');
    });

    it('sets aria-invalid to true when error is present', () => {
      render(<Input label="Email" error="Required" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-invalid to false when no error', () => {
      render(<Input label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('links error message via aria-describedby', () => {
      render(<Input label="Email" error="Required" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');
    });
  });

  describe('helper text display', () => {
    it('displays helper text when provided', () => {
      render(<Input label="Password" helperText="Must be at least 8 characters" />);
      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });

    it('does not display helper text when error is present', () => {
      render(
        <Input label="Password" helperText="Must be 8 chars" error="Too short" />
      );
      expect(screen.queryByText('Must be 8 chars')).not.toBeInTheDocument();
      expect(screen.getByText('Too short')).toBeInTheDocument();
    });

    it('links helper text via aria-describedby', () => {
      render(<Input label="Password" helperText="Hint text" />);
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('aria-describedby', 'password-helper');
    });
  });

  describe('focus ring styling', () => {
    it('has focus ring classes for gold color', () => {
      render(<Input label="Name" />);
      const input = screen.getByLabelText('Name');
      expect(input).toHaveClass('focus:ring-2');
      expect(input).toHaveClass('focus:ring-lelampahan-gold/50');
      expect(input).toHaveClass('focus:border-lelampahan-gold');
    });
  });

  describe('props forwarding', () => {
    it('forwards placeholder prop to input', () => {
      render(<Input label="Email" placeholder="you@example.com" />);
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    });

    it('forwards type prop to input', () => {
      render(<Input label="Password" type="password" />);
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('forwards disabled prop to input', () => {
      render(<Input label="Email" disabled />);
      const input = screen.getByLabelText('Email');
      expect(input).toBeDisabled();
    });
  });
});
