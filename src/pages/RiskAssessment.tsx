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

type SecurityGrade = "A" | "B" | "C" | "D" | "F" | "n/a";

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

// ==================== SKELETON ====================

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

// ==================== CIRCULAR GRADE ====================

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
  // Lead info already captured in initial form

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

    try {
      const result = await createExternalScan({
        organizationName: formData.organizationName,
        domain: formData.domain.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, ""),
        clientCategory: "it_and_security",
        clientStatus: "lead",
      });

      setAssessmentId(result.id);
      setAssessment(result);
      setStep("results");
      startPolling(result.id);

      // GHL submission (fire and forget)
      submitRiskAssessment({
        organizationName: formData.organizationName,
        domain: formData.domain,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        securityScore: result.securityScore || "pending",
        overallRisk: "needs-attention",
        assessmentId: result.id,
        assessmentUrl: window.location.href,
      }).catch(() => {});

    } catch (error) {
      setIsSubmitting(false);
      alert(`Assessment failed: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`);
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
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient-bg py-20 md:py-28 lg:py-32">
        <div className="absolute inset-0 grain-texture opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-gradient-shift bg-[length:200%_200%]" aria-hidden="true" />
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-float" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        </div>
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl animate-fade-in-up" style={{ animationDelay: "0ms", animationFillMode: "both" }}>
              Discover Your <span className="text-gradient">Cybersecurity Risks</span> in Minutes
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 md:text-xl animate-fade-in-up leading-relaxed" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
              Get a comprehensive security assessment of your organization's attack surface and receive a detailed readiness report.
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
                <h2 className="text-center text-2xl font-bold text-card-foreground mb-2">Start Your Risk Assessment</h2>
                <p className="text-center text-muted-foreground mb-8">Enter your information below to begin a comprehensive security scan</p>

                <div className="grid gap-6 sm:grid-cols-2">
                  {([
                    { id: "organizationName", label: "Organization Name", icon: Building, placeholder: "Your Company Inc.", type: "text", required: true, span: 2 },
                    { id: "domain", label: "Primary Domain", icon: Globe, placeholder: "example.com", type: "text", required: true, span: 2 },
                    { id: "contactName", label: "Your Name", icon: User, placeholder: "John Doe", type: "text", required: true },
                    { id: "contactEmail", label: "Email Address", icon: Mail, placeholder: "john@example.com", type: "email", required: true },
                    { id: "contactPhone", label: "Phone Number", icon: Phone, placeholder: "+1 (555) 123-4567", type: "tel", required: false, span: 2 },
                  ] as const).map(field => (
                    <div key={field.id} className={field.span === 2 ? "sm:col-span-2" : ""}>
                      <label htmlFor={field.id} className="block text-sm font-medium mb-2">
                        {field.label} {field.required ? <span className="text-destructive">*</span> : <span className="text-muted-foreground text-xs">(Optional)</span>}
                      </label>
                      <div className="relative">
                        <field.icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id={field.id} type={field.type} placeholder={field.placeholder}
                          value={formData[field.id as keyof AssessmentForm] || ""}
                          onChange={e => handleInputChange(field.id as keyof AssessmentForm, e.target.value)}
                          className="h-12 pl-12 bg-background/50"
                          aria-invalid={!!formErrors[field.id as keyof AssessmentForm]}
                        />
                      </div>
                      {formErrors[field.id as keyof AssessmentForm] && (
                        <p className="mt-2 text-sm text-destructive">{formErrors[field.id as keyof AssessmentForm]}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Button size="lg" onClick={handleSubmit} disabled={isSubmitting}
                    className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
                    {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Assessment...</> : <>Start Assessment <ArrowRight className="ml-2 h-5 w-5" /></>}
                  </Button>
                </div>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  By starting this assessment, you agree to our <a href="/terms-of-service" className="underline hover:text-primary">Terms of Service</a>
                </p>
              </div>
            )}

            {/* ========== RESULTS STEP ========== */}
            {step === "results" && (
              <div className="space-y-8">

                {/* Scanning Progress Bar */}
                {isScanning && (
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex items-center gap-4 animate-fade-in-up">
                    <Loader2 className="h-6 w-6 text-primary animate-spin flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Scanning in progress...</p>
                      <p className="text-xs text-muted-foreground">Analyzing {formData.domain} - this usually takes 2-5 minutes</p>
                      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* A. Overall Score Card */}
                <div className={`rounded-3xl border-2 p-8 md:p-10 transition-all duration-500 ${isComplete && assessment ? getGradeBg(assessment.securityScore) : "border-border/50 bg-card"}`}>
                  <div className="flex flex-col items-center text-center">
                    {isComplete && assessment?.securityScore ? (
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
                        {/* Report download moved to CTA section with lead gate */}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 py-6">
                        <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 rounded-full" />
                        <Skeleton className="w-64 h-8" />
                        <Skeleton className="w-48 h-5" />
                        <Skeleton className="w-36 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* B. Security Category Breakdown */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Security Category Breakdown</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {CATEGORIES.map((cat, i) => {
                      const grade = getCategoryGrade(cat.gradeKey);
                      const catFindings = getCategoryFindings(cat.key);
                      const isExpanded = expandedCategory === cat.key;
                      const Icon = cat.icon;

                      return (
                        <div key={cat.key} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}>
                          <Card
                            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${isExpanded ? "ring-2 ring-primary" : ""} ${grade ? "" : ""}`}
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
                                        <h3 className="font-semibold text-sm">{cat.name}</h3>
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

                          {/* C. Expanded Findings */}
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

                {/* D. Dark Web Presence */}
                <Card className="animate-fade-in-up" style={{ animationDelay: "500ms", animationFillMode: "both" }}>
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

                {/* E. CTA Section */}
                <div className="rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-lg animate-fade-in-up" style={{ animationDelay: "600ms", animationFillMode: "both" }}>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-3">Get Your Full Security Report</h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Download a detailed PDF report with prioritized recommendations and remediation steps from our security experts.
                    </p>

                    {assessmentId && (
                      <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-lg group" onClick={handleDownloadReport}>
                        <Download className="mr-2 h-5 w-5" /> Download Full Report
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    )}

                    <div className="mt-6">
                      <Button variant="link" className="text-primary text-lg group" onClick={openModal}>
                        Want expert remediation? Talk to our team <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl mb-12">What We Assess</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: "External Attack Surface", desc: "We scan your public-facing infrastructure for vulnerabilities and misconfigurations" },
              { icon: Globe, title: "DNS & Email Security", desc: "Analysis of your domain's DNS health, email authentication, and anti-spoofing measures" },
              { icon: AlertTriangle, title: "Known Vulnerabilities", desc: "Identification of publicly disclosed vulnerabilities in your technology stack" },
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
    </Layout>
  );
}
