# Merry Go Round Chamaa - Community Savings Platform

**Secure, Scalable, Transparent Savings & Payout Platform**

## Features
- 🔐 Enterprise-grade security (JWT, bcrypt, rate limiting)
- 📊 Real-time wallet & fund management
- 👥 Role-based access control (Super Admin, Group Admin, Members)
- 💰 Instant wallet withdrawal with tax management
- 📈 Chamaa fund withdrawal with penalties & disruption cycles
- 🛡️ Reserve fund protection for missed contributions
- 📱 Responsive mobile-first UI
- 🚀 Scalable microservices architecture
- 📉 Advanced audit logging
- ⚡ Redis caching for high performance

## Tech Stack

### Backend
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL (primary), Redis (cache)
- **Authentication**: JWT with refresh tokens
- **Security**: bcrypt, helmet, rate-limiting, CORS
- **Validation**: Joi schema validation
- **Monitoring**: Winston logging, Sentry

### Frontend
- **Framework**: React 18 + TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **HTTP Client**: Axios with interceptors
- **Real-time**: Socket.io

## Installation

```bash
# Clone repository
git clone https://github.com/kathurima254/merry-go-round-chamaa.git
cd merry-go-round-chamaa

# Backend setup
cd backend
npm install
cp .env.example .env
npm run migrate
npm start

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

## Environment Variables
See `.env.example` files in backend and frontend directories.

## Security Considerations
- All passwords hashed with bcrypt (10 rounds)
- JWT tokens with 15min expiry + refresh tokens
- Rate limiting: 100 requests/15min per IP
- SQL injection prevention via parameterized queries
- CSRF protection enabled
- Helmet security headers
- Input validation on all endpoints
- Audit logs for all transactions
