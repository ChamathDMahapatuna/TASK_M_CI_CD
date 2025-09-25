from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Simple in-memory storage (in production, use a proper database)
tasks = []
task_counter = 1

# Sample data
if not tasks:
    tasks.extend([
        {"id": 1, "title": "Learn Flask", "description": "Build a REST API with Flask", "completed": False, "created_at": "2024-01-01T10:00:00"},
        {"id": 2, "title": "Learn React", "description": "Create a frontend with React", "completed": False, "created_at": "2024-01-01T11:00:00"},
        {"id": 3, "title": "Setup CI/CD", "description": "Configure GitHub Actions", "completed": True, "created_at": "2024-01-01T12:00:00"}
    ])
    task_counter = 4

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    return jsonify({"tasks": tasks, "total": len(tasks)})

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a specific task by ID"""
    task = next((t for t in tasks if t['id'] == task_id), None)
    if task:
        return jsonify(task)
    return jsonify({"error": "Task not found"}), 404

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    global task_counter
    
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({"error": "Title is required"}), 400
    
    new_task = {
        "id": task_counter,
        "title": data['title'],
        "description": data.get('description', ''),
        "completed": data.get('completed', False),
        "created_at": datetime.now().isoformat()
    }
    
    tasks.append(new_task)
    task_counter += 1
    
    return jsonify(new_task), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update an existing task"""
    task = next((t for t in tasks if t['id'] == task_id), None)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Update task fields
    task['title'] = data.get('title', task['title'])
    task['description'] = data.get('description', task['description'])
    task['completed'] = data.get('completed', task['completed'])
    
    return jsonify(task)

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    global tasks
    task = next((t for t in tasks if t['id'] == task_id), None)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    tasks = [t for t in tasks if t['id'] != task_id]
    return jsonify({"message": "Task deleted successfully"})

@app.route('/api/tasks/<int:task_id>/toggle', methods=['PATCH'])
def toggle_task(task_id):
    """Toggle task completion status"""
    task = next((t for t in tasks if t['id'] == task_id), None)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    task['completed'] = not task['completed']
    return jsonify(task)

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)