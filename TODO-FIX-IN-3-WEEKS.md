# ⚠️ REMINDER: Fix Hardcoded URLs

**Date Created:** February 2, 2026  
**Fix By:** Late February 2026 (2-3 weeks)

## What Needs to Be Fixed:

1. **GoHighLevel webhook URLs** are hardcoded in `src/services/ghl.ts`
2. **Backend API URL** is hardcoded in `src/services/api.ts` (Tailscale IP)

Both work but are not best practice.

## How to Fix:

### Step 1: Add Environment Variables to Lovable
1. Go to Lovable project settings
2. Find "Environment Variables" section
3. Add these three variables:
   ```
   VITE_GHL_WEBHOOK_CONTACT=https://services.leadconnectorhq.com/hooks/N0aVpkcKl89ZJgyo7DAS/webhook-trigger/813ef2d6-d9bd-426d-8f79-295edd009e4a
   
   VITE_GHL_WEBHOOK_RISK_ASSESSMENT=https://services.leadconnectorhq.com/hooks/N0aVpkcKl89ZJgyo7DAS/webhook-trigger/c57d1177-640c-4cc5-85d6-2fc5e28f1e66
   
   VITE_BACKEND_URL=https://northstar-backend-frnb.onrender.com
   ```

### Step 2: Remove Hardcoded URLs
Edit `src/services/ghl.ts`:

**Change FROM:**
```typescript
const GHL_WEBHOOKS = {
  contact: import.meta.env.VITE_GHL_WEBHOOK_CONTACT || "https://services.leadconnectorhq.com/...",
  riskAssessment: import.meta.env.VITE_GHL_WEBHOOK_RISK_ASSESSMENT || "https://services.leadconnectorhq.com/...",
  newsletter: import.meta.env.VITE_GHL_WEBHOOK_NEWSLETTER as string | undefined,
};
```

**Change TO:**
```typescript
const GHL_WEBHOOKS = {
  contact: import.meta.env.VITE_GHL_WEBHOOK_CONTACT as string | undefined,
  riskAssessment: import.meta.env.VITE_GHL_WEBHOOK_RISK_ASSESSMENT as string | undefined,
  newsletter: import.meta.env.VITE_GHL_WEBHOOK_NEWSLETTER as string | undefined,
};
```

### Step 3: Test
1. Redeploy in Lovable
2. Test contact form
3. Test risk assessment
4. Confirm leads appear in GoHighLevel

### Step 4: Delete This File
Once fixed, delete `TODO-FIX-IN-3-WEEKS.md`

---

## Why This Matters:

- **Security:** Hardcoded URLs are visible in the codebase
- **Flexibility:** Environment variables are easier to change without code changes
- **Best Practice:** Separates config from code

## Current Status:

✅ Working with hardcoded URLs  
⏳ Needs to be moved to environment variables

---

**Set a reminder to fix this in 2-3 weeks!**
