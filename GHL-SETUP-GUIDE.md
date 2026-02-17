# GoHighLevel Integration Setup Guide

This guide will help you connect your NorthStar website forms to GoHighLevel CRM.

## Overview

The website now has three forms ready for GHL integration:
1. **Contact Form** - Main contact modal form
2. **Risk Assessment Form** - Security assessment lead capture
3. **Newsletter Signup** - Email list building (future)

## Prerequisites

- GoHighLevel account with webhook access
- Admin access to your GHL location/sub-account

## Step-by-Step Setup

### 1. Create Webhooks in GoHighLevel

#### Option A: Using GHL Workflows (Recommended)

1. **Log into GoHighLevel**
   - Go to your location/sub-account
   - Navigate to **Automation** → **Workflows**

2. **Create Contact Form Workflow**
   - Click **Create Workflow**
   - Name it: "Website Contact Form"
   - Trigger: **Webhook** 
   - Copy the webhook URL (looks like: `https://services.leadconnectorhq.com/hooks/...`)
   - Save the webhook URL for later

3. **Add Actions to Workflow**
   - **Add Contact**: Create/update contact
   - **Send Email**: Notify your team
   - **Create Opportunity**: Start sales pipeline
   - **Assign to User**: Route to sales rep

4. **Map Fields** (Contact Form Webhook)
   ```json
   {
     "firstName": "{{firstName}}",
     "lastName": "{{lastName}}",
     "email": "{{email}}",
     "phone": "{{phone}}",
     "companyName": "{{company}}",
     "customField:message": "{{message}}",
     "source": "{{source}}",
     "submittedAt": "{{submittedAt}}"
   }
   ```

5. **Repeat for Risk Assessment**
   - Create another workflow: "Website Risk Assessment"
   - Get webhook URL
   - Map these fields:
   ```json
   {
     "firstName": "{{firstName}}",
     "lastName": "{{lastName}}",
     "email": "{{email}}",
     "phone": "{{phone}}",
     "companyName": "{{companyName}}",
     "customField:domain": "{{domain}}",
     "customField:securityScore": "{{securityScore}}",
     "customField:riskLevel": "{{riskLevel}}",
     "customField:assessmentId": "{{assessmentId}}",
     "customField:assessmentUrl": "{{assessmentUrl}}",
     "source": "risk-assessment-tool"
   }
   ```

#### Option B: Using GHL Custom Values (Alternative)

1. **Create Custom Fields** (if needed)
   - Go to **Settings** → **Custom Fields**
   - Add fields for:
     - `domain`
     - `securityScore`
     - `riskLevel`
     - `assessmentId`
     - `assessmentUrl`
     - `message`

2. **Get Webhook URLs**
   - Follow workflow steps above to get webhook URLs

### 2. Configure Environment Variables

1. **Copy the example file**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your webhook URLs to `.env.local`**
   ```bash
   # Contact Form Webhook
   VITE_GHL_WEBHOOK_CONTACT=https://services.leadconnectorhq.com/hooks/YOUR_CONTACT_WEBHOOK_ID
   
   # Risk Assessment Webhook
   VITE_GHL_WEBHOOK_RISK_ASSESSMENT=https://services.leadconnectorhq.com/hooks/YOUR_RISK_ASSESSMENT_WEBHOOK_ID
   
   # Newsletter Webhook (optional for now)
   VITE_GHL_WEBHOOK_NEWSLETTER=https://services.leadconnectorhq.com/hooks/YOUR_NEWSLETTER_WEBHOOK_ID
   ```

3. **Restart dev server**
   ```bash
   npm run dev
   ```

### 3. Test the Integration

#### Test Contact Form
1. Open the website
2. Click "Contact Us" or any CTA button
3. Fill out the contact form
4. Submit
5. Check GHL:
   - New contact should appear
   - Workflow should trigger
   - Check workflow logs

#### Test Risk Assessment Form
1. Go to `/risk-assessment`
2. Fill out the form with test data
3. Run the assessment
4. After completion, check GHL:
   - Contact created with assessment data
   - Custom fields populated
   - Workflow triggered

### 4. Production Deployment

When deploying to production:

1. **Add environment variables to hosting platform**
   - **Vercel**: Settings → Environment Variables
   - **Netlify**: Site Settings → Environment Variables
   - Add all `VITE_GHL_WEBHOOK_*` variables

2. **Redeploy the site**

3. **Test in production**
   - Submit real forms
   - Verify GHL receives data

## Data Sent to GoHighLevel

### Contact Form
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@company.com",
  "phone": "+1 (555) 123-4567",
  "company": "Company Name",
  "message": "I need help with...",
  "source": "contact-modal",
  "submittedAt": "2026-01-31T12:00:00.000Z"
}
```

### Risk Assessment Form
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@company.com",
  "phone": "+1 (555) 123-4567",
  "companyName": "Company Name",
  "domain": "company.com",
  "securityScore": "B",
  "riskLevel": "needs-attention",
  "assessmentId": "abc-123",
  "assessmentUrl": "https://northstar-tg.com/risk-assessment",
  "source": "risk-assessment-tool",
  "submittedAt": "2026-01-31T12:00:00.000Z"
}
```

## Recommended GHL Pipelines

### Contact Form Pipeline
1. **New Lead** → Contact form submitted
2. **Qualification** → Sales team reviews
3. **Meeting Scheduled** → Discovery call booked
4. **Proposal Sent** → Quote delivered
5. **Won** → Client onboarded

### Risk Assessment Pipeline
1. **Assessment Complete** → Form submitted
2. **Report Reviewed** → Team analyzes results
3. **Follow-up Call** → Discuss findings
4. **Proposal Sent** → Security solution quote
5. **Won** → Security services sold

## Automation Ideas

### Immediate Actions
- [ ] Send confirmation email to lead
- [ ] Notify sales team via email/SMS
- [ ] Create Slack notification (if integrated)
- [ ] Add to nurture sequence

### Follow-up Sequence
- Day 1: Welcome email with resources
- Day 3: Case study email
- Day 7: Check-in call from sales
- Day 14: Special offer email

### Risk Assessment Specific
- Send detailed PDF report via email
- Schedule automatic follow-up call
- Add to high-priority pipeline if score is low
- Trigger custom alerts based on risk level

## Troubleshooting

### Forms not appearing in GHL?

1. **Check webhook URLs**
   ```bash
   # Verify environment variables are set
   echo $VITE_GHL_WEBHOOK_CONTACT
   ```

2. **Check browser console**
   - Open DevTools → Console
   - Look for GHL-related errors
   - Check Network tab for webhook calls

3. **Test webhook manually**
   ```bash
   curl -X POST https://services.leadconnectorhq.com/hooks/YOUR_WEBHOOK_ID \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Test","lastName":"User","email":"test@example.com"}'
   ```

4. **Check GHL workflow logs**
   - Go to Workflow
   - Click on "Logs" tab
   - Look for errors or failed executions

### Webhook returns error?

- Verify webhook URL is correct
- Check if workflow is enabled
- Ensure required fields are mapped
- Check GHL account permissions

### Contact created but fields missing?

- Verify custom fields exist in GHL
- Check field mapping in workflow
- Ensure field names match exactly

## Next Steps

After integration is working:

1. **Set up notifications**
   - Email alerts for new leads
   - Slack/Discord webhooks
   - SMS alerts for high-value leads

2. **Create nurture sequences**
   - Email drip campaigns
   - Retargeting workflows
   - Follow-up reminders

3. **Track conversions**
   - Monitor form submission rates
   - Track lead-to-customer conversion
   - Optimize pipelines based on data

4. **A/B testing**
   - Test different form fields
   - Optimize CTA placement
   - Experiment with messaging

## Support

- **GHL Documentation**: https://help.gohighlevel.com/
- **GHL Community**: https://community.gohighlevel.com/
- **Technical Issues**: Check browser console and GHL workflow logs

---

**Last Updated**: January 31, 2026  
**Version**: 1.0 - Initial GHL Integration  
**Status**: Ready for pipeline setup
