import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders landing page when user is not authenticated', async () => {
    // Mock /auth/me to return 401
    (axios.get as any).mockRejectedValue({ response: { status: 401 } });

    render(<App />);

    // Wait for loading to finish and check for Landing page element
    await waitFor(() => {
        expect(screen.getByText(/Wholesale Real Estate/i)).toBeInTheDocument();
        // Check for Sign In link
        expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();
    });
  });

  it('renders dashboard when user is authenticated', async () => {
    // Mock /auth/me to return a user
    (axios.get as any).mockResolvedValue({ 
        data: { 
            user: { id: 1, email: 'test@example.com', role: 'admin' } 
        } 
    });

    render(<App />);

    // Wait for loading to finish and check for Dashboard content
    await waitFor(() => {
        expect(screen.getByText(/System Status & Active Jobs/i)).toBeInTheDocument();
    });
  });

  it('renders 404 page for unknown routes when authenticated', async () => {
    // Mock authenticated user
    (axios.get as any).mockResolvedValue({ 
        data: { 
            user: { id: 1, email: 'test@example.com', role: 'admin' } 
        } 
    });
    
    // Set invalid location
    window.history.pushState({}, 'Test', '/some-invalid-route');
    
    render(<App />);

    await waitFor(() => {
        expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
        expect(screen.getByText(/The page you are looking for doesn't exist/i)).toBeInTheDocument();
    });
  });
});
