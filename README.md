# Task Manager - CI/CD Demo Project

A complete full-stack application demonstrating modern CI/CD practices with Flask backend, React frontend, Docker containerization, and GitHub Actions automation.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Docker Setup](#docker-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

This project is designed to help developers learn and practice CI/CD concepts through a real-world application. It features:

- **Full-Stack Application**: React frontend + Flask backend
- **Containerization**: Docker for consistent environments
- **Automated Testing**: Unit tests, integration tests, security scans
- **CI/CD Pipeline**: Automated build, test, and deployment
- **Code Quality**: Linting, formatting, and quality gates
- **Security**: Vulnerability scanning and security best practices

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Flask Backend  │
│     (Port 3000) │◄──►│    (Port 5000)  │
│                 │    │                 │
│  - Task Manager │    │  - REST API     │
│  - Modern UI    │    │  - CRUD Ops     │
│  - Responsive   │    │  - Health Check │
└─────────────────┘    └─────────────────┘
        │                       │
        └───────────────────────┘
                    │
            ┌─────────────────┐
            │     Docker      │
            │  Containerized  │
            │   Application   │
            └─────────────────┘
```

## 🛠️ Technologies

### Backend
- **Flask** - Python web framework
- **Flask-CORS** - Cross-Origin Resource Sharing
- **pytest** - Testing framework
- **Docker** - Containerization

### Frontend
- **React** - JavaScript UI library
- **Axios** - HTTP client
- **CSS3** - Modern styling
- **Jest** - Testing framework

### DevOps & CI/CD
- **GitHub Actions** - CI/CD platform
- **Docker Compose** - Multi-container orchestration
- **ESLint/Prettier** - Code formatting
- **Flake8/Black** - Python code quality
- **Trivy** - Security scanning

## 🚀 Quick Start

### Prerequisites
- Git
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Run with Docker (Recommended)
```bash
# Clone the repository
git clone <your-repo-url>
cd CICD

# Start the application
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

## 💻 Development Setup

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the development server
python app.py
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 🐳 Docker Setup

### Development Environment
```bash
# Build and run with development settings
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Environment
```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up -d

# Scale services (example)
docker-compose -f docker-compose.prod.yml up -d --scale frontend=2
```

### Individual Services
```bash
# Backend only
docker build -t task-backend ./backend
docker run -p 5000:5000 task-backend

# Frontend only
docker build -t task-frontend ./frontend
docker run -p 3000:80 task-frontend
```

## 🔄 CI/CD Pipeline

Our CI/CD pipeline implements GitOps best practices:

### Pipeline Stages

1. **Code Quality Checks**
   - Linting (ESLint, Flake8)
   - Formatting (Prettier, Black)
   - Security scanning (Bandit, npm audit)

2. **Testing**
   - Unit tests (Jest, pytest)
   - Coverage reporting
   - Integration tests

3. **Build & Package**
   - Docker image building
   - Multi-stage builds for optimization
   - Image tagging and versioning

4. **Security Scanning**
   - Container vulnerability scanning (Trivy)
   - Dependency vulnerability checks
   - Security best practices validation

5. **Deployment**
   - Staging deployment
   - Production deployment (with approval)
   - Health checks and rollback capabilities

### Workflow Triggers

- **Push to main**: Full CI/CD pipeline
- **Pull Request**: Quality checks and tests only
- **Manual**: Production deployment with approval

### Environment Promotion

```
Feature Branch → Pull Request → Staging → Production
      ↓              ↓           ↓          ↓
   Tests Only    All Checks   Auto Deploy Manual Deploy
```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:5000`
- Production: `https://your-domain.com`

### Endpoints

#### Health Check
```http
GET /health
```
Response:
```json
{
  \"status\": \"healthy\",
  \"timestamp\": \"2024-01-01T12:00:00\"
}
```

#### Tasks

##### Get All Tasks
```http
GET /api/tasks
```

##### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  \"title\": \"Task title\",
  \"description\": \"Task description\"
}
```

##### Update Task
```http
PUT /api/tasks/{id}
Content-Type: application/json

{
  \"title\": \"Updated title\",
  \"description\": \"Updated description\",
  \"completed\": true
}
```

##### Delete Task
```http
DELETE /api/tasks/{id}
```

##### Toggle Task Completion
```http
PATCH /api/tasks/{id}/toggle
```

### Response Format
All API responses follow this format:
```json
{
  \"data\": {},
  \"error\": \"Error message if any\",
  \"status\": \"success|error\"
}
```

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=. --cov-report=html

# Run specific test
python -m pytest test_app.py::test_health_check -v
```

### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run tests in CI mode
CI=true npm test
```

### Integration Tests
```bash
# Start services
docker-compose up -d

# Run integration tests
# (Add your integration test commands here)

# Cleanup
docker-compose down
```

## 🚢 Deployment

### Staging Deployment
Automatically triggered on push to `main` branch.

### Production Deployment
1. Merge to `main` triggers staging deployment
2. Manual approval required for production
3. Automated health checks post-deployment
4. Rollback capability if health checks fail

### Manual Deployment
```bash
# Using Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Using Kubernetes (example)
kubectl apply -f k8s/

# Health check
curl http://your-domain.com/health
```

### Environment Variables

#### Backend
- `FLASK_ENV`: `development` or `production`
- `PORT`: Server port (default: 5000)

#### Frontend
- `REACT_APP_API_URL`: Backend API URL

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and quality checks
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Quality Standards
- Follow existing code style
- Write tests for new features
- Ensure all CI checks pass
- Update documentation as needed

### Pre-commit Hooks (Optional)
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

## 📊 Monitoring & Observability

### Health Checks
- Backend: `GET /health`
- Frontend: `GET /health`
- Docker: Container health checks

### Logs
```bash
# Application logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Metrics (Future Enhancement)
- Application performance monitoring
- Error tracking
- User analytics
- Infrastructure metrics

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :5000

# Kill the process
kill -9 <PID>
```

#### Docker Issues
```bash
# Clean up Docker
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### CORS Issues
Ensure the backend has proper CORS configuration for your frontend URL.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Flask community for the excellent web framework
- React team for the fantastic UI library
- Docker for containerization technology
- GitHub Actions for CI/CD capabilities

---

**Happy Coding! 🚀**

For questions or support, please open an issue in this repository.