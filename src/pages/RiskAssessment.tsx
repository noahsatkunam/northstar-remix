import { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Building,
  Globe,
  User,
  Mail,
  Phone,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Users,
  Server,
  Bug,
  Download,
  ExternalLink,
  FileText,
  Scan,
  Lock,
  Ban
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
import { motion, AnimatePresence } from "framer-motion";

// ==================== TYPES ====================

type SecurityGrade = "A" | "B" | "C" | "D" | "F" | "n/a";
type RecordStatus = "pass" | "fail" | "warning" | "unknown";
type OverallScore = "strong" | "needs-attention" | "at-risk";

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
  organizationName: string;
  domain: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
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
    return { status: "fail", value: "", explanation: "No DMARC record found. Your domain is not protected against email spoofing." };
  }

  const policyMatch = dmarcRecord.match(/;\s*p=(\w+)/);
  const policy = policyMatch ? policyMatch[1].toLowerCase() : "none";

  if (policy === "reject") {
    return { status: "pass", value: dmarcRecord, explanation: "DMARC record found with 'reject' policy. Strongest protection." };
  } else if (policy === "quarantine") {
    return { status: "pass", value: dmarcRecord, explanation: "DMARC record found with 'quarantine' policy. Good protection." };
  } else {
    return { status: "warning", value: dmarcRecord, explanation: "DMARC record found but policy is 'none'. Only monitoring, no protection." };
  }
}

async function checkSPF(domain: string): Promise<RecordResult> {
  const records = await dnsLookup(domain);
  const spfRecord = records.find(r => r.includes("v=spf1"));

  if (!spfRecord) {
    return { status: "fail", value: "", explanation: "No SPF record found." };
  }

  if (spfRecord.includes("-all")) {
    return { status: "pass", value: spfRecord, explanation: "SPF record found with strict '-all' policy." };
  } else if (spfRecord.includes("~all")) {
    return { status: "warning", value: spfRecord, explanation: "SPF record found with soft fail '~all' policy." };
  } else {
    return { status: "fail", value: spfRecord, explanation: "SPF record found but with permissive policy." };
  }
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
      explanation: `DKIM configured with ${foundSelectors.length} active selector(s).`,
      selectors: foundSelectors,
    };
  }

  return {
    status: "warning",
    value: "",
    explanation: "No DKIM records found for common selectors.",
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

// ==================== HELPERS ====================

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

const StatusBadge = ({ status }: { status: RecordStatus }) => {
  const styles = {
    pass: "bg-green-500/10 text-green-500 border-green-500/20",
    fail: "bg-red-500/10 text-red-500 border-red-500/20",
    warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    unknown: "bg-muted text-muted-foreground border-border",
  };
  const labels = { pass: "Pass", fail: "Fail", warning: "Warning", unknown: "Unknown" };
  const Icons = { pass: CheckCircle, fail: XCircle, warning: AlertTriangle, unknown: Ban };
  const Icon = Icons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-full ${styles[status]}`}>
      <Icon className="w-3 h-3" />
      {labels[status]}
    </span>
  );
};

// ==================== SKELETON ====================

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

// ==================== CIRCULAR GRADE ====================

function CircularGrade({ grade, size = "lg" }: { grade: string; size?: "sm" | "lg" }) {
  const dims = size === "lg" ? "w-40 h-40 md:w-48 md:h-48" : "w-16 h-16";
  const textSize = size === "lg" ? "text-6xl md:text-7xl" : "text-2xl";
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
        <circle cx={cx} cy={cx} r={radius} stroke="currentColor" strokeWidth={strokeW} fill="none" className="text-muted/20" />
        <motion.circle 
          cx={cx} cy={cx} r={radius} stroke={strokeColor} strokeWidth={strokeW} fill="none"
          strokeLinecap="round" 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeDasharray={circumference}
        />
      </svg>
      <span className={`absolute ${textSize} font-bold ${getGradeColor(grade)}`}>{grade || "?"}</span>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function RiskAssessment() {
  const [step, setStep] = useState<"form" | "results">("form");
  const [formData, setFormData] = useState<AssessmentForm>({
    organizationName: "", domain: "", contactName: "", contactEmail: "", contactPhone: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AssessmentForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results state
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<ExternalScanAssessment | null>(null);
  const [findings, setFindings] = useState<any[] | null>(null);
  const [breachData, setBreachData] = useState<any | null>(null);
  const [breachLoading, setBreachLoading] = useState(true);
  const [findingsLoading, setFindingsLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [findingDetails, setFindingDetails] = useState<Record<string, any>>({});
  const [findingDetailsLoading, setFindingDetailsLoading] = useState<Record<string, boolean>>({});
  
  // Email Results
  const [emailResults, setEmailResults] = useState<EmailCheckResults | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

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
          // Fetch findings + breach data in parallel
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
    poll(); // immediate first call
    pollingRef.current = setInterval(poll, 5000);
  }, []);

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AssessmentForm, string>> = {};
    if (!formData.organizationName.trim()) errors.organizationName = "Organization name is required";
    if (!formData.domain.trim()) {
      errors.domain = "Domain is required";
    } else {
      const domainRegex = /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
      const clean = formData.domain.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
      if (!domainRegex.test(clean)) errors.domain = "Please enter a valid domain (e.g., example.com)";
    }
    if (!formData.contactName.trim()) errors.contactName = "Contact name is required";
    if (!formData.contactEmail.trim()) {
      errors.contactEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.contactEmail = "Please enter a valid email address";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof AssessmentForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setStep("results");
    
    const cleanDomain = formData.domain.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");

    // 1. Start Email Scan
    setEmailLoading(true);
    performEmailScan(cleanDomain)
      .then(results => {
        setEmailResults(results);
        setEmailLoading(false);
      })
      .catch(err => {
        console.error("Email scan failed:", err);
        setEmailLoading(false);
      });

    // 2. Start Infrastructure Scan
    try {
      const result = await createExternalScan({
        organizationName: formData.organizationName,
        domain: cleanDomain,
        clientCategory: "it_and_security",
        clientStatus: "lead",
      });

      setAssessmentId(result.id);
      setAssessment(result);
      startPolling(result.id);

      // GHL submission (fire and forget)
      submitRiskAssessment({
        organizationName: formData.organizationName,
        domain: cleanDomain,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        securityScore: result.securityScore || "pending",
        overallRisk: "needs-attention",
        assessmentId: result.id,
        assessmentUrl: window.location.href,
      }).catch(() => {});

    } catch (error) {
      console.error("Infrastructure scan failed:", error);
      // We don't alert here because we are already on the results page showing progress
    } finally {
      setIsSubmitting(false);
    }
  };

  const isScanning = assessment && (assessment.scanStatus === "not_started" || assessment.scanStatus === "in_progress");
  const isComplete = assessment && (assessment.scanStatus === "completed" || assessment.scanStatus === "archived");

  // Get grade for a category
  const getCategoryGrade = (gradeKey: string): string | null => {
    if (!assessment?.grades) return null;
    return (assessment.grades as any)[gradeKey] || null;
  };

  // Get findings for a category
  const getCategoryFindings = (categoryKey: string): any[] => {
    if (!findings) return [];
    return findings.filter((f: any) => {
      const cat = (f.category || f.categoryKey || "").toLowerCase().replace(/[\s-]/g, "_");
      return cat === categoryKey || cat.includes(categoryKey.replace("_", ""));
    });
  };

  // Load finding details
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

  // Download report
  const handleDownloadReport = () => {
    if (!assessmentId) return;
    window.open(getReportUrl(assessmentId, "pdf"), "_blank");
  };

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-background pt-20 pb-12 md:pt-32 md:pb-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
        
        <div className="container relative z-10 px-4 md:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-medium mb-6 border border-red-500/20">
              <Scan className="w-4 h-4" />
              <span>Full-Stack Security Analysis</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
              How visible are your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                vulnerabilities?
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Hackers scan your network every day. It's time you did too. <br/>
              Get a comprehensive report on email, infrastructure, and dark web risks.
            </p>
          </motion.div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="relative pb-32 z-20">
        <div className="container px-4 md:px-8">
          <div className="mx-auto max-w-5xl">

            {/* FORM STEP */}
            <AnimatePresence mode="wait">
              {step === "form" && (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                  
                  <div className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Start Your Scan</h2>
                        <p className="text-muted-foreground">Enter your organization details to begin the automated reconnaissance process.</p>
                      </div>
                      
                      <div className="space-y-4">
                        {([
                          { id: "organizationName", label: "Organization Name", icon: Building, placeholder: "Acme Corp", type: "text", required: true },
                          { id: "domain", label: "Primary Domain", icon: Globe, placeholder: "acme.com", type: "text", required: true },
                          { id: "contactName", label: "Your Name", icon: User, placeholder: "Jane Doe", type: "text", required: true },
                          { id: "contactEmail", label: "Work Email", icon: Mail, placeholder: "jane@acme.com", type: "email", required: true },
                          { id: "contactPhone", label: "Phone (Optional)", icon: Phone, placeholder: "+1 (555) 000-0000", type: "tel", required: false },
                        ] as const).map(field => (
                          <div key={field.id}>
                            <label htmlFor={field.id} className="block text-sm font-medium mb-1.5 ml-1">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <div className="relative group">
                              <field.icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                id={field.id} type={field.type} placeholder={field.placeholder}
                                value={formData[field.id as keyof AssessmentForm] || ""}
                                onChange={e => handleInputChange(field.id as keyof AssessmentForm, e.target.value)}
                                className="h-12 pl-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                                aria-invalid={!!formErrors[field.id as keyof AssessmentForm]}
                              />
                            </div>
                            {formErrors[field.id as keyof AssessmentForm] && (
                              <p className="mt-1.5 text-sm text-red-500 ml-1">{formErrors[field.id as keyof AssessmentForm]}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      <Button 
                        size="lg" 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="w-full h-14 text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all"
                      >
                        {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Initiating Scan...</> : <>Launch Assessment <ArrowRight className="ml-2 h-5 w-5" /></>}
                      </Button>
                      
                      <p className="text-center text-xs text-muted-foreground">
                        Strictly confidential. We do not share your data.
                      </p>
                    </div>

                    <div className="hidden md:flex flex-col justify-center items-center relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl" />
                      <div className="relative z-10 text-center space-y-8 p-8">
                        <ShieldCheck className="w-32 h-32 text-primary mx-auto opacity-80" />
                        <div>
                          <h3 className="text-xl font-bold mb-2">What we analyze</h3>
                          <ul className="text-left space-y-3 text-sm text-muted-foreground max-w-xs mx-auto">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> DNS Health & Security</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Exposed Services & Ports</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Email Configuration (DMARC)</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Dark Web Credential Leaks</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> IP Reputation & Blacklists</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* RESULTS STEP */}
              {step === "results" && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  {/* Email Security Section */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Mail className="w-6 h-6 text-primary" /> Email Security
                    </h2>
                    
                    {emailLoading && !emailResults ? (
                      <Card className="border-border/50">
                        <CardContent className="p-8 flex items-center justify-center gap-4 text-muted-foreground">
                          <Loader2 className="animate-spin" /> Analyzing DNS records...
                        </CardContent>
                      </Card>
                    ) : emailResults ? (
                      <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-border/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">DMARC</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-lg">Policy</span>
                              <StatusBadge status={emailResults.dmarc.status} />
                            </div>
                            <p className="text-xs text-muted-foreground">{emailResults.dmarc.explanation}</p>
                          </CardContent>
                        </Card>
                        <Card className="border-border/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">SPF</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-lg">Record</span>
                              <StatusBadge status={emailResults.spf.status} />
                            </div>
                            <p className="text-xs text-muted-foreground">{emailResults.spf.explanation}</p>
                          </CardContent>
                        </Card>
                        <Card className="border-border/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">DKIM</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-lg">Keys</span>
                              <StatusBadge status={emailResults.dkim.status} />
                            </div>
                            <p className="text-xs text-muted-foreground">{emailResults.dkim.explanation}</p>
                          </CardContent>
                        </Card>
                      </div>
                    ) : null}
                  </div>

                  {/* Infrastructure Progress */}
                  {isScanning && (
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex items-center gap-6 animate-pulse">
                      <Loader2 className="h-8 w-8 text-primary animate-spin flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between font-medium">
                          <span>Scanning Infrastructure: {formData.domain}</span>
                          <span>In Progress...</span>
                        </div>
                        <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-2/3 animate-[shimmer_2s_infinite]" />
                        </div>
                        <p className="text-sm text-muted-foreground">Checking 1,500+ data points across the open web...</p>
                      </div>
                    </div>
                  )}

                  {/* Score Card */}
                  <div className={`rounded-[2.5rem] border p-8 md:p-12 transition-all duration-500 relative overflow-hidden ${isComplete && assessment ? getGradeBg(assessment.securityScore) : "border-border/50 bg-card"}`}>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                      <div className="flex-shrink-0">
                        {isComplete && assessment?.securityScore ? (
                          <CircularGrade grade={assessment.securityScore} size="lg" />
                        ) : (
                          <Skeleton className="w-40 h-40 rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1 text-center md:text-left">
                        {isComplete && assessment?.securityScore ? (
                          <>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                              {calculateRiskLevel(assessment.securityScore) === "strong" ? "System Secure" :
                               calculateRiskLevel(assessment.securityScore) === "at-risk" ? "Critical Vulnerabilities Found" :
                               "Security Improvements Required"}
                            </h2>
                            <p className="text-lg text-muted-foreground mb-6">
                              We found issues that could be exploited by attackers. Your organization has a <span className="font-bold text-foreground">{assessment.securityScore}</span> rating based on external visibility.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                              <div className="px-4 py-2 rounded-lg bg-background/50 border border-border/50 text-sm">
                                <span className="text-muted-foreground">Target:</span> <span className="font-medium">{formData.domain}</span>
                              </div>
                              <div className="px-4 py-2 rounded-lg bg-background/50 border border-border/50 text-sm">
                                <span className="text-muted-foreground">Date:</span> <span className="font-medium">{new Date().toLocaleDateString()}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-4 w-full">
                            <Skeleton className="w-3/4 h-8" />
                            <Skeleton className="w-full h-4" />
                            <Skeleton className="w-2/3 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Categories Grid */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {CATEGORIES.map((cat, i) => {
                      const grade = getCategoryGrade(cat.gradeKey);
                      const catFindings = getCategoryFindings(cat.key);
                      const isExpanded = expandedCategory === cat.key;
                      const Icon = cat.icon;

                      return (
                        <motion.div 
                          key={cat.key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Card
                            className={`h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isExpanded ? "ring-2 ring-primary border-primary" : "border-border/50"} ${grade ? "" : "opacity-70"}`}
                            onClick={() => setExpandedCategory(isExpanded ? null : cat.key)}
                          >
                            <CardContent className="p-6">
                              {grade ? (
                                <>
                                  <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${getGradeBg(grade)}`}>
                                      <Icon className={`h-6 w-6 ${getGradeColor(grade)}`} />
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border ${getGradeBg(grade)} ${getGradeColor(grade)}`}>
                                      {grade}
                                    </div>
                                  </div>
                                  
                                  <h3 className="font-bold text-lg mb-1">{cat.name}</h3>
                                  <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>
                                  
                                  <div className="flex items-center justify-between text-xs font-medium bg-muted/50 p-2 rounded-lg">
                                    <span>{catFindings.length} Issues Found</span>
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </div>

                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="pt-4 space-y-3">
                                          {catFindings.length === 0 ? (
                                            <div className="text-green-500 text-sm flex items-center gap-2">
                                              <CheckCircle className="w-4 h-4" /> No issues detected
                                            </div>
                                          ) : (
                                            catFindings.map((finding: any, idx: number) => (
                                              <div key={idx} className="text-sm bg-background p-3 rounded-lg border border-border/50">
                                                <div className="flex justify-between items-start mb-1">
                                                  <span className="font-medium">{finding.name || finding.title}</span>
                                                  {finding.severity && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${getSeverityColor(finding.severity)}`}>
                                                      {finding.severity}
                                                    </span>
                                                  )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{finding.description}</p>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </>
                              ) : (
                                <div className="space-y-4">
                                  <div className="flex justify-between">
                                    <Skeleton className="w-12 h-12 rounded-xl" />
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                  </div>
                                  <Skeleton className="w-3/4 h-6" />
                                  <Skeleton className="w-full h-4" />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Dark Web Card */}
                  <Card className="border-border/50 shadow-lg overflow-hidden">
                    <div className="bg-muted/30 p-6 border-b border-border/50 flex items-center gap-3">
                      <ShieldAlert className="h-6 w-6 text-orange-500" />
                      <h3 className="font-bold text-lg">Dark Web Monitoring</h3>
                    </div>
                    <CardContent className="p-6">
                      {breachLoading && !isComplete ? (
                        <div className="flex items-center gap-3 text-muted-foreground">
                           <Loader2 className="animate-spin" /> Scanning dark web marketplaces...
                        </div>
                      ) : !breachData || (Array.isArray(breachData) && breachData.length === 0) ? (
                        <div className="flex items-center gap-4 text-green-500">
                          <CheckCircle className="h-8 w-8" />
                          <div>
                            <p className="font-bold">No Leaks Found</p>
                            <p className="text-sm text-muted-foreground">Your domain does not appear in known breach databases.</p>
                          </div>
                        </div>
                      ) : (
                         <div className="space-y-4">
                            <div className="flex items-center gap-2 text-red-500 font-bold">
                              <AlertTriangle className="h-5 w-5" />
                              {Array.isArray(breachData) ? breachData.length : breachData.breaches?.length || 0} Breaches Detected
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              {(Array.isArray(breachData) ? breachData : breachData.breaches || []).map((breach: any, i: number) => (
                                <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-sm">
                                  <div className="font-bold text-red-700 dark:text-red-400">{breach.name || breach.title}</div>
                                  <div className="text-xs text-muted-foreground mt-1">Exposed: {breach.dataClasses?.join(", ")}</div>
                                </div>
                              ))}
                            </div>
                         </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Final CTA */}
                  <div className="rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 p-8 md:p-12 text-white text-center shadow-2xl">
                    <h2 className="text-3xl font-bold mb-4">Get the Full Technical Report</h2>
                    <p className="text-white/80 max-w-2xl mx-auto mb-8 text-lg">
                      This is just a summary. Download the complete PDF report with detailed technical findings, CVEs, and remediation steps.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      {assessmentId && (
                        <Button 
                          size="lg" 
                          className="h-14 px-8 bg-white text-primary hover:bg-white/90 font-bold rounded-xl shadow-xl"
                          onClick={handleDownloadReport}
                        >
                          <Download className="mr-2 h-5 w-5" /> Download PDF Report
                        </Button>
                      )}
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="h-14 px-8 border-white/30 text-white hover:bg-white/10 hover:text-white rounded-xl"
                        onClick={openModal}
                      >
                        Talk to an Expert
                      </Button>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </section>
    </Layout>
  );
}
