import React from 'react';
import { render, screen } from '@testing-library/react';
import AnimeDetail from '../components/AnimeDetail';

test('AnimeDetail Component renders "Loading..." message when animeDetails is null', () => {
  // Render the AnimeDetail component with animeDetails set to null (since nothing send to the backend api)
  render(<AnimeDetail animeDetails={null} />);

  // Check if the "Loading..." message is displayed
  const loadingMessage = screen.getByText('Loading...');
  expect(loadingMessage).toBeInTheDocument();
});
