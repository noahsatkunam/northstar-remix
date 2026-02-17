/**
 * Backend API Service
 * Calls our Express backend which proxies to Telivy
 * This keeps API keys secure and handles CORS properly
 */

// TODO: Move to environment variable in 2-3 weeks (same as GHL webhooks)
// Using Render.com hosted backend (public URL, works from anywhere)
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://northstar-backend-frnb.onrender.com';

interface ApiError {
  error: string;
  details?: unknown;
}

/**
 * Helper to make requests to our backend
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = data;
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
}

// ==================== TYPES ====================

interface AssessmentDetailsInput {
  organizationName: string;
  domain: string;
  clientCategory?: 'breakfix' | 'it_only' | 'security_only' | 'it_and_security';
  clientStatus?: 'suspect' | 'lead' | 'client';
}

interface AssessmentDetails {
  organization_name: string;
  domain_prim: string;
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

export interface ExternalScanAssessment {
  id: string;
  scanStatus: 'not_started' | 'in_progress' | 'completed' | 'archived';
  assessmentDetails: AssessmentDetails;
  securityScore: string;
  lastScannedAt: string | null;
  createdAt: string;
  updatedAt: string;
  grades?: SecurityGrades;
}

// ==================== API FUNCTIONS ====================

/**
 * Create a new external scan assessment
 */
export async function createExternalScan(
  data: AssessmentDetailsInput
): Promise<ExternalScanAssessment> {
  return apiFetch<ExternalScanAssessment>('/api/assessments/create', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get assessment details by ID
 */
export async function getAssessment(assessmentId: string): Promise<ExternalScanAssessment> {
  return apiFetch<ExternalScanAssessment>(`/api/assessments/${assessmentId}`);
}

/**
 * Poll assessment status until completion (with timeout)
 */
export async function pollAssessmentStatus(
  assessmentId: string,
  maxAttempts: number = 60, // 60 attempts = 5 minutes at 5s intervals
  intervalMs: number = 5000,
  onProgress?: (attempt: number, status: string) => void
): Promise<ExternalScanAssessment> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const assessment = await getAssessment(assessmentId);
    
    if (onProgress) {
      onProgress(attempts + 1, assessment.scanStatus);
    }
    
    if (assessment.scanStatus === 'completed' || assessment.scanStatus === 'archived') {
      return assessment;
    }
    
    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error('Assessment scan timed out. This assessment may still be processing. Check back later or contact support.');
}

/**
 * Get assessment findings
 */
export async function getAssessmentFindings(assessmentId: string) {
  return apiFetch(`/api/assessments/${assessmentId}/findings`);
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
  const endpoint = query ? `/api/assessments?${query}` : '/api/assessments';
  
  return apiFetch(endpoint);
}

/**
 * Calculate overall risk level based on security score
 */
export function calculateRiskLevel(securityScore: string): 'strong' | 'needs-attention' | 'at-risk' {
  const score = securityScore.toUpperCase();
  
  // Handle n/a or unknown scores
  if (score === 'N/A' || score === 'UNKNOWN' || !score) {
    return 'needs-attention';
  }
  
  switch (score) {
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

/**
 * Get breach data for an assessment
 */
export async function getBreachData(assessmentId: string) {
  return apiFetch<any>(`/api/assessments/${assessmentId}/breach-data`);
}

/**
 * Get finding details by slug
 */
export async function getFindingDetails(assessmentId: string, slug: string) {
  return apiFetch<any>(`/api/assessments/${assessmentId}/findings/${slug}`);
}

/**
 * Get report download URL
 */
export function getReportUrl(assessmentId: string, format: string = 'pdf'): string {
  return `${API_BASE_URL}/api/assessments/${assessmentId}/report?format=${format}`;
}

/**
 * Check backend health
 */
export async function checkHealth() {
  return apiFetch('/health');
}
