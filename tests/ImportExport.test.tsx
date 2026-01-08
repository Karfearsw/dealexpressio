import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataImportModal from '../client/src/components/common/DataImportModal';
import React from 'react';
import axios from 'axios';
import { vi } from 'vitest';

// Mock axios
vi.mock('axios');

describe('DataImportModal', () => {
  it('renders correctly when open', () => {
    render(
      <DataImportModal
        isOpen={true}
        onClose={() => {}}
        endpoint="/api/test"
        onSuccess={() => {}}
        title="Test Import"
        templateFields={['name', 'email']}
      />
    );
    expect(screen.getByText('Test Import')).toBeInTheDocument();
    expect(screen.getByText(/Required columns: name, email/i)).toBeInTheDocument();
  });

  it('validates missing columns in CSV', async () => {
    render(
      <DataImportModal
        isOpen={true}
        onClose={() => {}}
        endpoint="/api/test"
        onSuccess={() => {}}
        title="Test Import"
        templateFields={['required_col']}
      />
    );

    const file = new File(['wrong_col\nvalue'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/Click to upload CSV/i);
    
    // Upload file
    fireEvent.change(input, { target: { files: [file] } });
    
    // Click import
    const importBtn = screen.getByText('Import Data');
    fireEvent.click(importBtn);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Missing required columns: required_col/i)).toBeInTheDocument();
    });
  });

  it('uploads valid CSV successfully', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    
    render(
      <DataImportModal
        isOpen={true}
        onClose={onClose}
        endpoint="/api/test"
        onSuccess={onSuccess}
        title="Test Import"
        templateFields={['name']}
      />
    );

    const file = new File(['name\nJohn'], 'valid.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/Click to upload CSV/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    (axios.post as any).mockResolvedValue({ data: { message: 'Success' } });

    const importBtn = screen.getByText('Import Data');
    fireEvent.click(importBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
