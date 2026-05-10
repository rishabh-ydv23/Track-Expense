# TRACKEXPENSE - Production Deployment Guide

## Overview
This guide covers all steps needed to deploy TRACKEXPENSE to production.

## Pre-Deployment Checklist

### Code Quality
- [x] All ESLint warnings resolved
- [x] No console.log statements in production builds
- [x] Error boundaries implemented
- [x] Input validation configured
- [x] Environment variables configured

### Security
- [x] All hardcoded secrets removed
- [x] Environment variables for all sensitive data
- [x] CORS properly configured
- [x] JWT authentication in place
- [x] Password validation requirements met

### Performance
- [ ] Frontend production build tested
- [ ] Database indexes created
- [ ] Caching strategy implemented
- [ ] CDN configured for static assets
- [ ] Database backups configured

### Dependencies
- [ ] All npm packages up to date
- [ ] Security vulnerabilities resolved
- [ ] Unused dependencies removed

## Building for Production

### Backend

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Update .env for production**:
```bash
NODE_ENV=production
PORT=4000
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-production-secret-key
CORS_ORIGIN=https://yourdomain.com
```

3. **Test locally**:
```bash
npm start
```

4. **Deploy**:
- Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name "trackexpense-api"
pm2 save
```

### Frontend

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Update .env for production**:
```bash
VITE_API_URL=https://api.yourdomain.com/api
VITE_ENV=production
```

3. **Build for production**:
```bash
npm run build
```

4. **Test production build locally**:
```bash
npm run preview
```

5. **Deploy to hosting**:
   - Option A: Vercel (recommended for React)
     ```bash
     npm install -g vercel
     vercel
     ```
   - Option B: Netlify
     - Push to Git and connect repository
   - Option C: Self-hosted (Nginx)
     ```bash
     # Serve dist/ folder with Nginx
     ```

## Docker Deployment (Optional)

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["node", "server.js"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3'
services:
  api:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped

  web:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - api
    restart: unless-stopped

  mongodb:
    image: mongo:6
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    restart: unless-stopped

volumes:
  mongodb_data:
```

## Post-Deployment

### Health Checks
- API: `GET /` should return 'API Working!'
- Frontend: Should load without errors

### Monitoring Setup
1. **Application Monitoring**:
   - Set up APM tool (New Relic, DataDog, or Sentry)
   - Configure error tracking
   - Set up alerts for critical errors

2. **Database Monitoring**:
   - MongoDB Atlas monitoring
   - Regular backup verification
   - Query performance analysis

3. **Performance Monitoring**:
   - Frontend: Lighthouse scores
   - Backend: API response times
   - Database: Query execution times

### Backup Strategy
- Daily MongoDB backups
- Backup retention: 30 days minimum
- Test restore procedures regularly

### SSL/HTTPS Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /api {
        proxy_pass http://localhost:4000;
    }
}
```

## Scaling for Production

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy, AWS ELB)
- Multiple API instances with process manager
- Shared database (MongoDB Atlas handles this)

### Vertical Scaling
- Increase server resources (RAM, CPU)
- Optimize database indexes
- Implement caching (Redis)

## Rollback Plan
1. Keep previous version running
2. Use load balancer to switch traffic
3. Monitor error logs during switchover
4. Maintain database backups for quick recovery

## Update Strategy
1. Test updates in staging environment
2. Plan maintenance window if needed
3. Deploy gradually using blue-green deployment
4. Monitor metrics during rollout
5. Have quick rollback plan ready
