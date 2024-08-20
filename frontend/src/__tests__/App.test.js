import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from '../App';
import axios from 'axios';

// Mocking axios
jest.mock('axios');

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    render(<App />);
    expect(screen.getByText('URL Metadata Fetcher')).toBeInTheDocument();
  });

  test('renders URL input fields', () => {
    render(<App />);
    expect(screen.getAllByPlaceholderText('Enter URL')[0]).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('Enter URL')[1]).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('Enter URL')[2]).toBeInTheDocument();
  });

  test('handles form submission and loading state', async () => {
    axios.post.mockResolvedValue({ data: [] }); // Mock successful response

    render(<App />);
    fireEvent.change(screen.getAllByPlaceholderText('Enter URL')[0], { target: { value: 'http://example.com' } });
    fireEvent.change(screen.getAllByPlaceholderText('Enter URL')[1], { target: { value: 'http://example.org' } });
    fireEvent.change(screen.getAllByPlaceholderText('Enter URL')[2], { target: { value: 'http://example.net' } });

    fireEvent.click(screen.getByText('Fetch Metadata'));

    expect(screen.getByText('Fetching...')).toBeInTheDocument(); // Assuming you have a text or spinner indicating loading

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
  });

  test('displays error messages correctly', async () => {
    axios.post.mockRejectedValue({ response: { status: 403 } }); // Mock error response

    render(<App />);
    fireEvent.change(screen.getAllByPlaceholderText('Enter URL')[0], { target: { value: 'http://example.com' } });
    fireEvent.change(screen.getAllByPlaceholderText('Enter URL')[1], { target: { value: 'http://example.org' } });
    fireEvent.change(screen.getAllByPlaceholderText('Enter URL')[2], { target: { value: 'http://example.net' } });

    fireEvent.click(screen.getByText('Fetch Metadata'));

    await waitFor(() => expect(screen.getByText('Invalid CSRF token. Please refresh the page and try again.')).toBeInTheDocument());
  });

  test('resets state on Try Again button click', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Try Again'));

    expect(screen.getAllByPlaceholderText('Enter URL')[0].value).toBe('');
    expect(screen.getAllByPlaceholderText('Enter URL')[1].value).toBe('');
    expect(screen.getAllByPlaceholderText('Enter URL')[2].value).toBe('');
    expect(screen.queryByText('Invalid CSRF token. Please refresh the page and try again.')).toBeNull();
  });
});
