# TRACKEXPENSE - Complete Docker & AWS Deployment Setup

## 📦 What's Included

This setup includes everything you need to containerize and deploy TrackExpense to AWS:

### Files Created:

```
TRACKEXPENSE/
├── docker-compose.yml              # Local development with all services
├── .env.local                       # Development environment variables
├── QUICK_START.md                   # Quick start guide
├── AWS_DEPLOYMENT.md                # Detailed AWS deployment guide
├── .github/workflows/deploy.yml     # CI/CD pipeline for GitHub Actions
├── frontend/
│   ├── Dockerfile                   # Frontend container build
│   └── nginx.conf                   # Nginx web server config
└── backend/
    ├── Dockerfile                   # Backend container build (updated)
    └── .env.production.example      # Production environment template
```

---

## 🚀 Quick Start (Start Here!)

### 1️⃣ Run Locally with Docker

**Prerequisites:**
- Docker Desktop: https://www.docker.com/products/docker-desktop
- Git installed

**Commands:**
```bash
# Navigate to project
cd TRACKEXPENSE

# Start all services (5 minutes to be ready)
docker-compose up -d

# View logs
docker-compose logs -f

# Access:
# Frontend: http://localhost
# Backend: http://localhost:4000
# MongoDB: localhost:27017
```

✅ **That's it! Your entire stack is running locally.**

### 2️⃣ Stop Services
```bash
docker-compose down
```

---

## 🌐 Deploy to AWS (Choose One)

### Option 1: **EC2 + Docker Compose** (Recommended for First-Time)
- **Cost:** $8-15/month
- **Effort:** ⭐⭐⭐⭐ (Easy)
- **Steps:** ~30 minutes
- **Best for:** Learning, small projects, hobby apps

👉 See: [AWS_DEPLOYMENT.md - Option 3: EC2 with Docker Compose](#option-3-ec2-with-docker-compose-simplest)

### Option 2: **Elastic Beanstalk** (Recommended for Simplicity)
- **Cost:** $15-30/month
- **Effort:** ⭐⭐⭐ (Medium)
- **Steps:** ~45 minutes
- **Best for:** Small to medium apps with auto-scaling

👉 See: [AWS_DEPLOYMENT.md - Option 2: Elastic Beanstalk](#option-2-elastic-beanstalk-easier-less-control)

### Option 3: **ECS Fargate** (Production-Grade)
- **Cost:** $30-50/month
- **Effort:** ⭐⭐ (Complex)
- **Steps:** ~60 minutes
- **Best for:** Production apps with high traffic

👉 See: [AWS_DEPLOYMENT.md - Option 1: ECS](#option-1-ecs-recommended-for-production)

---

## 🎯 Step-by-Step Deployment

### Phase 1: Prepare (30 minutes)

```bash
# 1. Create GitHub Account (if not already) and upload code
git init
git add .
git commit -m "Initial commit with Docker setup"
git push origin main

# 2. Create AWS Account (if not already)
# Go to: https://aws.amazon.com

# 3. Generate JWT Secret
# Linux/Mac:
openssl rand -base64 32

# Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Max 256}) -as [byte[]])
```

### Phase 2: Setup MongoDB (15 minutes)

**Recommended: MongoDB Atlas (Free tier available)**

```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster
4. Add database user (username/password)
5. Get connection string: mongodb+srv://username:password@cluster.mongodb.net/trackexpense
6. Add AWS IP ranges to network access (0.0.0.0/0 for development)
7. Copy connection string to .env file
```

### Phase 3: Deploy to AWS (30-60 minutes depending on option)

**For EC2 (Easiest):**
```bash
# See AWS_DEPLOYMENT.md Option 3 for detailed steps
# Summary: Launch EC2 → SSH → Install Docker → Git clone → docker-compose up
```

**For Elastic Beanstalk:**
```bash
# See AWS_DEPLOYMENT.md Option 2 for detailed steps
# Summary: eb init → eb create → eb deploy
```

---

## 🔄 CI/CD Automation (GitHub Actions)

Automatically build and deploy on every push!

### Setup Instructions:

```bash
# 1. Add AWS Secrets to GitHub
# Go to: Settings → Secrets and variables → Actions

# Click "New repository secret" and add:
# - AWS_ACCOUNT_ID: Your AWS account ID
# - AWS_ACCESS_KEY_ID: Your AWS access key
# - AWS_SECRET_ACCESS_KEY: Your AWS secret key
```

**Or use GitHub OIDC (More Secure):**
```bash
# See: https://github.com/aws-actions/configure-aws-credentials#oidc
```

Once configured:
- Push to `main` branch → Automatic build & deployment
- Push to `develop` branch → Build only, no deployment
- Pull requests → Lint and test

---

## 📋 Environment Variables

### Local Development (.env.local)
Already created! Copy to .env:
```bash
cp .env.local .env
```

### Production (.env.production.example)
Update before deploying:
```env
MONGO_URI=your-mongodb-atlas-uri
JWT_SECRET=your-secret-key-from-above
CORS_ORIGIN=https://yourdomain.com
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Update JWT_SECRET (generate new strong key)
- [ ] Update CORS_ORIGIN to your actual domain
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable HTTPS/SSL (AWS handles this)
- [ ] Set NODE_ENV=production
- [ ] Review SECURITY.md
- [ ] Update database backups
- [ ] Enable CloudWatch monitoring

---

## 📊 Architecture Overview

### Local (Docker Compose)
```
┌─────────────┐
│  Localhost  │
├─────────────┤
│ Frontend    │ ← Port 80
│ (Nginx)     │
├─────────────┤
│ Backend     │ ← Port 4000
│ (Node.js)   │
├─────────────┤
│ MongoDB     │ ← Port 27017
│ (Database)  │
└─────────────┘
```

### AWS Production (ECS/Beanstalk)
```
┌─────────────────────────────┐
│  Internet Users             │
├─────────────────────────────┤
│  AWS Route 53 (DNS)         │
├─────────────────────────────┤
│  Application Load Balancer  │
│  (Port 80/443)              │
├─────────────────────────────┤
│  ECS/Beanstalk Cluster      │
│  ├─ Frontend Tasks (×2)     │
│  └─ Backend Tasks (×2)      │
├─────────────────────────────┤
│  MongoDB Atlas              │
│  (Managed Database)         │
├─────────────────────────────┤
│  S3 (Backups)               │
│  CloudWatch (Monitoring)    │
└─────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Docker Compose Issues

```bash
# Containers won't start?
docker-compose logs -f

# Port already in use?
docker-compose down -v
# Then change port in docker-compose.yml

# Need fresh database?
docker-compose down -v
docker-compose up -d
```

### AWS Deployment Issues

**Task won't start:**
```bash
# Check logs
aws logs tail /ecs/trackexpense-backend --follow
```

**Can't connect to MongoDB:**
- Verify connection string
- Check MongoDB Atlas network access whitelist
- Verify security groups allow outbound

**502 Bad Gateway:**
- Check backend service health
- Verify ALB target group
- Review security group rules

**See: AWS_DEPLOYMENT.md Troubleshooting section**

---

## 📚 Documentation Files

| File | Purpose | Read When |
|------|---------|-----------|
| [QUICK_START.md](QUICK_START.md) | Local development guide | Getting started locally |
| [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) | AWS deployment detailed guide | Ready to deploy to AWS |
| [SECURITY.md](SECURITY.md) | Security configuration | Before production |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture | Understanding the system |
| [PRODUCTION_READINESS_REPORT.md](PRODUCTION_READINESS_REPORT.md) | Production checklist | Before going live |

---

## 🎓 Learning Resources

- **Docker:** https://docs.docker.com/get-started/
- **Docker Compose:** https://docs.docker.com/compose/gettingstarted/
- **AWS Free Tier:** https://aws.amazon.com/free/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas/register
- **Express.js Best Practices:** https://expressjs.com/en/advanced/best-practice-security.html
- **React/Vite Guide:** https://vitejs.dev/guide/

---

## 💡 Pro Tips

1. **Test locally first** before pushing to AWS
2. **Use MongoDB Atlas** for reliability (managed database)
3. **Start with EC2** if unsure, then migrate to ECS
4. **Monitor costs** on AWS - set up billing alerts
5. **Enable backups** for database
6. **Use environment variables** - never hardcode secrets
7. **Test database connection** before deploying

---

## 🆘 Need Help?

1. **Local Issues?** → Check [QUICK_START.md](QUICK_START.md)
2. **AWS Issues?** → Check [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md)
3. **Security?** → Check [SECURITY.md](SECURITY.md)
4. **Architecture?** → Check [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 📈 Next Steps

1. ✅ **Test locally:** Run `docker-compose up -d`
2. ✅ **Set up MongoDB Atlas:** Create free cluster
3. ✅ **Choose AWS option:** EC2, Beanstalk, or ECS
4. ✅ **Create AWS account:** If you don't have one
5. ✅ **Deploy:** Follow AWS_DEPLOYMENT.md steps
6. ✅ **Configure domain:** Add your domain name
7. ✅ **Enable HTTPS:** AWS handles this automatically
8. ✅ **Monitor:** Set up CloudWatch alarms

---

**You're all set! 🎉 Start with `docker-compose up -d` and enjoy!**
