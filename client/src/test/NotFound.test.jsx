import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFound from '../components/NotFound';

describe('NotFound Component', () => {
    test('displays the correct text', () => {
        render(<NotFound />);
        expect(screen.getByText('NotFound')).toBeInTheDocument();
    });
});