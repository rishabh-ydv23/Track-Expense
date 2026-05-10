# TrackExpense - AWS Deployment Guide

## Overview
This guide covers deploying TrackExpense to AWS using multiple options. Choose the one best suited for your needs.

---

## Option 1: ECS (Recommended for Production) 

### Architecture
```
Internet Gateway
    ↓
Application Load Balancer (ALB)
    ↓
ECS Cluster
├── Frontend (Nginx container)
└── Backend (Node.js container)
    ↓
RDS (MongoDB Atlas or DocumentDB)
    ↓
S3 (Optional: backups, static assets)
```

### Step 1: Prepare AWS
```bash
# Install AWS CLI
https://aws.amazon.com/cli/

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Default Region (us-east-1)
```

### Step 2: Create ECR Repositories
```bash
# Create ECR repository for backend
aws ecr create-repository --repository-name trackexpense-backend --region us-east-1

# Create ECR repository for frontend  
aws ecr create-repository --repository-name trackexpense-frontend --region us-east-1

# Get login credentials
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

### Step 3: Build and Push Docker Images
```bash
# Build backend image
docker build -t trackexpense-backend:latest ./backend

# Tag backend image
docker tag trackexpense-backend:latest YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trackexpense-backend:latest

# Push backend image
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trackexpense-backend:latest

# Repeat for frontend
docker build -t trackexpense-frontend:latest ./frontend
docker tag trackexpense-frontend:latest YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trackexpense-frontend:latest
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trackexpense-frontend:latest
```

### Step 4: Set Up MongoDB
**Option A: MongoDB Atlas (Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free/paid cluster
3. Create a database user
4. Get connection string
5. Add AWS IP ranges to network access

**Option B: AWS DocumentDB (Compatible with MongoDB)**
```bash
# Use AWS Console to create DocumentDB cluster
# Note: Requires VPC setup
```

### Step 5: Create ECS Cluster
```bash
# Create cluster
aws ecs create-cluster --cluster-name trackexpense-prod

# Create CloudWatch log group for ECS
aws logs create-log-group --log-group-name /ecs/trackexpense-backend
aws logs create-log-group --log-group-name /ecs/trackexpense-frontend
```

### Step 6: Create Task Definitions
Use the AWS Console to create task definitions or use CloudFormation.

**Backend Task Definition (task-def-backend.json):**
```json
{
  "family": "trackexpense-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trackexpense-backend:latest",
      "portMappings": [
        {
          "containerPort": 4000,
          "hostPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "4000"
        }
      ],
      "secrets": [
        {
          "name": "MONGO_URI",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_AWS_ACCOUNT_ID:secret:trackexpense-mongo-uri"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_AWS_ACCOUNT_ID:secret:trackexpense-jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/trackexpense-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register task definition:
```bash
aws ecs register-task-definition --cli-input-json file://task-def-backend.json --region us-east-1
```

### Step 7: Create Load Balancer
```bash
# Create ALB (via AWS Console)
# 1. Go to EC2 > Load Balancers
# 2. Create Application Load Balancer
# 3. Configure listeners:
#    - Port 80 (HTTP) → Frontend (port 80)
#    - Port 443 (HTTPS) → Frontend with SSL
# 4. Create target groups for frontend and backend
```

### Step 8: Create ECS Services
```bash
# Create backend service
aws ecs create-service \
  --cluster trackexpense-prod \
  --service-name trackexpense-backend \
  --task-definition trackexpense-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=4000

# Create frontend service
aws ecs create-service \
  --cluster trackexpense-prod \
  --service-name trackexpense-frontend \
  --task-definition trackexpense-frontend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=frontend,containerPort=80
```

---

## Option 2: Elastic Beanstalk (Easier, Less Control)

### Step 1: Install EB CLI
```bash
pip install awsebcli --upgrade --user
```

### Step 2: Initialize Elastic Beanstalk
```bash
# At project root
eb init -p docker trackexpense --region us-east-1
```

### Step 3: Create Dockerrun.aws.json
```json
{
  "AWSEBDockerrunVersion": 2,
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trackexpense-backend:latest",
      "essential": true,
      "memory": 512,
      "portMappings": [
        {
          "containerPort": 4000,
          "hostPort": 4000
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ]
    },
    {
      "name": "frontend",
      "image": "YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/trackexpense-frontend:latest",
      "essential": true,
      "memory": 256,
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 80
        }
      ]
    }
  ]
}
```

### Step 4: Deploy
```bash
eb create trackexpense-env
eb deploy
```

---

## Option 3: EC2 with Docker Compose (Simplest)

### Step 1: Launch EC2 Instance
1. Go to AWS Console > EC2
2. Launch Ubuntu 22.04 LTS instance
3. Configure security group (allow ports 80, 443, 22, 4000)
4. Create/select key pair for SSH access

### Step 2: Connect and Setup
```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Update system
sudo yum update -y  # For Amazon Linux
# OR
sudo apt update && sudo apt upgrade -y  # For Ubuntu

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### Step 3: Deploy Application
```bash
# Clone repository
git clone <your-repo-url>
cd TRACKEXPENSE

# Create .env file
cat > .env <<EOF
NODE_ENV=production
MONGO_URI=your-mongodb-atlas-uri
JWT_SECRET=your-production-secret
CORS_ORIGIN=https://yourdomain.com
EOF

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Step 4: Setup Domain & SSL (Let's Encrypt)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx config with SSL paths
```

---

## Option 4: AWS Amplify (For Frontend Only)

### Perfect for: Quick frontend deployment

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

---

## Post-Deployment Checklist

- [ ] Configure custom domain (Route 53 or external DNS)
- [ ] Set up SSL/TLS certificates (ACM for AWS services)
- [ ] Configure CloudFront CDN for static assets
- [ ] Set up CloudWatch monitoring and alarms
- [ ] Enable backup for MongoDB
- [ ] Configure auto-scaling policies
- [ ] Set up CI/CD with GitHub Actions or AWS CodePipeline
- [ ] Configure AWS WAF for DDoS protection
- [ ] Set up database backups and point-in-time recovery
- [ ] Configure application monitoring (CloudWatch, DataDog, etc.)

---

## Cost Estimation (Monthly)

### ECS Fargate
- 2 tasks × 256 CPU, 512 MB memory: ~$15
- ALB: ~$15
- Data transfer: ~$0.10 per GB
- **Total: ~$30-50/month**

### Elastic Beanstalk
- 1 t3.micro instance: ~$8
- **Total: ~$8-20/month**

### EC2 + Docker Compose
- 1 t3.micro instance: ~$8
- **Total: ~$8-15/month**

---

## Troubleshooting

### Tasks won't start
```bash
# Check ECS logs
aws logs tail /ecs/trackexpense-backend --follow

# Check task details
aws ecs describe-tasks --cluster trackexpense-prod --tasks <task-arn>
```

### Backend can't connect to MongoDB
- Verify security group rules allow database port
- Check MONGO_URI in task definition
- Verify database credentials

### Frontend showing 502 errors
- Check backend service is running
- Verify ALB target group health
- Check security groups allow traffic between ALB and backend

---

## Next Steps

1. Choose a deployment option based on your needs
2. Set up MongoDB Atlas or DocumentDB
3. Create AWS account and credentials
4. Follow the step-by-step guide for your chosen option
5. Test thoroughly before going to production
