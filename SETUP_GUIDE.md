# Merry Go Round Chamaa - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development without Docker)
- PostgreSQL 15+ (if not using Docker)
- Redis 7+ (if not using Docker)

### Using Docker (Recommended)

```bash
# Make scripts executable
chmod +x start.sh stop.sh

# Start development environment
./start.sh

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Adminer (DB UI): http://localhost:8080
```

### Local Setup (Without Docker)

**Backend Setup:**
```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run dev
```

**Frontend Setup (new terminal):**
```bash
cd frontend
cp .env.example .env
npm install
npm start
```

## 📁 Project Structure

```
merry-go-round-chamaa/
├── backend/
│   ├── src/
│   │   ├── database/        # Database connection & migrations
│   │   ├── middleware/      # Auth, rate limiting, error handling
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # Utilities (logger, helpers)
│   │   ├── websocket/       # Real-time features
│   │   ├── cache/           # Redis cache layer
│   │   └── index.ts         # App entry point
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── store/           # Redux store & slices
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main app component
│   │   └── index.tsx        # React entry point
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docker-compose.yml       # Docker services configuration
├── start.sh                 # Start development script
├── stop.sh                  # Stop development script
└── README.md               # This file
```

## 🔑 Key Features

### Security
- ✅ JWT authentication with refresh tokens
- ✅ Bcrypt password hashing
- ✅ Rate limiting (100 req/15min)
- ✅ CORS protection
- ✅ SQL injection prevention
- ✅ 2FA support
- ✅ Audit logging

### Scalability
- ✅ Redis caching layer
- ✅ Connection pooling
- ✅ Database indexing
- ✅ Horizontal scaling ready
- ✅ WebSocket support
- ✅ Load balancer compatible

### User Experience
- ✅ Responsive design
- ✅ Real-time notifications
- ✅ Error handling with user-friendly messages
- ✅ Loading states & animations
- ✅ Toast notifications
- ✅ Dark mode ready

## 🛠️ Development

### Backend Development

```bash
cd backend

# Watch mode (auto-reload)
npm run dev

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm test

# Build for production
npm run build
```

### Frontend Development

```bash
cd frontend

# Development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## 📊 Database Schema

Key tables:
- `users` - User accounts & authentication
- `groups` - Savings groups
- `group_members` - Group membership
- `wallet` - User balance transactions
- `contributions` - Member contributions
- `missed_contributions` - Penalty tracking
- `chamaa_fund` - Group fund cycles
- `withdrawals` - Withdrawal requests
- `reserve_fund` - Group reserves
- `audit_logs` - Transaction audits

## 🔍 Debugging

### View Logs
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Database logs
docker-compose logs -f postgres

# Redis logs
docker-compose logs -f redis
```

### Database Access
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U chamaa_admin -d chamaa_db

# Redis CLI
docker-compose exec redis redis-cli
```

## 📈 Performance Tips

1. **API Response Caching**: Use Redis for frequently accessed data
2. **Database Indexing**: Indexes are already created for common queries
3. **Pagination**: Always paginate list endpoints
4. **Connection Pooling**: Database pool size is configurable
5. **Compression**: Gzip enabled for responses

## 🚀 Deployment

### Production Build
```bash
# Build images
docker-compose build

# Tag images
docker tag chamaa_backend:latest your-registry/chamaa-backend:1.0.0
docker tag chamaa_frontend:latest your-registry/chamaa-frontend:1.0.0

# Push to registry
docker push your-registry/chamaa-backend:1.0.0
docker push your-registry/chamaa-frontend:1.0.0
```

### Environment Variables (Production)
- Set strong JWT secrets (min 32 chars)
- Use managed PostgreSQL & Redis
- Enable 2FA
- Configure email service
- Set up monitoring & logging

## 📝 API Documentation

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
```

### Wallet
```
GET  /api/wallet/balance
GET  /api/transactions/history
POST /api/wallet/withdraw
```

### Groups
```
GET  /api/groups
POST /api/groups
GET  /api/groups/:id/stats
POST /api/groups/:id/members
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Database Migration Fails
```bash
# Reset database
docker-compose exec postgres dropdb -U chamaa_admin chamaa_db
docker-compose exec backend npm run migrate
```

### Redis Connection Error
```bash
# Verify Redis
docker-compose exec redis redis-cli ping
```

## 📞 Support

For issues and questions:
1. Check logs first
2. Review database schema
3. Verify environment variables
4. Check network connectivity

## 📄 License

Copyright © 2026 Merry Go Round. All rights reserved.
