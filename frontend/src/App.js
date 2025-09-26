import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/tasks`);
      setTasks(response.data.tasks);
      setError('');
    } catch (err) {
      setError('Failed to fetch tasks. Make sure the backend server is running.');
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error fetching tasks:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/api/tasks`, newTask);
      setTasks([...tasks, response.data]);
      setNewTask({ title: '', description: '' });
      setError('');
    } catch (err) {
      setError('Failed to create task');
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error creating task:', err);
      }
    }
  };

  const updateTask = async (taskId, updatedTask) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/tasks/${taskId}`, updatedTask);
      setTasks(tasks.map(task => task.id === taskId ? response.data : task));
      setEditingTask(null);
      setError('');
    } catch (err) {
      setError('Failed to update task');
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error updating task:', err);
      }
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
      setError('');
    } catch (err) {
      setError('Failed to delete task');
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error deleting task:', err);
      }
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/tasks/${taskId}/toggle`);
      setTasks(tasks.map(task => task.id === taskId ? response.data : task));
      setError('');
    } catch (err) {
      setError('Failed to toggle task');
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Error toggling task:', err);
      }
    }
  };

  const startEditing = (task) => {
    setEditingTask({ ...task });
  };

  const cancelEditing = () => {
    setEditingTask(null);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    updateTask(editingTask.id, editingTask);
  };

  if (loading) {
    return <div className="App"><div className="loading">Loading tasks...</div></div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Task Manager</h1>
        <p>A CI/CD Demo with Flask Backend & React Frontend</p>
      </header>

      {error && <div className="error-message">{error}</div>}

      <main className="main-content">
        <section className="task-form-section">
          <h2>Add New Task</h2>
          <form onSubmit={createTask} className="task-form">
            <input
              type="text"
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Task description (optional)..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <button type="submit">Add Task</button>
          </form>
        </section>

        <section className="tasks-section">
          <h2>Tasks ({tasks.length})</h2>
          
          {tasks.length === 0 ? (
            <p className="no-tasks">No tasks yet. Add one above!</p>
          ) : (
            <div className="tasks-grid">
              {tasks.map(task => (
                <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                  {editingTask && editingTask.id === task.id ? (
                    <form onSubmit={saveEdit} className="edit-form">
                      <input
                        type="text"
                        value={editingTask.title}
                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                        required
                      />
                      <textarea
                        value={editingTask.description}
                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                      />
                      <div className="edit-actions">
                        <button type="submit">Save</button>
                        <button type="button" onClick={cancelEditing}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="task-content">
                        <h3 className={task.completed ? 'completed-text' : ''}>{task.title}</h3>
                        {task.description && (
                          <p className={task.completed ? 'completed-text' : ''}>{task.description}</p>
                        )}
                        <small>Created: {new Date(task.created_at).toLocaleDateString()}</small>
                      </div>
                      <div className="task-actions">
                        <button 
                          onClick={() => toggleTask(task.id)}
                          className={`toggle-btn ${task.completed ? 'completed' : ''}`}
                        >
                          {task.completed ? '✓ Completed' : '○ Mark Complete'}
                        </button>
                        <button onClick={() => startEditing(task)} className="edit-btn">
                          Edit
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="delete-btn">
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="App-footer">
        <p>Built with React & Flask | CI/CD Demo Project</p>
      </footer>
    </div>
  );
}

export default App;