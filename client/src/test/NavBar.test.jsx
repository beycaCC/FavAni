import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Navbar from '../utils/NavBar';

jest.mock('@auth0/auth0-react');

describe('Navbar Component', () => {
    beforeEach(() => {
        // Mock isAuthenticated to false by default
        useAuth0.mockReturnValue({
        isAuthenticated: false,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        });
    });

    test('render navbar with login button when user is not logged in', () => {
        render(<Navbar />, { wrapper: MemoryRouter });

        expect(screen.getByText('Login')).toBeInTheDocument();
        expect(screen.queryByText('User Dashboard')).not.toBeInTheDocument();
    });

    test('render navbar with user dashboard button when user is logged in', () => {
        // Mock isAuthenticated to true
        useAuth0.mockReturnValue({
        isAuthenticated: true,
        loginWithRedirect: jest.fn(),
        logout: jest.fn(),
        });

        render(<Navbar />, { wrapper: MemoryRouter });

        expect(screen.queryByText('Login')).not.toBeInTheDocument();
        expect(screen.getByText('User Dashboard')).toBeInTheDocument();
    });

    test('call loginWithRedirect when login button is clicked', () => {
        const loginWithRedirect = jest.fn();
        useAuth0.mockReturnValue({
        isAuthenticated: false,
        loginWithRedirect,
        logout: jest.fn(),
        });

        render(<Navbar />, { wrapper: MemoryRouter });

        fireEvent.click(screen.getByText('Login'));
        expect(loginWithRedirect).toHaveBeenCalledTimes(1);
    });

    test('call logout when logout button is clicked', () => {
        const logout = jest.fn();
        useAuth0.mockReturnValue({
        isAuthenticated: true,
        loginWithRedirect: jest.fn(),
        logout,
        });

        render(<Navbar />, { wrapper: MemoryRouter });

        fireEvent.click(screen.getByText('LogOut'));
        expect(logout).toHaveBeenCalledTimes(1);
    });
});
