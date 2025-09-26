import pytest
import json
from app import app


@pytest.fixture
def client():
    """Create a test client for the Flask application."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'
    assert 'timestamp' in data


def test_get_tasks(client):
    """Test getting all tasks."""
    response = client.get('/api/tasks')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'tasks' in data
    assert 'total' in data
    assert isinstance(data['tasks'], list)


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
    data = json.loads(response.data)
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
    data = json.loads(response.data)
    assert 'error' in data


def test_get_nonexistent_task(client):
    """Test getting a task that doesn't exist."""
    response = client.get('/api/tasks/99999')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'error' in data