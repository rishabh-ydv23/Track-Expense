# TRACKEXPENSE - Quick Start Guide

## 🚀 Local Development with Docker

### Prerequisites
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Git installed
- 2GB free RAM

### Quick Start (5 minutes)

```bash
# 1. Clone/open the project
cd TRACKEXPENSE

# 2. Create environment file
cp .env.local .env  # Or create from .env.local template

# 3. Start all services (MongoDB, Backend, Frontend)
docker-compose up -d

# 4. View logs
docker-compose logs -f

# 5. Access the app
- Frontend: http://localhost
- Backend API: http://localhost:4000
- MongoDB: localhost:27017
```

### Useful Commands

```bash
# Stop all services
docker-compose down

# Stop and remove data
docker-compose down -v

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Rebuild images after code changes
docker-compose up -d --build

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password123

# View running containers
docker-compose ps
```

---

## 🌐 AWS Deployment Options

See [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) for complete instructions.

### Quick Comparison

| Option | Ease | Cost | Control | Recommended For |
|--------|------|------|---------|-----------------|
| **EC2 + Docker Compose** | ⭐⭐⭐⭐ | $8-15/mo | Medium | Hobby/Small projects |
| **Elastic Beanstalk** | ⭐⭐⭐ | $15-30/mo | Medium-High | Small to medium apps |
| **ECS Fargate** | ⭐⭐ | $30-50/mo | Very High | Production apps |
| **Amplify** (Frontend only) | ⭐⭐⭐⭐⭐ | $1/mo | Low | Frontend hosting only |

**Recommended for first deployment: EC2 + Docker Compose or Elastic Beanstalk**

---

## 📋 Pre-Deployment Checklist

Before deploying to AWS:

- [ ] Test app locally with `docker-compose up`
- [ ] Update `CORS_ORIGIN` to your actual domain
- [ ] Generate strong `JWT_SECRET`: `openssl rand -base64 32`
- [ ] Set up MongoDB Atlas account and create cluster
- [ ] Create AWS account
- [ ] Have AWS credentials ready (Access Key ID & Secret)

---

## 📱 Environment Variables

### Backend (.env)
```env
# Database
MONGO_URI=mongodb+srv://...

# Security
JWT_SECRET=your-secret-key

# Server
PORT=4000
NODE_ENV=production

# CORS - Must match your frontend domain
CORS_ORIGIN=https://yourdomain.com

# Load Balancer (AWS ALB)
TRUST_PROXY=1
```

### Frontend (Auto-configured)
```env
VITE_API_BASE_URL=/api  # Or https://yourdomain.com/api
```

---

## 🔧 Docker Architecture

```
┌─────────────────────────────────────┐
│     Internet (Port 80, 443)          │
└────────────────┬────────────────────┘
                 │
         ┌───────▼────────┐
         │  Nginx/Frontend│
         │  (Port 80)     │
         └───────┬────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼────────┐        ┌──────▼──────┐
│  Static    │        │   API Proxy │
│  Assets    │        │  /api/* →   │
└────────────┘        │  Backend    │
                      │  (Port 4000)│
                      └──────┬──────┘
                             │
                      ┌──────▼──────┐
                      │  Node.js    │
                      │  Backend    │
                      └──────┬──────┘
                             │
                      ┌──────▼──────┐
                      │  MongoDB    │
                      │  Database   │
                      └─────────────┘
```

---

## 🐳 Building Custom Images

### Backend
```bash
cd backend
docker build -t trackexpense-backend:1.0 .
docker tag trackexpense-backend:1.0 YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/trackexpense-backend:1.0
docker push YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/trackexpense-backend:1.0
```

### Frontend  
```bash
cd frontend
docker build -t trackexpense-frontend:1.0 .
docker tag trackexpense-frontend:1.0 YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/trackexpense-frontend:1.0
docker push YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/trackexpense-frontend:1.0
```

---

## 📊 Monitoring & Troubleshooting

### View Container Status
```bash
docker-compose ps
```

### View Container Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 50 lines
docker-compose logs --tail 50 backend
```

### Common Issues

**Frontend shows blank page or 502 error:**
```bash
# Check backend logs
docker-compose logs backend

# Check frontend logs
docker-compose logs frontend

# Verify backend is running
curl http://localhost:4000/
```

**Can't connect to MongoDB:**
```bash
# Check MongoDB is running
docker-compose logs mongodb

# Verify connection string in .env
# Should be: mongodb://admin:password123@mongodb:27017/trackexpense?authSource=admin
```

**Port already in use:**
```bash
# Find process using port
# Windows: netstat -ano | findstr :8080
# Linux/Mac: lsof -i :8080

# Change port in docker-compose.yml or .env
```

---

## 🔐 Security Best Practices

1. **Never commit .env files** - Already in .gitignore
2. **Use strong JWT_SECRET** - Generate with: `openssl rand -base64 32`
3. **Enable HTTPS** - AWS ALB/Beanstalk handle this automatically
4. **Keep dependencies updated** - Run `npm audit fix`
5. **Use environment variables** - Never hardcode secrets
6. **Limit CORS origin** - Only allow your domain
7. **Enable helmet.js** - Already configured in backend
8. **Rate limiting** - Already configured in backend

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [AWS ECS Guide](https://docs.aws.amazon.com/ecs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

---

## 💡 Tips

1. **Use MongoDB Atlas** instead of self-hosted MongoDB for better reliability
2. **Test locally first** before deploying to AWS
3. **Use AWS Secrets Manager** for storing JWT_SECRET and MONGO_URI
4. **Enable CloudWatch** for monitoring in production
5. **Set up auto-scaling** to handle traffic spikes

---

Need help? Check [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) for detailed deployment instructions.
