import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { tasks: [], total: 0 } })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
}));

describe('App Component', () => {
  test('renders task manager header after loading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });
  });
});