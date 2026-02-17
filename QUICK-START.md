# 🚀 Quick Start Guide

## Start Both Servers

```bash
cd /home/noah.satkunam/clawd/northstar-portal

# Start backend API (port 3001)
tmux new-session -d -s northstar-api 'node server.mjs'

# Start frontend dev server (port 8080)
tmux new-session -d -s northstar-dev 'npm run dev'

# Verify both are running
tmux list-sessions
```

## Access the Website

- **From browser:** http://localhost:8080
- **From network:** http://100.123.128.103:8080
- **Risk Assessment:** http://100.123.128.103:8080/risk-assessment

## Check Server Status

```bash
# Backend health check
curl http://localhost:3001/health

# Frontend check
curl http://localhost:8080
```

## View Logs

```bash
# Backend logs
tmux attach -t northstar-api

# Frontend logs
tmux attach -t northstar-dev

# (Press Ctrl+B then D to detach)
```

## Restart Servers

```bash
# Kill sessions
tmux kill-session -t northstar-api
tmux kill-session -t northstar-dev

# Start again
tmux new-session -d -s northstar-api 'cd /home/noah.satkunam/clawd/northstar-portal && node server.mjs'
tmux new-session -d -s northstar-dev 'cd /home/noah.satkunam/clawd/northstar-portal && npm run dev'
```

## Test the Risk Assessment

1. Go to http://100.123.128.103:8080/risk-assessment
2. Fill in form:
   - Organization: "Test Company"
   - Domain: "google.com"
   - Your name and email
3. Click "Start Assessment"
4. Wait 2-5 minutes
5. See real Telivy results!

---

## 📁 Important Files

- `server.mjs` - Backend API server
- `src/services/api.ts` - Frontend API service
- `.env.local` - Environment variables (contains API key)
- `AUDIT-AND-FIXES.md` - Complete documentation

---

**Both servers are running now!**  
**Test on your iPhone: http://100.123.128.103:8080/risk-assessment** 📱
