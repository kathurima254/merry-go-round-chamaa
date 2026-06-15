# Debugging Guide for Merry Go Round Chamaa

## 🔍 Backend Debugging

### Enable Debug Logging
```typescript
// In .env
LOG_LEVEL=debug
```

### Common Issues

#### Database Connection Error
**Symptoms**: "ECONNREFUSED 127.0.0.1:5432"

**Solution**:
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection
psql -h localhost -U chamaa_admin -d chamaa_db

# View logs
docker-compose logs postgres
```

#### JWT Token Errors
**Symptoms**: "Invalid token" or "Token expired"

**Debug**:
```bash
# Check token in browser console
const token = localStorage.getItem('accessToken');
console.log(JSON.parse(atob(token.split('.')[1])));
```

#### Rate Limiting Issues
**Symptoms**: "Too many requests"

**Solution**:
- Reduce request frequency
- Check IP is not on blocklist
- Verify rate limit settings in .env

### API Debugging

```bash
# Test endpoint with curl
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/users/profile

# View all requests
docker-compose logs -f backend | grep "HTTP Request"
```

## 📱 Frontend Debugging

### React DevTools
1. Install React DevTools extension
2. View component tree and props
3. Track Redux state changes

### Common Issues

#### API Calls Failing
```javascript
// Check network tab in DevTools
// Verify Authorization header is set
// Check CORS settings

// Debug API responses
import api from './services/api';
api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.data);
    return Promise.reject(error);
  }
);
```

#### Redux State Issues
```javascript
// Chrome Redux DevTools
// Time travel debugging
// Action history

// Manual inspection
import { store } from './store';
console.log(store.getState());
```

#### Styling Issues
- Check Tailwind CSS is compiled
- Verify class names are correct
- Check responsive breakpoints
- Use browser DevTools to inspect elements

## 🗄️ Database Debugging

### Connect to Database
```bash
# PostgreSQL CLI
docker-compose exec postgres psql -U chamaa_admin -d chamaa_db

# Common queries
SELECT * FROM users;
SELECT * FROM transactions WHERE user_id = 'YOUR_ID';
SELECT COUNT(*) FROM wallet;
```

### Check Indexes
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'users';
```

### Slow Query Analysis
```sql
EXPLAIN ANALYZE SELECT * FROM wallet WHERE user_id = 'ID';
```

## 💾 Redis Debugging

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Check keys
KEYS *

# Get value
GET key_name

# Clear all
FLUSHALL

# Monitor
MONITOR
```

## 📊 Performance Profiling

### Backend Profiling
```bash
# Generate CPU profile
node --prof dist/index.js

# Analyze
node --prof-process isolate-*.log > profile.txt
```

### Frontend Profiling
- DevTools Lighthouse
- DevTools Performance tab
- WebPageTest

## 🧮 Error Codes

### HTTP Status Codes
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **429**: Too Many Requests (rate limited)
- **500**: Server Error

### Custom Error Codes
- **NO_TOKEN**: Authentication token missing
- **TOKEN_EXPIRED**: Token has expired
- **INVALID_CREDENTIALS**: Wrong username/password
- **INSUFFICIENT_BALANCE**: Not enough funds
- **USER_EXISTS**: User already registered

## 📝 Logging Best Practices

```typescript
// Use proper log levels
logger.error('Critical error:', error);
logger.warn('Warning situation');
logger.info('Important info');
logger.debug('Debug details');

// Include context
logger.info('User action', {
  userId: req.user.id,
  action: 'withdraw',
  amount: 1000,
  timestamp: new Date(),
});
```

## 🔐 Security Debugging

### Check Authorization
```bash
# Verify JWT signature
echo "YOUR_TOKEN" | cut -d '.' -f3 | base64 -d

# Check expiry
jwt decode "YOUR_TOKEN"
```

### Audit Logs
```bash
# View audit trail
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20;
```

## 🆘 Getting Help

1. Check logs first
2. Verify environment variables
3. Test connectivity
4. Review error messages
5. Check documentation
6. Create detailed bug report
