# Deployment Guide

This guide covers various deployment strategies for the Task Manager application.

## 🚀 Deployment Options

### 1. Docker Compose (Recommended for Development/Small Scale)

#### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

#### Quick Deployment
```bash
# Clone repository
git clone <your-repo>
cd CICD

# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

#### Configuration
```bash
# Create production environment file
cat > .env.prod << EOF
FLASK_ENV=production
PORT=5000
REACT_APP_API_URL=https://your-domain.com
EOF

# Deploy with custom config
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### 2. Kubernetes Deployment

#### Prerequisites
- Kubernetes cluster (1.20+)
- kubectl configured
- Docker images pushed to registry

#### Deployment Files

**Namespace**
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: task-manager
```

**Backend Deployment**
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: task-manager
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/your-username/backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: FLASK_ENV
          value: \"production\"
        - name: PORT
          value: \"5000\"
        resources:
          requests:
            memory: \"128Mi\"
            cpu: \"100m\"
          limits:
            memory: \"256Mi\"
            cpu: \"200m\"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Backend Service**
```yaml
# k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: task-manager
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 5000
    targetPort: 5000
  type: ClusterIP
```

**Frontend Deployment & Service**
```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: task-manager
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/your-username/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: \"64Mi\"
            cpu: \"50m\"
          limits:
            memory: \"128Mi\"
            cpu: \"100m\"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: task-manager
spec:
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

**Ingress**
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: task-manager-ingress
  namespace: task-manager
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: task-manager-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 5000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
```

#### Deploy to Kubernetes
```bash
# Apply all configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n task-manager
kubectl get services -n task-manager
kubectl get ingress -n task-manager

# View logs
kubectl logs -f deployment/backend -n task-manager
kubectl logs -f deployment/frontend -n task-manager
```

### 3. AWS ECS Deployment

#### Task Definitions
```json
{
  \"family\": \"task-manager-backend\",
  \"networkMode\": \"awsvpc\",
  \"requiresCompatibilities\": [\"FARGATE\"],
  \"cpu\": \"256\",
  \"memory\": \"512\",
  \"executionRoleArn\": \"arn:aws:iam::account:role/ecsTaskExecutionRole\",
  \"containerDefinitions\": [
    {
      \"name\": \"backend\",
      \"image\": \"ghcr.io/your-username/backend:latest\",
      \"portMappings\": [
        {
          \"containerPort\": 5000,
          \"protocol\": \"tcp\"
        }
      ],
      \"environment\": [
        {
          \"name\": \"FLASK_ENV\",
          \"value\": \"production\"
        }
      ],
      \"healthCheck\": {
        \"command\": [\"CMD-SHELL\", \"curl -f http://localhost:5000/health || exit 1\"],
        \"interval\": 30,
        \"timeout\": 5,
        \"retries\": 3
      },
      \"logConfiguration\": {
        \"logDriver\": \"awslogs\",
        \"options\": {
          \"awslogs-group\": \"/ecs/task-manager-backend\",
          \"awslogs-region\": \"us-east-1\",
          \"awslogs-stream-prefix\": \"ecs\"
        }
      }
    }
  ]
}
```

#### ECS Service Creation
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name task-manager

# Register task definition
aws ecs register-task-definition --cli-input-json file://backend-task-def.json

# Create service
aws ecs create-service \
  --cluster task-manager \
  --service-name backend-service \
  --task-definition task-manager-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration \"awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}\"
```

### 4. Heroku Deployment

#### Prerequisites
- Heroku CLI installed
- Heroku account

#### Backend Deployment
```bash
# Create Heroku app
heroku create task-manager-backend

# Set buildpack
heroku buildpacks:set heroku/python

# Configure environment
heroku config:set FLASK_ENV=production

# Deploy
git subtree push --prefix=backend heroku main
```

#### Frontend Deployment
```bash
# Create React app on Heroku
heroku create task-manager-frontend

# Set buildpack
heroku buildpacks:set mars/create-react-app

# Configure API URL
heroku config:set REACT_APP_API_URL=https://task-manager-backend.herokuapp.com

# Deploy
git subtree push --prefix=frontend heroku main
```

### 5. DigitalOcean App Platform

#### App Spec Configuration
```yaml
# .do/app.yaml
name: task-manager
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/task-manager
    branch: main
  run_command: python app.py
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: FLASK_ENV
    value: production
  health_check:
    http_path: /health
    
- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/task-manager
    branch: main
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: REACT_APP_API_URL
    value: ${backend.PUBLIC_URL}
```

#### Deploy
```bash
# Install doctl
# Configure authentication

# Deploy
doctl apps create --spec .do/app.yaml
```

## 🔧 Environment Configuration

### Production Environment Variables

#### Backend
```bash
FLASK_ENV=production
PORT=5000
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port/0
LOG_LEVEL=INFO
```

#### Frontend
```bash
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_ENV=production
GENERATE_SOURCEMAP=false
```

### SSL/TLS Configuration

#### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Manual Certificate Setup
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring & Logging

### Health Checks
```bash
# Backend health check
curl https://your-domain.com/api/health

# Frontend health check
curl https://your-domain.com/health

# Expected response
{\"status\": \"healthy\", \"timestamp\": \"2024-01-01T12:00:00\"}
```

### Log Aggregation
```bash
# Docker Compose logging
docker-compose logs -f --tail=100

# Kubernetes logging
kubectl logs -f deployment/backend -n task-manager

# Export logs to file
kubectl logs deployment/backend -n task-manager > backend.log
```

### Monitoring Setup (Prometheus + Grafana)
```yaml
# monitoring/docker-compose.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - \"9090:9090\"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana
    ports:
      - \"3001:3000\"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
      
volumes:
  grafana-data:
```

## 🔄 Rollback Strategies

### Docker Compose Rollback
```bash
# Tag current deployment
docker tag current-image:latest current-image:backup

# Deploy new version
docker-compose -f docker-compose.prod.yml up -d

# If issues occur, rollback
docker tag current-image:backup current-image:latest
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Rollback
```bash
# Check rollout status
kubectl rollout status deployment/backend -n task-manager

# Rollback to previous version
kubectl rollout undo deployment/backend -n task-manager

# Rollback to specific revision
kubectl rollout undo deployment/backend --to-revision=2 -n task-manager

# Check rollout history
kubectl rollout history deployment/backend -n task-manager
```

### Blue-Green Deployment
```bash
# Deploy to green environment
kubectl apply -f k8s/green/

# Switch traffic (update service selector)
kubectl patch service backend-service -p '{\"spec\":{\"selector\":{\"version\":\"green\"}}}'

# If issues, switch back to blue
kubectl patch service backend-service -p '{\"spec\":{\"selector\":{\"version\":\"blue\"}}}'
```

## 🚨 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker logs container-name

# Check resource usage
docker stats

# Inspect container
docker inspect container-name
```

#### Database Connection Issues
```bash
# Test connection from container
docker exec -it backend-container python -c \"import psycopg2; conn = psycopg2.connect('your-db-url'); print('Connected!')\"

# Check environment variables
docker exec -it backend-container env | grep DATABASE
```

#### High Memory Usage
```bash
# Set memory limits
docker run --memory=512m your-image

# In Kubernetes
resources:
  limits:
    memory: \"512Mi\"
  requests:
    memory: \"256Mi\"
```

#### SSL Certificate Issues
```bash
# Check certificate expiry
openssl x509 -in certificate.crt -text -noout | grep \"Not After\"

# Test SSL configuration
openssl s_client -connect your-domain.com:443
```

### Performance Optimization

#### Database Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM tasks WHERE completed = false;
```

#### Caching Strategy
```python
# Redis caching example
import redis
from flask import Flask

app = Flask(__name__)
cache = redis.Redis(host='redis', port=6379, db=0)

@app.route('/api/tasks')
def get_tasks():
    # Check cache first
    cached = cache.get('tasks')
    if cached:
        return cached
    
    # Fetch from database
    tasks = fetch_tasks_from_db()
    
    # Cache for 5 minutes
    cache.setex('tasks', 300, json.dumps(tasks))
    
    return tasks
```

#### Load Balancing
```nginx
# nginx.conf
upstream backend {
    server backend1:5000 weight=3;
    server backend2:5000 weight=2;
    server backend3:5000 weight=1;
}

server {
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

This deployment guide covers the most common deployment scenarios. Choose the option that best fits your infrastructure and requirements. Remember to always test deployments in a staging environment first! 🚀