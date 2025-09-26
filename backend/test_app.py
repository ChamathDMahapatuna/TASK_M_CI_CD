import pytest
import json
from app import app, tasks, task_counter

@pytest.fixture
def client():
    """Create a test client for the Flask application."""
    app.config['TESTING'] = True
    # Clear tasks before each test
    global tasks, task_counter
    tasks.clear()
    task_counter = 1
    
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert 'timestamp' in data

def test_get_tasks_empty(client):
    """Test getting all tasks when empty."""
    response = client.get('/api/tasks')
    assert response.status_code == 200
    data = response.get_json()
    assert 'tasks' in data
    assert 'total' in data
    assert data['tasks'] == []
    assert data['total'] == 0

def test_create_task(client):
    """Test creating a new task."""
    new_task = {
        'title': 'Test Task',
        'description': 'This is a test task'
    }
    response = client.post('/api/tasks', 
                          data=json.dumps(new_task),
                          content_type='application/json')
    assert response.status_code == 201
    data = response.get_json()
    assert data['title'] == new_task['title']
    assert data['description'] == new_task['description']
    assert 'id' in data
    assert 'created_at' in data

def test_create_task_no_title(client):
    """Test creating a task without title should fail."""
    new_task = {
        'description': 'This task has no title'
    }
    response = client.post('/api/tasks', 
                          data=json.dumps(new_task),
                          content_type='application/json')
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data

def test_get_single_task(client):
    """Test getting a single task by ID."""
    # First create a task
    new_task = {'title': 'Single Task Test'}
    create_response = client.post('/api/tasks', 
                                 data=json.dumps(new_task),
                                 content_type='application/json')
    created_task = create_response.get_json()
    task_id = created_task['id']
    
    # Then get it
    response = client.get(f'/api/tasks/{task_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == task_id
    assert data['title'] == new_task['title']

def test_get_nonexistent_task(client):
    """Test getting a task that doesn't exist."""
    response = client.get('/api/tasks/99999')
    assert response.status_code == 404
    data = response.get_json()
    assert 'error' in data

def test_update_task(client):
    """Test updating a task."""
    # Create a task first
    new_task = {'title': 'Original Title'}
    create_response = client.post('/api/tasks', 
                                 data=json.dumps(new_task),
                                 content_type='application/json')
    created_task = create_response.get_json()
    task_id = created_task['id']
    
    # Update it
    update_data = {
        'title': 'Updated Title',
        'completed': True
    }
    response = client.put(f'/api/tasks/{task_id}', 
                         data=json.dumps(update_data),
                         content_type='application/json')
    assert response.status_code == 200
    data = response.get_json()
    assert data['title'] == update_data['title']
    assert data['completed'] == update_data['completed']

def test_delete_task(client):
    """Test deleting a task."""
    # Create a task first
    new_task = {'title': 'Task to Delete'}
    create_response = client.post('/api/tasks', 
                                 data=json.dumps(new_task),
                                 content_type='application/json')
    created_task = create_response.get_json()
    task_id = created_task['id']
    
    # Delete it
    response = client.delete(f'/api/tasks/{task_id}')
    assert response.status_code == 200
    
    # Verify it's gone
    get_response = client.get(f'/api/tasks/{task_id}')
    assert get_response.status_code == 404

def test_toggle_task(client):
    """Test toggling task completion status."""
    # Create a task first
    new_task = {'title': 'Task to Toggle', 'completed': False}
    create_response = client.post('/api/tasks', 
                                 data=json.dumps(new_task),
                                 content_type='application/json')
    created_task = create_response.get_json()
    task_id = created_task['id']
    
    # Toggle it
    response = client.patch(f'/api/tasks/{task_id}/toggle')
    assert response.status_code == 200
    data = response.get_json()
    assert data['completed'] is True
    
    # Toggle it back
    response = client.patch(f'/api/tasks/{task_id}/toggle')
    assert response.status_code == 200
    data = response.get_json()
    assert data['completed'] is False