import { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  Loader2,
  Globe,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Building,
  Phone,
  Server,
  Users,
  Bug,
  Download,
  ExternalLink,
  Lock,
} from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import {
  createExternalScan,
  getAssessment,
  getAssessmentFindings,
  getBreachData,
  getFindingDetails,
  getReportUrl,
  calculateRiskLevel,
  type ExternalScanAssessment,
} from "@/services/api";
import { submitRiskAssessment } from "@/services/ghl";

// ==================== TYPES ====================

type RecordStatus = "pass" | "fail" | "warning" | "unknown";
type OverallScore = "strong" | "needs-attention" | "at-risk";
type SecurityGrade = "A" | "B" | "C" | "D" | "F" | "n/a";

interface RecordResult {
  status: RecordStatus;
  value: string;
  explanation: string;
}

interface EmailCheckResults {
  dmarc: RecordResult;
  spf: RecordResult;
  dkim: RecordResult & { selectors?: string[] };
  overallScore: OverallScore;
}

interface AssessmentForm {
  firstName: string;
  lastName: string;
  email: string;
  organizationName: string;
  domain: string;
  phone?: string;
}

interface CategoryConfig {
  key: string;
  gradeKey: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

const CATEGORIES: CategoryConfig[] = [
  { key: "social_engineering", gradeKey: "socialEngineering", name: "Social Engineering", icon: Users, description: "Emails of employees exposed on the internet" },
  { key: "network_security", gradeKey: "networkSecurity", name: "Network Security", icon: Shield, description: "Insecure network configurations and settings" },
  { key: "application_security", gradeKey: "applicationSecurity", name: "Application Security", icon: Globe, description: "Common website and application vulnerabilities" },
  { key: "dns_health", gradeKey: "dnsHealth", name: "DNS Health", icon: Server, description: "The health of your domain name server" },
  { key: "ip_reputation", gradeKey: "ipReputation", name: "IP Reputation", icon: AlertTriangle, description: "Suspicious activity from your IPs" },
  { key: "external_vulnerabilities", gradeKey: "externalVulnerabilities", name: "External Vulnerabilities", icon: Bug, description: "Exposures and risks on external assets" },
];

// ==================== DNS LOOKUP FUNCTIONS ====================

async function dnsLookup(name: string, type: string = "TXT"): Promise<string[]> {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`);
    const data = await res.json();
    if (data.Status !== 0 || !data.Answer) return [];
    return data.Answer.map((a: { data: string }) => a.data.replace(/"/g, ""));
  } catch {
    return [];
  }
}

async function checkDMARC(domain: string): Promise<RecordResult> {
  const records = await dnsLookup(`_dmarc.${domain}`);
  const dmarcRecord = records.find(r => r.startsWith("v=DMARC1"));

  if (!dmarcRecord) {
    return { status: "fail", value: "", explanation: "No DMARC record found. Your domain is not protected against email spoofing. Anyone can send emails pretending to be from your domain." };
  }

  const policyMatch = dmarcRecord.match(/;\s*p=(\w+)/);
  const policy = policyMatch ? policyMatch[1].toLowerCase() : "none";

  if (policy === "reject") {
    return { status: "pass", value: dmarcRecord, explanation: "DMARC record found with 'reject' policy. Unauthorized emails will be rejected. This is the strongest protection." };
  } else if (policy === "quarantine") {
    return { status: "pass", value: dmarcRecord, explanation: "DMARC record found with 'quarantine' policy. Unauthorized emails will be sent to spam. Consider upgrading to 'reject' for maximum protection." };
  } else {
    return { status: "warning", value: dmarcRecord, explanation: "DMARC record found but policy is set to 'none', which only monitors without blocking spoofed emails. Upgrade to 'quarantine' or 'reject' for real protection." };
  }
}

async function checkSPF(domain: string): Promise<RecordResult> {
  const records = await dnsLookup(domain);
  const spfRecord = records.find(r => r.includes("v=spf1"));

  if (!spfRecord) {
    return { status: "fail", value: "", explanation: "No SPF record found. Without SPF, receiving servers cannot verify which mail servers are authorized to send email for your domain." };
  }

  if (spfRecord.includes("-all")) {
    return { status: "pass", value: spfRecord, explanation: "SPF record found with strict '-all' policy. Only authorized servers can send email for your domain." };
  } else if (spfRecord.includes("~all")) {
    return { status: "warning", value: spfRecord, explanation: "SPF record found with soft fail '~all' policy. Unauthorized emails may still be delivered. Consider switching to '-all' for stricter enforcement." };
  } else if (spfRecord.includes("?all") || spfRecord.includes("+all")) {
    return { status: "fail", value: spfRecord, explanation: "SPF record found but with a permissive policy that doesn't protect against spoofing. Update to '-all' to block unauthorized senders." };
  }

  return { status: "warning", value: spfRecord, explanation: "SPF record found but the enforcement mechanism could not be determined. Review your SPF configuration." };
}

const DKIM_SELECTORS = ["google", "selector1", "selector2", "default", "k1", "s1", "s2", "dkim", "mail"];

async function checkDKIM(domain: string): Promise<RecordResult & { selectors?: string[] }> {
  const foundSelectors: string[] = [];

  const results = await Promise.all(
    DKIM_SELECTORS.map(async (sel) => {
      const records = await dnsLookup(`${sel}._domainkey.${domain}`);
      const dkimRecord = records.find(r => r.includes("v=DKIM1") || r.includes("p="));
      return dkimRecord ? sel : null;
    })
  );

  for (const sel of results) {
    if (sel) foundSelectors.push(sel);
  }

  if (foundSelectors.length > 0) {
    return {
      status: "pass",
      value: `DKIM selectors found: ${foundSelectors.join(", ")}`,
      explanation: `DKIM is configured with ${foundSelectors.length} active selector${foundSelectors.length > 1 ? "s" : ""} (${foundSelectors.join(", ")}). Emails from your domain can be cryptographically verified.`,
      selectors: foundSelectors,
    };
  }

  return {
    status: "warning",
    value: "",
    explanation: "No DKIM records found for common selectors. DKIM may be configured with a custom selector, or it may not be set up. DKIM adds cryptographic verification to your emails.",
    selectors: [],
  };
}

function calculateOverallScore(dmarc: RecordResult, spf: RecordResult, dkim: RecordResult): OverallScore {
  const statuses = [dmarc.status, spf.status, dkim.status];
  const failCount = statuses.filter(s => s === "fail").length;
  const passCount = statuses.filter(s => s === "pass").length;

  if (passCount === 3) return "strong";
  if (failCount >= 2) return "at-risk";
  if (failCount >= 1 || passCount === 0) return "at-risk";
  return "needs-attention";
}

async function performEmailScan(domain: string): Promise<EmailCheckResults> {
  const [dmarc, spf, dkim] = await Promise.all([
    checkDMARC(domain),
    checkSPF(domain),
    checkDKIM(domain),
  ]);

  return {
    dmarc,
    spf,
    dkim,
    overallScore: calculateOverallScore(dmarc, spf, dkim),
  };
}

// ==================== HELPER FUNCTIONS ====================

function getGradeColor(grade: string): string {
  switch (grade?.toUpperCase()) {
    case "A": return "text-emerald-500";
    case "B": return "text-green-500";
    case "C": return "text-amber-500";
    case "D": return "text-orange-500";
    case "F": return "text-red-500";
    default: return "text-muted-foreground";
  }
}

function getGradeBg(grade: string): string {
  switch (grade?.toUpperCase()) {
    case "A": return "bg-emerald-500/10 border-emerald-500/30";
    case "B": return "bg-green-500/10 border-green-500/30";
    case "C": return "bg-amber-500/10 border-amber-500/30";
    case "D": return "bg-orange-500/10 border-orange-500/30";
    case "F": return "bg-red-500/10 border-red-500/30";
    default: return "bg-muted border-border";
  }
}

function getSeverityColor(severity: string): string {
  switch (severity?.toLowerCase()) {
    case "high": case "critical": return "bg-red-500/10 text-red-500 border-red-500/30";
    case "medium": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
    case "low": return "bg-green-500/10 text-green-500 border-green-500/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
}

const DOMAIN_REGEX = /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

const validateDomain = (domain: string): string | null => {
  const trimmed = domain.trim();
  if (!trimmed) return "Please enter a domain name";
  const cleanDomain = trimmed.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  if (!DOMAIN_REGEX.test(cleanDomain)) return "Please enter a valid domain (e.g., example.com)";
  return null;
};

// ==================== UI COMPONENTS ====================

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

const StatusIcon = ({ status }: { status: RecordStatus }) => {
  switch (status) {
    case "pass":
      return (
        <span className="relative inline-flex">
          <CheckCircle className="h-5 w-5 text-secondary" />
          <span className="absolute inset-0 rounded-full bg-secondary/30 hidden sm:block motion-reduce:hidden animate-ping" style={{ animationDuration: '2s' }} />
        </span>
      );
    case "fail":
      return (
        <span className="relative inline-flex">
          <XCircle className="h-5 w-5 text-destructive motion-reduce:animate-none animate-pulse" />
          <span className="absolute inset-0 rounded-full ring-2 ring-destructive/50 motion-reduce:animate-none animate-pulse" />
        </span>
      );
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-chart-4" />;
    default:
      return <Ban className="h-5 w-5 text-muted-foreground" />;
  }
};

const StatusBadge = ({ status }: { status: RecordStatus }) => {
  const styles = {
    pass: "bg-secondary/10 text-secondary motion-reduce:animate-none animate-pulse-success rounded-md",
    fail: "bg-destructive/10 text-destructive ring-2 ring-destructive/30 rounded-md shadow-sm shadow-destructive/20",
    warning: "bg-chart-4/20 text-chart-5 rounded-md",
    unknown: "bg-muted text-muted-foreground rounded-md",
  };
  const labels = { pass: "Pass", fail: "Fail", warning: "Warning", unknown: "Unknown" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      <StatusIcon status={status} />
      {labels[status]}
    </span>
  );
};

interface CircularProgressProps {
  score: OverallScore;
  className?: string;
}

const CircularProgress = ({ score, className = "" }: CircularProgressProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  const scoreConfig = {
    "strong": { percentage: 100, color: "hsl(var(--secondary))", label: "Strong" },
    "needs-attention": { percentage: 65, color: "hsl(var(--chart-4))", label: "Needs Attention" },
    "at-risk": { percentage: 30, color: "hsl(var(--destructive))", label: "At Risk" },
  };

  const config = scoreConfig[score];
  const targetOffset = circumference - (config.percentage / 100) * circumference;

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimatedOffset(targetOffset);
      return;
    }
    setAnimatedOffset(circumference);
    const timer = setTimeout(() => setAnimatedOffset(targetOffset), 50);
    return () => clearTimeout(timer);
  }, [score, circumference, targetOffset, prefersReducedMotion]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
        <circle cx="64" cy="64" r={radius} stroke={config.color} strokeWidth="8" fill="none" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={animatedOffset}
          className={prefersReducedMotion ? "" : "transition-all duration-1000 ease-out"} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold" style={{ color: config.color }}>{config.percentage}%</span>
        <span className="text-xs sm:text-sm text-muted-foreground mt-1">{config.label}</span>
      </div>
    </div>
  );
};

function CircularGrade({ grade, size = "lg" }: { grade: string; size?: "sm" | "lg" }) {
  const dims = size === "lg" ? "w-32 h-32 sm:w-40 sm:h-40" : "w-16 h-16";
  const textSize = size === "lg" ? "text-5xl sm:text-6xl" : "text-2xl";
  const radius = size === "lg" ? 58 : 26;
  const viewBox = size === "lg" ? "0 0 140 140" : "0 0 64 64";
  const cx = size === "lg" ? 70 : 32;
  const strokeW = size === "lg" ? 6 : 4;
  const circumference = 2 * Math.PI * radius;

  const gradePercent: Record<string, number> = { A: 95, B: 80, C: 65, D: 45, F: 20 };
  const pct = gradePercent[grade?.toUpperCase()] ?? 0;
  const offset = circumference - (pct / 100) * circumference;

  const colorMap: Record<string, string> = {
    A: "#10b981", B: "#22c55e", C: "#f59e0b", D: "#f97316", F: "#ef4444",
  };
  const strokeColor = colorMap[grade?.toUpperCase()] || "#888";

  return (
    <div className={`relative inline-flex items-center justify-center ${dims}`}>
      <svg className="w-full h-full transform -rotate-90" viewBox={viewBox}>
        <circle cx={cx} cy={cx} r={radius} stroke="currentColor" strokeWidth={strokeW} fill="none" className="text-muted/40" />
        <circle cx={cx} cy={cx} r={radius} stroke={strokeColor} strokeWidth={strokeW} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out" />
      </svg>
      <span className={`absolute ${textSize} font-bold ${getGradeColor(grade)}`}>{grade || "?"}</span>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function SecurityCheck() {
  const [step, setStep] = useState<"form" | "results">("form");
  const [formData, setFormData] = useState<AssessmentForm>({
    firstName: "",
    lastName: "",
    email: "",
    organizationName: "",
    domain: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AssessmentForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email security results
  const [emailResults, setEmailResults] = useState<EmailCheckResults | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  // Infrastructure security results
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<ExternalScanAssessment | null>(null);
  const [findings, setFindings] = useState<any[] | null>(null);
  const [breachData, setBreachData] = useState<any | null>(null);
  const [breachLoading, setBreachLoading] = useState(true);
  const [findingsLoading, setFindingsLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [findingDetails, setFindingDetails] = useState<Record<string, any>>({});
  const [findingDetailsLoading, setFindingDetailsLoading] = useState<Record<string, boolean>>({});

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { openModal } = useContactModal();

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Poll assessment status
  const startPolling = useCallback((id: string) => {
    const poll = async () => {
      try {
        const data = await getAssessment(id);
        setAssessment(data);
        if (data.scanStatus === "completed" || data.scanStatus === "archived") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;
          setFindingsLoading(true);
          setBreachLoading(true);
          Promise.all([
            getAssessmentFindings(id).then(f => { setFindings(Array.isArray(f) ? f : f?.findings || []); }).catch(() => setFindings([])),
            getBreachData(id).then(b => setBreachData(b)).catch(() => setBreachData(null)),
          ]).finally(() => {
            setFindingsLoading(false);
            setBreachLoading(false);
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };
    poll();
    pollingRef.current = setInterval(poll, 5000);
  }, []);

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AssessmentForm, string>> = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.organizationName.trim()) errors.organizationName = "Organization name is required";
    
    const domainError = validateDomain(formData.domain);
    if (domainError) errors.domain = domainError;
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof AssessmentForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const cleanDomain = formData.domain.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
    
    setIsSubmitting(true);
    setStep("results");
    
    // Start both scans simultaneously
    const emailScanPromise = performEmailScan(cleanDomain)
      .then(results => {
        setEmailResults(results);
        setEmailLoading(false);
        
        // Send to DMARC scan-leads API
        const apiBase = import.meta.env.PROD ? "" : "http://localhost:3001";
        fetch(`${apiBase}/api/scan-leads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            company: formData.organizationName,
            domain: cleanDomain,
            results: results,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {});
      })
      .catch(err => {
        console.error("Email scan failed:", err);
        setEmailLoading(false);
      });

    const infrastructureScanPromise = createExternalScan({
      organizationName: formData.organizationName,
      domain: cleanDomain,
      clientCategory: "it_and_security",
      clientStatus: "lead",
    })
      .then(result => {
        setAssessmentId(result.id);
        setAssessment(result);
        startPolling(result.id);
        
        // Send to GHL
        submitRiskAssessment({
          organizationName: formData.organizationName,
          domain: cleanDomain,
          contactName: `${formData.firstName} ${formData.lastName}`,
          contactEmail: formData.email,
          contactPhone: formData.phone,
          securityScore: result.securityScore || "pending",
          overallRisk: "needs-attention",
          assessmentId: result.id,
          assessmentUrl: window.location.href,
        }).catch(() => {});
      })
      .catch(error => {
        console.error("Infrastructure scan failed:", error);
      });

    setEmailLoading(true);
    
    await Promise.all([emailScanPromise, infrastructureScanPromise]);
    setIsSubmitting(false);
  };

  const isScanning = assessment && (assessment.scanStatus === "not_started" || assessment.scanStatus === "in_progress");
  const isComplete = assessment && (assessment.scanStatus === "completed" || assessment.scanStatus === "archived");

  const getCategoryGrade = (gradeKey: string): string | null => {
    if (!assessment?.grades) return null;
    return (assessment.grades as any)[gradeKey] || null;
  };

  const getCategoryFindings = (categoryKey: string): any[] => {
    if (!findings) return [];
    return findings.filter((f: any) => {
      const cat = (f.category || f.categoryKey || "").toLowerCase().replace(/[\s-]/g, "_");
      return cat === categoryKey || cat.includes(categoryKey.replace("_", ""));
    });
  };

  const loadFindingDetails = async (slug: string) => {
    if (findingDetails[slug] || findingDetailsLoading[slug] || !assessmentId) return;
    setFindingDetailsLoading(prev => ({ ...prev, [slug]: true }));
    try {
      const details = await getFindingDetails(assessmentId, slug);
      setFindingDetails(prev => ({ ...prev, [slug]: details }));
    } catch {
      setFindingDetails(prev => ({ ...prev, [slug]: { error: true } }));
    }
    setFindingDetailsLoading(prev => ({ ...prev, [slug]: false }));
  };

  const handleDownloadReport = () => {
    if (!assessmentId) return;
    window.open(getReportUrl(assessmentId, "pdf"), "_blank");
  };

  const getOverallShield = () => {
    if (!emailResults) return null;
    switch (emailResults.overallScore) {
      case "strong":
        return { icon: ShieldCheck, color: "text-secondary", bg: "bg-secondary/10" };
      case "needs-attention":
        return { icon: ShieldAlert, color: "text-chart-4", bg: "bg-chart-4/10" };
      case "at-risk":
        return { icon: ShieldX, color: "text-destructive", bg: "bg-destructive/10" };
    }
  };

  const overallShield = getOverallShield();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient-bg py-20 md:py-28 lg:py-32">
        <div className="absolute inset-0 grain-texture opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-gradient-shift bg-[length:200%_200%]" aria-hidden="true" />
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl animate-fade-in-up" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
              Complete <span className="text-gradient">Security Check</span> in Minutes
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 md:text-xl animate-fade-in-up leading-relaxed" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              Get a comprehensive security assessment covering email authentication, infrastructure vulnerabilities, and dark web exposure.
            </p>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-subtle opacity-50">
          <ChevronDown className="h-8 w-8 text-white" />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24 bg-background relative -mt-10 z-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-5xl">

            {/* ========== FORM STEP ========== */}
            {step === "form" && (
              <div className="mx-auto max-w-4xl rounded-3xl border border-border/50 bg-card p-8 md:p-12 shadow-2xl backdrop-blur-sm animate-fade-in-up">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-card-foreground mb-2">Start Your Security Check</h2>
                  <p className="text-muted-foreground">Enter your information to begin a comprehensive security assessment</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                      First Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={e => handleInputChange("firstName", e.target.value)}
                        className="h-12 pl-12 bg-background/50"
                      />
                    </div>
                    {formErrors.firstName && <p className="mt-2 text-sm text-destructive">{formErrors.firstName}</p>}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                      Last Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={e => handleInputChange("lastName", e.target.value)}
                        className="h-12 pl-12 bg-background/50"
                      />
                    </div>
                    {formErrors.lastName && <p className="mt-2 text-sm text-destructive">{formErrors.lastName}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={e => handleInputChange("email", e.target.value)}
                        className="h-12 pl-12 bg-background/50"
                      />
                    </div>
                    {formErrors.email && <p className="mt-2 text-sm text-destructive">{formErrors.email}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="organizationName" className="block text-sm font-medium mb-2">
                      Organization Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="organizationName"
                        placeholder="Your Company Inc."
                        value={formData.organizationName}
                        onChange={e => handleInputChange("organizationName", e.target.value)}
                        className="h-12 pl-12 bg-background/50"
                      />
                    </div>
                    {formErrors.organizationName && <p className="mt-2 text-sm text-destructive">{formErrors.organizationName}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="domain" className="block text-sm font-medium mb-2">
                      Domain <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="domain"
                        placeholder="example.com"
                        value={formData.domain}
                        onChange={e => handleInputChange("domain", e.target.value)}
                        className="h-12 pl-12 bg-background/50"
                      />
                    </div>
                    {formErrors.domain && <p className="mt-2 text-sm text-destructive">{formErrors.domain}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone <span className="text-muted-foreground text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={e => handleInputChange("phone", e.target.value)}
                        className="h-12 pl-12 bg-background/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg group"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Starting Security Check...</>
                    ) : (
                      <>Run Security Check <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" /></>
                    )}
                  </Button>
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" /> Your information is secure and never shared
                </p>
              </div>
            )}

            {/* ========== RESULTS STEP ========== */}
            {step === "results" && (
              <div className="space-y-12">

                {/* ========== EMAIL SECURITY ANALYSIS ========== */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10">
                      <Shield className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Email Security Analysis</h2>
                      <p className="text-sm text-muted-foreground">Instant DNS-based authentication checks</p>
                    </div>
                  </div>

                  {emailLoading && !emailResults ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Analyzing email security...</p>
                      </div>
                    </div>
                  ) : emailResults ? (
                    <>
                      {/* Overall Email Score */}
                      {overallShield && (
                        <div className={`mb-6 flex flex-col items-center p-6 sm:p-8 text-center rounded-2xl ${overallShield.bg}`}>
                          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                            <CircularProgress score={emailResults.overallScore} />
                            <div className="flex flex-col items-center sm:items-start">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <overallShield.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${overallShield.color}`} />
                                <h3 className={`text-xl sm:text-2xl font-bold ${overallShield.color}`}>
                                  {emailResults.overallScore === "strong" ? "Strong" : emailResults.overallScore === "at-risk" ? "At Risk" : "Needs Attention"}
                                </h3>
                              </div>
                              <p className="mt-2 text-sm sm:text-base text-muted-foreground">Email authentication status for {formData.domain}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* DMARC Record */}
                      <Card className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">DMARC Record</CardTitle>
                            <StatusBadge status={emailResults.dmarc.status} />
                          </div>
                        </CardHeader>
                        <CardContent>
                          {emailResults.dmarc.value && (
                            <div className="mb-4 overflow-x-auto rounded-md bg-sidebar p-3 sm:p-4">
                              <code className="text-xs sm:text-sm text-sidebar-foreground break-all whitespace-pre-wrap">{emailResults.dmarc.value}</code>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground">{emailResults.dmarc.explanation}</p>
                        </CardContent>
                      </Card>

                      {/* SPF Record */}
                      <Card className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">SPF Record</CardTitle>
                            <StatusBadge status={emailResults.spf.status} />
                          </div>
                        </CardHeader>
                        <CardContent>
                          {emailResults.spf.value && (
                            <div className="mb-4 overflow-x-auto rounded-md bg-sidebar p-3 sm:p-4">
                              <code className="text-xs sm:text-sm text-sidebar-foreground break-all whitespace-pre-wrap">{emailResults.spf.value}</code>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground">{emailResults.spf.explanation}</p>
                        </CardContent>
                      </Card>

                      {/* DKIM Record */}
                      <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">DKIM Record</CardTitle>
                            <StatusBadge status={emailResults.dkim.status} />
                          </div>
                        </CardHeader>
                        <CardContent>
                          {emailResults.dkim.value && (
                            <div className="mb-4 overflow-x-auto rounded-md bg-sidebar p-3 sm:p-4">
                              <code className="text-xs sm:text-sm text-sidebar-foreground break-all whitespace-pre-wrap">{emailResults.dkim.value}</code>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground">{emailResults.dkim.explanation}</p>
                        </CardContent>
                      </Card>
                    </>
                  ) : null}
                </div>

                {/* ========== INFRASTRUCTURE SECURITY ASSESSMENT ========== */}
                <div className="space-y-6 pt-8 border-t border-border">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                      <Server className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Infrastructure Security Assessment</h2>
                      <p className="text-sm text-muted-foreground">Deep scan of your external attack surface</p>
                    </div>
                  </div>

                  {/* Scanning Progress */}
                  {isScanning && (
                    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-4 animate-fade-in-up">
                      <Loader2 className="h-6 w-6 text-primary animate-spin flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Deep scan in progress...</p>
                        <p className="text-xs text-muted-foreground">Analyzing {formData.domain}, this usually takes 2 to 5 minutes</p>
                        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Overall Grade */}
                  {assessment && (
                    <div className={`rounded-3xl border-2 p-8 md:p-10 transition-all duration-500 ${isComplete && assessment.securityScore ? getGradeBg(assessment.securityScore) : "border-border/50 bg-card"}`}>
                      <div className="flex flex-col items-center text-center">
                        {isComplete && assessment.securityScore ? (
                          <div className="animate-fade-in-up">
                            <CircularGrade grade={assessment.securityScore} size="lg" />
                            <h3 className={`mt-4 text-2xl font-bold ${getGradeColor(assessment.securityScore)}`}>
                              {calculateRiskLevel(assessment.securityScore) === "strong" ? "Strong Security Posture" :
                               calculateRiskLevel(assessment.securityScore) === "at-risk" ? "Critical Security Risks Detected" :
                               "Security Improvements Needed"}
                            </h3>
                            <p className="mt-2 text-muted-foreground">
                              Overall Grade: <span className={`font-bold text-lg ${getGradeColor(assessment.securityScore)}`}>{assessment.securityScore}</span>
                            </p>
                            <div className="mt-2 text-sm text-muted-foreground space-y-1">
                              <p><span className="font-semibold text-foreground">{assessment.assessmentDetails?.organization_name || formData.organizationName}</span></p>
                              <p>{assessment.assessmentDetails?.domain_prim || formData.domain}</p>
                              {assessment.lastScannedAt && <p>Scanned: {new Date(assessment.lastScannedAt).toLocaleDateString()}</p>}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-4 py-6">
                            <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 rounded-full" />
                            <Skeleton className="w-64 h-8" />
                            <Skeleton className="w-48 h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category Breakdown */}
                  {assessment && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Security Category Breakdown</h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {CATEGORIES.map((cat, i) => {
                          const grade = getCategoryGrade(cat.gradeKey);
                          const catFindings = getCategoryFindings(cat.key);
                          const isExpanded = expandedCategory === cat.key;
                          const Icon = cat.icon;

                          return (
                            <div key={cat.key} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}>
                              <Card
                                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${isExpanded ? "ring-2 ring-primary" : ""}`}
                                onClick={() => setExpandedCategory(isExpanded ? null : cat.key)}
                              >
                                <CardContent className="p-5">
                                  {grade ? (
                                    <>
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                          <div className={`p-2 rounded-lg ${getGradeBg(grade)}`}>
                                            <Icon className={`h-5 w-5 ${getGradeColor(grade)}`} />
                                          </div>
                                          <div>
                                            <h4 className="font-semibold text-sm">{cat.name}</h4>
                                            <p className="text-xs text-muted-foreground">{cat.description}</p>
                                          </div>
                                        </div>
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-lg ${getGradeBg(grade)} ${getGradeColor(grade)}`}>
                                          {grade}
                                        </div>
                                      </div>
                                      {!findingsLoading && (
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                          <span>{catFindings.length} finding{catFindings.length !== 1 ? "s" : ""}</span>
                                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-3">
                                        <Skeleton className="w-9 h-9 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                          <Skeleton className="w-24 h-4" />
                                          <Skeleton className="w-full h-3" />
                                        </div>
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Expanded Findings */}
                              {isExpanded && grade && (
                                <div className="mt-2 rounded-xl border border-border/50 bg-card p-4 space-y-3 animate-fade-in-up">
                                  {findingsLoading ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Loader2 className="h-4 w-4 animate-spin" /> Loading findings...
                                    </div>
                                  ) : catFindings.length === 0 ? (
                                    <div className="flex items-center gap-2 text-sm text-green-500">
                                      <CheckCircle className="h-4 w-4" /> No issues found in this category
                                    </div>
                                  ) : (
                                    catFindings.map((finding: any, fi: number) => {
                                      const slug = finding.slug || finding.id;
                                      const details = findingDetails[slug];
                                      const detailLoading = findingDetailsLoading[slug];

                                      return (
                                        <div key={fi} className="rounded-lg border border-border/30 p-3">
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-sm">{finding.name || finding.title}</span>
                                                {finding.severity && (
                                                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase ${getSeverityColor(finding.severity)}`}>
                                                    {finding.severity}
                                                  </span>
                                                )}
                                              </div>
                                              {finding.description && <p className="text-xs text-muted-foreground mt-1">{finding.description}</p>}
                                              {finding.risk && <p className="text-xs text-muted-foreground mt-1"><strong>Risk:</strong> {finding.risk}</p>}
                                              {finding.recommendation && <p className="text-xs text-muted-foreground mt-1"><strong>Fix:</strong> {finding.recommendation}</p>}
                                            </div>
                                            {slug && assessmentId && (
                                              <Button variant="ghost" size="sm" className="text-xs flex-shrink-0"
                                                onClick={e => { e.stopPropagation(); loadFindingDetails(slug); }}>
                                                {detailLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                                              </Button>
                                            )}
                                          </div>
                                          {details && !details.error && (
                                            <div className="mt-2 pt-2 border-t border-border/30 text-xs text-muted-foreground space-y-1 animate-fade-in-up">
                                              {details.domains && details.domains.length > 0 && (
                                                <div>
                                                  <strong>Affected domains:</strong>
                                                  <ul className="list-disc list-inside ml-2">
                                                    {details.domains.map((d: any, di: number) => (
                                                      <li key={di}>{typeof d === "string" ? d : d.domain || d.name || JSON.stringify(d)}</li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              )}
                                              {details.details && <p>{typeof details.details === "string" ? details.details : JSON.stringify(details.details)}</p>}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dark Web Presence */}
                  {assessment && (
                    <Card className="animate-fade-in-up">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShieldAlert className="h-5 w-5" /> Dark Web Presence
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {breachLoading && !isComplete ? (
                          <div className="space-y-3">
                            <Skeleton className="w-full h-5" />
                            <Skeleton className="w-3/4 h-4" />
                          </div>
                        ) : breachLoading ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> Checking dark web databases...
                          </div>
                        ) : !breachData || (Array.isArray(breachData) && breachData.length === 0) || (breachData.breaches && breachData.breaches.length === 0) ? (
                          <div className="flex items-center gap-3 text-green-500">
                            <CheckCircle className="h-6 w-6" />
                            <div>
                              <p className="font-semibold">No breaches found!</p>
                              <p className="text-xs text-muted-foreground">No compromised credentials were detected on the dark web</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-red-500 mb-3">
                              <XCircle className="h-5 w-5" />
                              <span className="font-semibold">Breaches detected</span>
                            </div>
                            {(Array.isArray(breachData) ? breachData : breachData.breaches || []).map((breach: any, i: number) => (
                              <div key={i} className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm">
                                <p className="font-medium">{breach.name || breach.title || `Breach #${i + 1}`}</p>
                                {breach.date && <p className="text-xs text-muted-foreground">Date: {breach.date}</p>}
                                {breach.description && <p className="text-xs text-muted-foreground mt-1">{breach.description}</p>}
                                {breach.dataClasses && <p className="text-xs text-muted-foreground mt-1">Data exposed: {breach.dataClasses.join(", ")}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* ========== CTA SECTION ========== */}
                <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-lg animate-fade-in-up">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-3">Get Your Complete Security Report</h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Download a detailed PDF report with prioritized recommendations and expert remediation guidance.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      {assessmentId && isComplete && (
                        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-lg group" onClick={handleDownloadReport}>
                          <Download className="mr-2 h-5 w-5" /> Download Full Report
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                      )}
                      
                      <Button variant="outline" size="lg" className="h-14 px-8 text-lg group" onClick={openModal}>
                        Get Expert Help <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Educational Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl mb-12">Why Security Matters</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              { 
                icon: Shield, 
                title: "Email Authentication", 
                desc: "DMARC, SPF, and DKIM work together to prevent email spoofing and phishing attacks targeting your domain. Without proper authentication, attackers can impersonate your organization." 
              },
              { 
                icon: Server, 
                title: "Infrastructure Security", 
                desc: "Your external attack surface includes all publicly accessible systems, applications, and services. Regular assessment helps identify vulnerabilities before attackers exploit them." 
              },
              { 
                icon: AlertTriangle, 
                title: "Dark Web Monitoring", 
                desc: "Compromised credentials on the dark web can lead to account takeovers and data breaches. Early detection allows you to secure accounts before they're exploited." 
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center bg-primary/10 rounded-2xl mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-sidebar py-16 md:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-sidebar-foreground md:text-3xl">Need Help Securing Your Infrastructure?</h2>
            <p className="mt-4 text-sidebar-foreground/70">Our team can implement the recommended security fixes and provide ongoing monitoring</p>
            <div className="mt-8">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={openModal}>Get Expert Help</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
