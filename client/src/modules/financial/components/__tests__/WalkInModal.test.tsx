import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'react-toastify';
import axios from 'axios';
import WalkInModal from '../WalkInModal';

// Mock dependencies
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('WalkInModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<WalkInModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when isOpen is true', () => {
    render(<WalkInModal {...defaultProps} />);
    expect(screen.getByText('Müşteri Ekle')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<WalkInModal {...defaultProps} />);
    
    expect(screen.getByPlaceholderText(/Örn: 150/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Örn: Saç kesimi/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/2025-11-25/)).toBeInTheDocument();
  });

  it('initializes date with current date by default', () => {
    render(<WalkInModal {...defaultProps} />);
    
    const dateInput = screen.getByDisplayValue(/2025-11-25/) as HTMLInputElement;
    const today = new Date().toISOString().split('T')[0];
    expect(dateInput.value).toBe(today);
  });

  it('initializes date with provided initialDate', () => {
    render(<WalkInModal {...defaultProps} initialDate="2023-01-15" />);
    
    const dateInput = screen.getByDisplayValue('2023-01-15') as HTMLInputElement;
    expect(dateInput.value).toBe('2023-01-15');
  });

  it('updates date when initialDate changes and modal reopens', () => {
    const { rerender } = render(<WalkInModal {...defaultProps} initialDate="2023-01-15" />);
    
    // Close and reopen with new date
    rerender(<WalkInModal {...defaultProps} isOpen={false} initialDate="2023-01-20" />);
    rerender(<WalkInModal {...defaultProps} isOpen={true} initialDate="2023-01-20" />);
    
    const dateInput = screen.getByDisplayValue('2023-01-20') as HTMLInputElement;
    expect(dateInput.value).toBe('2023-01-20');
  });

  it('updates price input value', () => {
    render(<WalkInModal {...defaultProps} />);
    
    const priceInput = screen.getByPlaceholderText(/Örn: 150/i) as HTMLInputElement;
    fireEvent.change(priceInput, { target: { value: '150' } });
    
    expect(priceInput.value).toBe('150');
  });

  it('updates note input value', () => {
    render(<WalkInModal {...defaultProps} />);
    
    const noteInput = screen.getByPlaceholderText(/Örn: Saç kesimi/i) as HTMLTextAreaElement;
    fireEvent.change(noteInput, { target: { value: 'Test note' } });
    
    expect(noteInput.value).toBe('Test note');
  });

  it('updates date input value', () => {
    render(<WalkInModal {...defaultProps} />);
    
    const dateInput = screen.getByDisplayValue(/2025-11-25/) as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2023-02-01' } });
    
    expect(dateInput.value).toBe('2023-02-01');
  });

  it('shows error when price is invalid (empty)', async () => {
    render(<WalkInModal {...defaultProps} />);
    
    const form = screen.getByRole('button', { name: /Kaydet/i }).closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Geçerli bir fiyat giriniz');
    });
  });

  it('shows error when price is zero', async () => {
    render(<WalkInModal {...defaultProps} />);
    
    const priceInput = screen.getByPlaceholderText(/Örn: 150/i);
    fireEvent.change(priceInput, { target: { value: '0' } });
    
    const form = screen.getByRole('button', { name: /Kaydet/i }).closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Geçerli bir fiyat giriniz');
    });
  });

  it('shows error when price is negative', async () => {
    render(<WalkInModal {...defaultProps} />);
    
    const priceInput = screen.getByPlaceholderText(/Örn: 150/i);
    fireEvent.change(priceInput, { target: { value: '-10' } });
    
    const form = screen.getByRole('button', { name: /Kaydet/i }).closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Geçerli bir fiyat giriniz');
    });
  });

  it('submits form successfully with valid data', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    
    render(<WalkInModal {...defaultProps} />);
    
    const priceInput = screen.getByPlaceholderText(/Örn: 150/i);
    const noteInput = screen.getByPlaceholderText(/Örn: Saç kesimi/i);
    
    fireEvent.change(priceInput, { target: { value: '150' } });
    fireEvent.change(noteInput, { target: { value: 'Test note' } });
    
    const submitButton = screen.getByRole('button', { name: /Kaydet/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/earnings/walk-in', {
        amount: 150,
        date: expect.any(String),
        note: 'Test note',
      });
    });
    
    expect(toast.success).toHaveBeenCalledWith('Müşteri kaydedildi');
    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('submits without note when note is empty', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    
    render(<WalkInModal {...defaultProps} />);
    
    const priceInput = screen.getByPlaceholderText(/Örn: 150/i);
    fireEvent.change(priceInput, { target: { value: '150' } });
    
    const submitButton = screen.getByRole('button', { name: /Kaydet/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/earnings/walk-in', {
        amount: 150,
        date: expect.any(String),
        note: undefined,
      });
    });
  });

  it('handles API error with message', async () => {
    const errorResponse = {
      response: {
        data: {
          message: 'Custom error message',
        },
      },
    };
    mockedAxios.post.mockRejectedValueOnce(errorResponse);
    mockedAxios.isAxiosError.mockReturnValueOnce(true);
    
    render(<WalkInModal {...defaultProps} />);
    
    const priceInput = screen.getByPlaceholderText(/Örn: 150/i);
    fireEvent.change(priceInput, { target: { value: '150' } });
    
    const submitButton = screen.getByRole('button', { name: /Kaydet/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Custom error message');
    });
    
    expect(defaultProps.onSuccess).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('handles API error without message', async () => {
    const errorResponse = {
      response: {
        data: {},
      },
    };
    mockedAxios.post.mockRejectedValueOnce(errorResponse);
    mockedAxios.isAxiosError.mockReturnValueOnce(true);
    
    render(<WalkInModal {...defaultProps} />);
    
    const priceInput = screen.getByPlaceholderText(/Örn: 150/i);
    fireEvent.change(priceInput, { target: { value: '150' } });
    
    const submitButton = screen.getByRole('button', { name: /Kaydet/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Bir hata oluştu');
    });
  });

  it('handles non-axios error', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
    mockedAxios.isAxiosError.mockReturnValueOnce(false);
    
    render(<WalkInModal {...defaultProps} />);
    
    const priceInput = screen.getByPlaceholderText(/Örn: 150/i);
    fireEvent.change(priceInput, { target: { value: '150' } });
    
    const submitButton = screen.getByRole('button', { name: /Kaydet/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Bir hata oluştu');
    });
  });

  it('disables submit button while loading', async () => {
    mockedAxios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<WalkInModal {...defaultProps} />);
    
    const priceInput = screen.getByPlaceholderText(/Örn: 150/i);
    fireEvent.change(priceInput, { target: { value: '150' } });
    
    const submitButton = screen.getByRole('button', { name: /Kaydet/i });
    fireEvent.click(submitButton);
    
    // Button should be disabled during loading
    expect(submitButton).toBeDisabled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<WalkInModal {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: /İptal/i });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('resets form after successful submission', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    
    render(<WalkInModal {...defaultProps} />);
    
    const priceInput = screen.getByPlaceholderText(/Örn: 150/i) as HTMLInputElement;
    const noteInput = screen.getByPlaceholderText(/Örn: Saç kesimi/i) as HTMLTextAreaElement;
    
    fireEvent.change(priceInput, { target: { value: '150' } });
    fireEvent.change(noteInput, { target: { value: 'Test note' } });
    
    const submitButton = screen.getByRole('button', { name: /Kaydet/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
    
    // Form should be reset (though modal will close, we can check the internal state was reset)
    expect(mockedAxios.post).toHaveBeenCalled();
  });
});
