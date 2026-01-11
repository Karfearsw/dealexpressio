import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import * as AuthContext from '@/context/AuthContext';
import * as Wouter from 'wouter';

// Mock image
vi.mock('@/assets/logo-white.png', () => ({ default: 'logo.png' }));

// Mock AuthContext
const mockLogin = vi.fn();
vi.mock('@/context/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
        user: null,
        loading: false,
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
        requires2FA: false,
        verify2FA: vi.fn(),
    })
}));

// Mock Wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', async () => {
    const actual = await vi.importActual('wouter');
    return {
        ...actual,
        useLocation: () => ['/login', mockSetLocation],
        Link: ({ children, ...props }: any) => <a {...props}>{children}</a>
    };
});

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form', () => {
        render(<Login />);
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('validates email input', async () => {
        render(<Login />);
        
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        });
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('calls login on valid submission', async () => {
        mockLogin.mockResolvedValue({});
        render(<Login />);
        
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
        });
    });

    it('shows error message on login failure', async () => {
        mockLogin.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });
        render(<Login />);
        
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });
    });
});
