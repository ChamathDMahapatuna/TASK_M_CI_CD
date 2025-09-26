import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import App from './App';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock data
const mockTasks = [
  {
    id: 1,
    title: 'Test Task 1',
    description: 'Test Description 1',
    completed: false,
    created_at: '2024-01-01T10:00:00'
  },
  {
    id: 2,
    title: 'Test Task 2',
    description: 'Test Description 2',
    completed: true,
    created_at: '2024-01-01T11:00:00'
  }
];

describe('App Component', () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    mockedAxios.put.mockClear();
    mockedAxios.delete.mockClear();
    mockedAxios.patch.mockClear();
  });

  test('renders task manager header', async () => {
    mockedAxios.get.mockResolvedValue({ data: { tasks: [] } });
    
    render(<App />);
    
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
    expect(screen.getByText('A CI/CD Demo with Flask Backend & React Frontend')).toBeInTheDocument();
  });

  test('loads and displays tasks on mount', async () => {
    mockedAxios.get.mockResolvedValue({ data: { tasks: mockTasks } });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5000/api/tasks');
  });

  test('creates a new task', async () => {
    const newTask = {
      id: 3,
      title: 'New Test Task',
      description: 'New Description',
      completed: false,
      created_at: '2024-01-01T12:00:00'
    };

    mockedAxios.get.mockResolvedValue({ data: { tasks: [] } });
    mockedAxios.post.mockResolvedValue({ data: newTask });
    
    render(<App />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Add New Task')).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText('Task title...');
    const descriptionInput = screen.getByPlaceholderText('Task description (optional)...');
    const addButton = screen.getByText('Add Task');

    fireEvent.change(titleInput, { target: { value: 'New Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    fireEvent.click(addButton);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:5000/api/tasks',
      { title: 'New Test Task', description: 'New Description' }
    );
  });

  test('toggles task completion', async () => {
    const toggledTask = { ...mockTasks[0], completed: true };
    
    mockedAxios.get.mockResolvedValue({ data: { tasks: mockTasks } });
    mockedAxios.patch.mockResolvedValue({ data: toggledTask });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const toggleButton = screen.getByText('○ Mark Complete');
    fireEvent.click(toggleButton);

    expect(mockedAxios.patch).toHaveBeenCalledWith('http://localhost:5000/api/tasks/1/toggle');
  });

  test('deletes a task', async () => {
    mockedAxios.get.mockResolvedValue({ data: { tasks: mockTasks } });
    mockedAxios.delete.mockResolvedValue({});
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:5000/api/tasks/1');
  });

  test('handles API errors gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });
  });

  test('shows no tasks message when list is empty', async () => {
    mockedAxios.get.mockResolvedValue({ data: { tasks: [] } });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('No tasks yet. Add one above!')).toBeInTheDocument();
    });
  });
});