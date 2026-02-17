/**
 * Telivy API Service
 * Handles all communication with the Telivy Security API
 */

const API_BASE_URL = import.meta.env.VITE_TELIVY_API_BASE_URL || 'https://api-v1.telivy.com/api/v1';
const API_KEY = import.meta.env.VITE_TELIVY_API_KEY;

interface TelivyError {
  message: string;
  statusCode?: number;
}

interface AssessmentDetailsInput {
  organizationName: string;
  domain: string;
  clientCategory?: 'breakfix' | 'it_only' | 'security_only' | 'it_and_security';
  clientStatus?: 'suspect' | 'lead' | 'client';
}

interface AssessmentDetails {
  organization_name: string;
  domain_prim: string;
  organization_address?: Record<string, unknown>;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_email?: string;
  business_phone?: string;
  annual_revenue?: number;
  employee_count?: number;
  primary_operations?: string;
}

interface SecurityGrades {
  socialEngineering: string;
  networkSecurity: string;
  applicationSecurity: string;
  dnsHealth: string;
  ipReputation: string;
  externalVulnerabilities: string;
}

interface ExternalScanAssessment {
  id: string;
  scanStatus: 'not_started' | 'in_progress' | 'completed' | 'archived';
  assessmentDetails: AssessmentDetails;
  securityScore: string;
  lastScannedAt: string | null;
  createdAt: string;
  updatedAt: string;
  grades?: SecurityGrades;
}

interface CreateAssessmentResponse {
  id: string;
  scanStatus: string;
  assessmentDetails: AssessmentDetails;
  securityScore: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Helper to make authenticated requests to Telivy API
 */
async function telivyFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!API_KEY) {
    throw new Error('Telivy API key not configured');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: TelivyError = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
      statusCode: response.status,
    }));
    
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Create a new external scan assessment
 */
export async function createExternalScan(
  data: AssessmentDetailsInput
): Promise<CreateAssessmentResponse> {
  return telivyFetch<CreateAssessmentResponse>('/security/external-scans', {
    method: 'POST',
    body: JSON.stringify({
      organizationName: data.organizationName,
      domain: data.domain,
      clientCategory: data.clientCategory || 'lead',
      clientStatus: data.clientStatus || 'lead',
    }),
  });
}

/**
 * Get assessment details by ID
 */
export async function getAssessment(assessmentId: string): Promise<ExternalScanAssessment> {
  return telivyFetch<ExternalScanAssessment>(`/security/external-scans/${assessmentId}`);
}

/**
 * Poll assessment status until completion (with timeout)
 */
export async function pollAssessmentStatus(
  assessmentId: string,
  maxAttempts: number = 60, // 60 attempts = 5 minutes at 5s intervals
  intervalMs: number = 5000
): Promise<ExternalScanAssessment> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const assessment = await getAssessment(assessmentId);
    
    if (assessment.scanStatus === 'completed' || assessment.scanStatus === 'archived') {
      return assessment;
    }
    
    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error('Assessment scan timed out');
}

/**
 * Get assessment findings
 */
export async function getAssessmentFindings(assessmentId: string) {
  return telivyFetch(`/security/external-scans/${assessmentId}/findings`);
}

/**
 * List all assessments with optional filters
 */
export async function listAssessments(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const queryParams = new URLSearchParams();
  
  if (params?.search) queryParams.append('search', params.search);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());
  
  const query = queryParams.toString();
  const endpoint = query ? `/security/external-scans?${query}` : '/security/external-scans';
  
  return telivyFetch(endpoint);
}

/**
 * Calculate overall risk level based on security score
 */
export function calculateRiskLevel(securityScore: string): 'strong' | 'needs-attention' | 'at-risk' {
  switch (securityScore.toUpperCase()) {
    case 'A':
    case 'B':
      return 'strong';
    case 'C':
      return 'needs-attention';
    case 'D':
    case 'F':
      return 'at-risk';
    default:
      return 'needs-attention';
  }
}
