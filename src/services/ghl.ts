/**
 * GoHighLevel Integration Service
 * 
 * Centralized service for sending form submissions to GoHighLevel webhooks.
 * Configure webhook URLs in environment variables.
 */

// TODO: Move to environment variables in 2-3 weeks (after testing confirmed working)
// TEMPORARY: Hardcoded for testing - needs to be moved to Lovable environment variables
const GHL_WEBHOOKS = {
  contact: import.meta.env.VITE_GHL_WEBHOOK_CONTACT || "https://services.leadconnectorhq.com/hooks/N0aVpkcKl89ZJgyo7DAS/webhook-trigger/813ef2d6-d9bd-426d-8f79-295edd009e4a",
  riskAssessment: import.meta.env.VITE_GHL_WEBHOOK_RISK_ASSESSMENT || "https://services.leadconnectorhq.com/hooks/N0aVpkcKl89ZJgyo7DAS/webhook-trigger/c57d1177-640c-4cc5-85d6-2fc5e28f1e66",
  newsletter: import.meta.env.VITE_GHL_WEBHOOK_NEWSLETTER as string | undefined,
};

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  source?: string; // Where the form was submitted from
}

export interface RiskAssessmentFormData {
  organizationName: string;
  domain: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  securityScore?: string;
  overallRisk?: string;
  assessmentId?: string;
  assessmentUrl?: string;
}

export interface NewsletterFormData {
  email: string;
  source?: string;
}

/**
 * Send contact form submission to GoHighLevel
 */
export async function submitContactForm(data: ContactFormData): Promise<boolean> {
  const webhookUrl = GHL_WEBHOOKS.contact;

  if (!webhookUrl) {
    if (import.meta.env.DEV) {
      console.warn('GHL Contact webhook URL not configured. Set VITE_GHL_WEBHOOK_CONTACT in .env');
    }
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        submittedAt: new Date().toISOString(),
        source: data.source || 'website',
      }),
    });

    if (!response.ok) {
      throw new Error(`GHL webhook failed: ${response.status}`);
    }

    if (import.meta.env.DEV) {
      console.log('Contact form submitted to GHL successfully');
    }
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to submit contact form to GHL:', error);
    }
    return false;
  }
}

/**
 * Send risk assessment data to GoHighLevel
 */
export async function submitRiskAssessment(data: RiskAssessmentFormData): Promise<boolean> {
  const webhookUrl = GHL_WEBHOOKS.riskAssessment;

  if (!webhookUrl) {
    if (import.meta.env.DEV) {
      console.warn('GHL Risk Assessment webhook URL not configured. Set VITE_GHL_WEBHOOK_RISK_ASSESSMENT in .env');
    }
    return false;
  }

  try {
    // Split contact name into first and last name
    const nameParts = data.contactName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email: data.contactEmail,
        phone: data.contactPhone,
        companyName: data.organizationName,
        domain: data.domain,
        securityScore: data.securityScore,
        riskLevel: data.overallRisk,
        assessmentId: data.assessmentId,
        assessmentUrl: data.assessmentUrl,
        submittedAt: new Date().toISOString(),
        source: 'risk-assessment-tool',
      }),
    });

    if (!response.ok) {
      throw new Error(`GHL webhook failed: ${response.status}`);
    }

    if (import.meta.env.DEV) {
      console.log('Risk assessment submitted to GHL successfully');
    }
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to submit risk assessment to GHL:', error);
    }
    return false;
  }
}

/**
 * Send newsletter signup to GoHighLevel
 */
export async function submitNewsletterSignup(data: NewsletterFormData): Promise<boolean> {
  const webhookUrl = GHL_WEBHOOKS.newsletter;

  if (!webhookUrl) {
    if (import.meta.env.DEV) {
      console.warn('GHL Newsletter webhook URL not configured. Set VITE_GHL_WEBHOOK_NEWSLETTER in .env');
    }
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        submittedAt: new Date().toISOString(),
        source: data.source || 'website-newsletter',
      }),
    });

    if (!response.ok) {
      throw new Error(`GHL webhook failed: ${response.status}`);
    }

    if (import.meta.env.DEV) {
      console.log('Newsletter signup submitted to GHL successfully');
    }
    return true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to submit newsletter signup to GHL:', error);
    }
    return false;
  }
}

/**
 * Check if GHL integration is configured
 */
export function isGHLConfigured(): {
  contact: boolean;
  riskAssessment: boolean;
  newsletter: boolean;
} {
  return {
    contact: !!GHL_WEBHOOKS.contact,
    riskAssessment: !!GHL_WEBHOOKS.riskAssessment,
    newsletter: !!GHL_WEBHOOKS.newsletter,
  };
}
