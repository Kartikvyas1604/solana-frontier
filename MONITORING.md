# ShieldVault - Monitoring & Observability

## Health Check Endpoints

### Basic Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "healthy": true,
  "timestamp": "2026-04-17T22:09:54.000Z",
  "services": {
    "database": true,
    "redis": true,
    "solana": true
  }
}
```

### Detailed Health Check
```bash
curl http://localhost:3000/health/detailed
```

Response includes:
- Service latencies (database, redis, solana)
- Solana slot and block height
- Worker status (last run time, health status)

### Metrics Endpoint
```bash
curl http://localhost:3000/metrics
```

Response includes:
- Vault metrics (deposits, withdrawals, active positions, users)
- Hedge metrics (opened, closed, active, total P&L, funding paid)
- Policy metrics (active, triggered)
- System metrics (uptime, memory usage)

---

## Worker Monitoring

Workers update their status in Redis on each run:

```bash
redis-cli
> GET worker:priceMonitor:lastRun
> GET worker:triggerEvaluator:lastRun
> GET worker:hedgeManager:lastRun
```

Worker health statuses:
- `healthy`: Last run < 1 minute ago
- `warning`: Last run 1-5 minutes ago
- `stale`: Last run > 5 minutes ago
- `never_run`: Worker has never executed

---

## PM2 Monitoring

```bash
# View all services
pm2 status

# View logs
pm2 logs shieldvault-api
pm2 logs price-monitor
pm2 logs trigger-evaluator

# View specific service metrics
pm2 show shieldvault-api

# Monitor in real-time
pm2 monit
```

---

## Database Monitoring

### Prisma Studio
```bash
cd backend
npx prisma studio
```

Opens web UI at http://localhost:5555

### Direct SQL Queries
```bash
psql postgresql://postgres:password@localhost:5432/shieldvault

-- Active vault positions
SELECT wallet_address, sol_amount, shares, status FROM "VaultPosition" WHERE status = 'ACTIVE';

-- Active hedges
SELECT id, wallet_address, entry_price, short_size_sol, status FROM "HedgePosition" WHERE status = 'OPEN';

-- Recent audit logs
SELECT * FROM "AuditLog" ORDER BY timestamp DESC LIMIT 10;
```

---

## Redis Monitoring

```bash
redis-cli

# View all keys
KEYS *

# Current price data
GET price:current

# Worker status
KEYS worker:*

# Queue stats
LLEN bull:hedge:waiting
LLEN bull:hedge:active
LLEN bull:hedge:completed
```

---

## Solana Monitoring

### Check Vault Balance
```bash
solana balance $(solana-keygen pubkey backend/keys/vault-keypair.json) --url devnet
```

### Check Recent Transactions
```bash
solana transaction-history $(solana-keygen pubkey backend/keys/vault-keypair.json) --url devnet
```

### Monitor RPC Health
```bash
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getHealth"
}'
```

---

## Drift Protocol Monitoring

### Check Drift Position
```bash
# View position in Drift UI
https://app.drift.trade/overview

# Or query via backend API
curl http://localhost:3000/api/hedge/active/YOUR_WALLET_ADDRESS
```

---

## Alerting Setup

### Uptime Monitoring
Use services like:
- UptimeRobot (free tier available)
- Pingdom
- StatusCake

Monitor:
- `GET /health` - Should return 200
- `GET /api/price/current` - Should return valid price

### Log Aggregation
Recommended services:
- Datadog
- Sentry (for error tracking)
- LogDNA / Mezmo
- Papertrail

### Custom Alerts

Create a monitoring script:

```bash
#!/bin/bash
# monitor.sh

HEALTH=$(curl -s http://localhost:3000/health | jq -r '.healthy')

if [ "$HEALTH" != "true" ]; then
  echo "ALERT: ShieldVault health check failed"
  # Send notification (email, Slack, PagerDuty, etc.)
fi
```

Run via cron:
```bash
# Check every 5 minutes
*/5 * * * * /path/to/monitor.sh
```

---

## Performance Monitoring

### Response Time Tracking
Fastify includes built-in metrics. Enable with:

```typescript
// In server.ts
fastify.addHook('onResponse', (request, reply, done) => {
  const responseTime = reply.getResponseTime();
  logger.info('Request completed', {
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    responseTime,
  });
  done();
});
```

### Database Query Performance
```sql
-- Slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

---

## Troubleshooting Dashboard

Quick diagnostic commands:

```bash
# Check all services
docker-compose ps
pm2 status
curl http://localhost:3000/health/detailed

# Check logs
pm2 logs --lines 50
docker-compose logs postgres
docker-compose logs redis

# Check disk space
df -h

# Check memory
free -m

# Check network
netstat -tuln | grep -E '3000|5432|6379'
```

---

## Production Recommendations

1. **APM (Application Performance Monitoring)**
   - Datadog APM
   - New Relic
   - Dynatrace

2. **Error Tracking**
   - Sentry (already configured in logger)
   - Rollbar
   - Bugsnag

3. **Infrastructure Monitoring**
   - Prometheus + Grafana
   - CloudWatch (AWS)
   - Google Cloud Monitoring

4. **Alerting Channels**
   - PagerDuty for critical alerts
   - Slack for warnings
   - Email for daily summaries

5. **SLA Targets**
   - API availability: 99.9%
   - Response time p95: < 500ms
   - Worker lag: < 30 seconds
   - Price feed freshness: < 5 seconds

---

## Health Check Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Health Check
  run: |
    sleep 10
    curl -f http://localhost:3000/health || exit 1
```

---

**Status**: ✅ Complete monitoring and health check system implemented.
