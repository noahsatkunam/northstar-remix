import { useState, useEffect, useRef } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  Inbox,
  BadgeCheck,
  FileText,
  Loader2,
  Globe,
  Check,
  ArrowRight,
  ChevronDown,
  Lock,
  X,
} from "lucide-react";
import { useContactModal } from "@/components/ContactModal";

type RecordStatus = "pass" | "fail" | "warning" | "unknown";
type OverallScore = "strong" | "needs-attention" | "at-risk";

// Circular Progress Component using SVG stroke-dasharray/dashoffset
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

interface RecordResult {
  status: RecordStatus;
  value: string;
  explanation: string;
}

interface CheckResults {
  dmarc: RecordResult;
  spf: RecordResult;
  dkim: RecordResult & { selectors?: string[] };
  overallScore: OverallScore;
}

const exampleDomains = ["google.com", "microsoft.com", "apple.com"];

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

  // Check all selectors in parallel
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

async function performScan(domain: string): Promise<CheckResults> {
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

// ==================== UI COMPONENTS ====================

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

const DOMAIN_REGEX = /^(?!-)[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

const validateDomain = (domain: string): string | null => {
  const trimmed = domain.trim();
  if (!trimmed) return "Please enter a domain name";
  const cleanDomain = trimmed.replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
  if (!DOMAIN_REGEX.test(cleanDomain)) return "Please enter a valid domain (e.g., example.com)";
  return null;
};

const MAX_DOMAIN_DISPLAY_LENGTH = 30;

const TruncatedDomain = ({ domain, maxLength = MAX_DOMAIN_DISPLAY_LENGTH, className = "" }: { domain: string; maxLength?: number; className?: string }) => {
  const shouldTruncate = domain.length > maxLength;
  const displayText = shouldTruncate ? `${domain.slice(0, maxLength)}...` : domain;

  if (!shouldTruncate) return <span className={className}>{domain}</span>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`cursor-help ${className}`}>{displayText}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs break-all">{domain}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ==================== LEAD CAPTURE MODAL ====================

interface LeadCaptureModalProps {
  isOpen: boolean;
  domain: string;
  onSubmit: (data: { firstName: string; lastName: string; email: string; company: string }) => void;
}

const LeadCaptureModal = ({ isOpen, domain, onSubmit }: LeadCaptureModalProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "Required";
    if (!lastName.trim()) errs.lastName = "Required";
    if (!email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    if (!company.trim()) errs.company = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    onSubmit({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), company: company.trim() });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-fade-in-up overflow-hidden">
        {/* Header */}
        <div className="bg-primary/10 px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-card-foreground">Your Results Are Ready</h3>
              <p className="text-sm text-muted-foreground">Enter your details to view the full report for <span className="font-semibold text-foreground">{domain}</span></p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                placeholder="First Name *"
                value={firstName}
                onChange={e => { setFirstName(e.target.value); if (errors.firstName) setErrors(p => ({ ...p, firstName: "" })); }}
                className={`bg-background/50 ${errors.firstName ? "border-destructive" : ""}`}
              />
              {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <Input
                placeholder="Last Name *"
                value={lastName}
                onChange={e => { setLastName(e.target.value); if (errors.lastName) setErrors(p => ({ ...p, lastName: "" })); }}
                className={`bg-background/50 ${errors.lastName ? "border-destructive" : ""}`}
              />
              {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
            </div>
          </div>
          <div>
            <Input
              type="email"
              placeholder="Email Address *"
              value={email}
              onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: "" })); }}
              className={`bg-background/50 ${errors.email ? "border-destructive" : ""}`}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Input
              placeholder="Company *"
              value={company}
              onChange={e => { setCompany(e.target.value); if (errors.company) setErrors(p => ({ ...p, company: "" })); }}
              className={`bg-background/50 ${errors.company ? "border-destructive" : ""}`}
            />
            {errors.company && <p className="text-xs text-destructive mt-1">{errors.company}</p>}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 group h-12 text-base"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Unlocking...</>
            ) : (
              <>View Your Results <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" /> Your information is secure and never shared.
          </p>
        </form>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

export default function DmarcChecker() {
  const [domain, setDomain] = useState("");
  const [checkedDomain, setCheckedDomain] = useState("");
  const [results, setResults] = useState<CheckResults | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [showLeadGate, setShowLeadGate] = useState(false);
  const [resultsRevealed, setResultsRevealed] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const leadDataRef = useRef<{ firstName: string; lastName: string; email: string; company: string } | null>(null);
  const [pendingResults, setPendingResults] = useState<CheckResults | null>(null);
  const { openModal } = useContactModal();

  const checkInProgressRef = useRef(false);

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
    if (domainError) setDomainError(null);
  };

  const handleCheck = async () => {
    if (checkInProgressRef.current || isChecking) return;

    const error = validateDomain(domain);
    if (error) { setDomainError(error); return; }

    const cleanDomain = domain.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");

    setDomainError(null);
    setIsChecking(true);
    checkInProgressRef.current = true;
    setCheckedDomain(cleanDomain);
    setResults(null);
    setResultsRevealed(false);
    setPendingResults(null);

    try {
      const scanResults = await performScan(cleanDomain);
      setPendingResults(scanResults);
      if (leadCaptured && leadDataRef.current) {
        // Already captured lead - skip gate, just log and show results
        try {
          const apiBase = import.meta.env.PROD ? "" : "http://localhost:3001";
          await fetch(`${apiBase}/api/scan-leads`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...leadDataRef.current,
              domain: cleanDomain,
              results: scanResults,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (_) { /* don't block */ }
        setResults(scanResults);
        setResultsRevealed(true);
      } else {
        setShowLeadGate(true);
      }
    } catch (err) {
      console.error("Scan failed:", err);
      setDomainError("Scan failed. Please try again.");
    } finally {
      setIsChecking(false);
      checkInProgressRef.current = false;
    }
  };

  const handleLeadSubmit = async (leadData: { firstName: string; lastName: string; email: string; company: string }) => {
    // Send lead data to backend
    try {
      const apiBase = import.meta.env.PROD ? "" : "http://localhost:3001";
      await fetch(`${apiBase}/api/scan-leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadData,
          domain: checkedDomain,
          results: pendingResults,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Failed to save lead:", err);
      // Don't block - still show results
    }

    // Remember lead info for future scans
    setLeadCaptured(true);
    leadDataRef.current = leadData;

    // Reveal results
    setResults(pendingResults);
    setShowLeadGate(false);
    setResultsRevealed(true);
  };

  const getOverallShield = () => {
    if (!results) return null;
    switch (results.overallScore) {
      case "strong":
        return { icon: ShieldCheck, color: "text-secondary", bg: "bg-secondary/10", label: "Strong", message: "Your email security is properly configured" };
      case "needs-attention":
        return { icon: ShieldAlert, color: "text-chart-4", bg: "bg-chart-4/10", label: "Needs Attention", message: "Your email security could be improved" };
      case "at-risk":
        return { icon: ShieldX, color: "text-destructive", bg: "bg-destructive/10", label: "At Risk", message: "Your domain is vulnerable to email spoofing" };
    }
  };

  const overallShield = getOverallShield();

  return (
    <Layout>
      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadGate}
        domain={checkedDomain}
        onSubmit={handleLeadSubmit}
      />

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
              Check Your <span className="text-gradient">Email Security</span> in Seconds
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 md:text-xl animate-fade-in-up leading-relaxed" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              See if your domain has proper DMARC, SPF, and DKIM records configured to prevent spoofing.
            </p>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-subtle opacity-50">
          <ChevronDown className="h-8 w-8 text-white" />
        </div>
      </section>

      {/* Tool Section */}
      <section className="py-16 md:py-24 bg-background relative -mt-10 z-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-border/50 bg-card p-8 md:p-12 shadow-2xl backdrop-blur-sm">
              <h2 className="text-center text-2xl font-bold text-card-foreground mb-8">Enter Your Domain</h2>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="group relative flex-1">
                  <div className="relative rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50 focus-within:shadow-lg">
                    <Globe className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-300 ${domainError ? "text-destructive" : "text-muted-foreground group-focus-within:text-primary"}`} />
                    <Input
                      type="text"
                      placeholder="yourdomain.com"
                      value={domain}
                      onChange={handleDomainChange}
                      onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                      className="flex-1 h-14 pl-12 text-lg bg-background/50 border-border/50 rounded-xl focus-visible:ring-0 focus-visible:border-primary"
                      data-error={domainError ? "true" : undefined}
                      aria-invalid={!!domainError}
                      aria-describedby={domainError ? "domain-error" : undefined}
                    />
                  </div>
                  {domainError && (
                    <p id="domain-error" className="mt-2 text-sm text-destructive animate-fade-in font-medium pl-1" role="alert">{domainError}</p>
                  )}
                </div>
                <Button size="lg" onClick={handleCheck} disabled={isChecking} className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto rounded-xl shadow-lg hover:shadow-primary/25 transition-all">
                  {isChecking ? (<><Loader2 className="animate-spin mr-2" />Scanning...</>) : ("Check Domain")}
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <span className="text-sm text-muted-foreground font-medium">Try:</span>
                {exampleDomains.map((d) => (
                  <button key={d} onClick={() => setDomain(d)} className="rounded-full bg-muted/50 border border-border/50 px-4 py-1.5 text-sm transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/20">
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {results && resultsRevealed && (
        <section className="border-t border-border bg-muted py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mx-auto max-w-3xl">
              {/* Overall Score */}
              {overallShield && (
                <div className={`mb-6 sm:mb-10 flex flex-col items-center p-4 sm:p-8 text-center ${overallShield.bg}`}>
                  <div className="mb-4 text-sm text-muted-foreground">
                    Results for <TruncatedDomain domain={checkedDomain} className="font-semibold text-foreground" />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <CircularProgress score={results.overallScore} />
                    <div className="flex flex-col items-center sm:items-start">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <overallShield.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${overallShield.color}`} />
                        <h3 className={`text-xl sm:text-2xl font-bold ${overallShield.color}`}>{overallShield.label}</h3>
                      </div>
                      <p className="mt-2 text-sm sm:text-base text-muted-foreground">{overallShield.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* DMARC Record */}
              <Card className="mb-4 sm:mb-6 opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none animate-fade-in-up" style={{ animationDelay: "0ms" }}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">DMARC Record</CardTitle>
                    <StatusBadge status={results.dmarc.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  {results.dmarc.value && (
                    <div className="mb-4 overflow-x-auto rounded-md bg-sidebar p-3 sm:p-4 -mx-2 sm:mx-0">
                      <code className="text-xs sm:text-sm text-sidebar-foreground break-all whitespace-pre-wrap">{results.dmarc.value}</code>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{results.dmarc.explanation}</p>
                </CardContent>
              </Card>

              {/* SPF Record */}
              <Card className="mb-4 sm:mb-6 opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">SPF Record</CardTitle>
                    <StatusBadge status={results.spf.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  {results.spf.value && (
                    <div className="mb-4 overflow-x-auto rounded-md bg-sidebar p-3 sm:p-4 -mx-2 sm:mx-0">
                      <code className="text-xs sm:text-sm text-sidebar-foreground break-all whitespace-pre-wrap">{results.spf.value}</code>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{results.spf.explanation}</p>
                </CardContent>
              </Card>

              {/* DKIM Record */}
              <Card className="mb-4 sm:mb-6 opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">DKIM Record</CardTitle>
                    <StatusBadge status={results.dkim.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  {results.dkim.value && (
                    <div className="mb-4 overflow-x-auto rounded-md bg-sidebar p-3 sm:p-4 -mx-2 sm:mx-0">
                      <code className="text-xs sm:text-sm text-sidebar-foreground break-all whitespace-pre-wrap">{results.dkim.value}</code>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{results.dkim.explanation}</p>
                </CardContent>
              </Card>

              {/* Congratulations (strong) */}
              {results.overallScore === "strong" && (
                <div className="mt-6 sm:mt-10 opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none animate-fade-in-up overflow-hidden rounded-lg border-2 border-secondary/30 bg-gradient-to-br from-card via-card to-secondary/5 shadow-lg" style={{ animationDelay: '450ms', animationFillMode: 'forwards' }}>
                  <div className="bg-secondary/10 px-4 sm:px-6 py-3 border-b border-secondary/20">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <ShieldCheck className="h-5 w-5 text-secondary" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-secondary hidden sm:block motion-reduce:hidden animate-ping" />
                      </div>
                      <span className="text-sm font-semibold text-secondary">All Checks Passed - Your Domain is Secure</span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-secondary/10 mb-4">
                        <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-secondary" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-card-foreground">Congratulations! Your Email Security is Strong</h3>
                      <p className="mt-2 max-w-md text-muted-foreground">Your domain has properly configured DMARC, SPF, and DKIM records. Your emails are protected against spoofing and phishing attacks.</p>
                      <ul className="mt-4 sm:mt-6 grid gap-2 sm:gap-3 sm:grid-cols-2 text-left w-full max-w-lg">
                        {["Protected from email spoofing", "Maximum inbox deliverability", "Brand reputation secured", "Compliance with email standards"].map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 flex-shrink-0 text-secondary" />{benefit}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 pt-6 border-t border-border w-full">
                        <p className="text-sm text-muted-foreground mb-3">Want to maintain this security level with ongoing monitoring?</p>
                        <Button variant="outline" size="lg" className="border-secondary/50 text-secondary hover:bg-secondary/10" onClick={openModal}>
                          Learn About Monitoring <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lead Capture CTA (non-perfect scores) */}
              {results.overallScore !== "strong" && (
                <div className="mt-6 sm:mt-10 opacity-0 motion-reduce:opacity-100 motion-reduce:animate-none animate-fade-in-up overflow-hidden rounded-lg border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg" style={{ animationDelay: '450ms' }}>
                  <div className="bg-primary/10 px-4 sm:px-6 py-3 border-b border-primary/20">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive motion-reduce:animate-none animate-pulse" />
                      </div>
                      <span className="text-sm font-semibold text-primary">Issues Detected - Expert Help Available</span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col items-center text-center">
                      <h3 className="text-lg sm:text-xl font-bold text-card-foreground">Need Help Fixing These Issues?</h3>
                      <p className="mt-2 max-w-md text-muted-foreground">Our experts can implement proper DMARC, SPF, and DKIM for your domain with a detailed remediation plan.</p>
                      <ul className="mt-4 space-y-2 text-left">
                        {["Complete DMARC, SPF & DKIM configuration", "Step-by-step remediation", "Priority recommendations", "No commitment required"].map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-4 w-4 flex-shrink-0 text-secondary" />{benefit}
                          </li>
                        ))}
                      </ul>
                      <Button size="lg" className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 group" onClick={openModal}>
                        Get Expert Help <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Educational Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">Why Email Authentication Matters</h2>
          <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 md:grid-cols-3">
            <div className="border border-border bg-card p-4 sm:p-6 text-center transition-all duration-300 motion-reduce:transition-none hover:-translate-y-1 motion-reduce:hover:translate-y-0 hover:shadow-lg">
              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-primary/10"><Shield className="h-7 w-7 text-primary" /></div>
              <h3 className="mt-5 text-lg font-semibold text-card-foreground">Prevent Spoofing</h3>
              <p className="mt-2 text-sm text-muted-foreground">Stop attackers from sending emails that look like they're from you</p>
              <Accordion type="single" collapsible className="mt-4 text-left">
                <AccordionItem value="spoofing-info" className="border-none">
                  <AccordionTrigger className="justify-center gap-2 py-2 text-sm text-primary hover:no-underline">Learn more</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    <p className="mb-2"><strong className="text-card-foreground">Email spoofing</strong> is when attackers forge the "From" address to make emails appear to come from your domain.</p>
                    <p className="mb-2">Without proper authentication, anyone can send emails claiming to be from your organization, potentially leading to:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Phishing attacks targeting your customers</li>
                      <li>Business email compromise (BEC) scams</li>
                      <li>Malware distribution under your name</li>
                    </ul>
                    <p className="mt-2">DMARC, SPF, and DKIM work together to verify that emails genuinely originate from authorized servers.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="border border-border bg-card p-4 sm:p-6 text-center transition-all duration-300 motion-reduce:transition-none hover:-translate-y-1 motion-reduce:hover:translate-y-0 hover:shadow-lg">
              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-primary/10"><Inbox className="h-7 w-7 text-primary" /></div>
              <h3 className="mt-5 text-lg font-semibold text-card-foreground">Improve Deliverability</h3>
              <p className="mt-2 text-sm text-muted-foreground">Authenticated emails are more likely to reach the inbox</p>
              <Accordion type="single" collapsible className="mt-4 text-left">
                <AccordionItem value="deliverability-info" className="border-none">
                  <AccordionTrigger className="justify-center gap-2 py-2 text-sm text-primary hover:no-underline">Learn more</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    <p className="mb-2"><strong className="text-card-foreground">Email providers like Gmail, Microsoft, and Yahoo</strong> use authentication signals to determine inbox placement.</p>
                    <p className="mb-2">Properly configured email authentication helps ensure:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Higher inbox placement rates</li>
                      <li>Reduced spam folder filtering</li>
                      <li>Better sender reputation over time</li>
                      <li>Compliance with new 2024 sender requirements</li>
                    </ul>
                    <p className="mt-2">Major email providers now require DMARC for bulk senders, making it essential for business communications.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="border border-border bg-card p-4 sm:p-6 text-center transition-all duration-300 motion-reduce:transition-none hover:-translate-y-1 motion-reduce:hover:translate-y-0 hover:shadow-lg">
              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-primary/10"><BadgeCheck className="h-7 w-7 text-primary" /></div>
              <h3 className="mt-5 text-lg font-semibold text-card-foreground">Protect Your Brand</h3>
              <p className="mt-2 text-sm text-muted-foreground">Maintain trust with customers and partners</p>
              <Accordion type="single" collapsible className="mt-4 text-left">
                <AccordionItem value="brand-info" className="border-none">
                  <AccordionTrigger className="justify-center gap-2 py-2 text-sm text-primary hover:no-underline">Learn more</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    <p className="mb-2"><strong className="text-card-foreground">Brand impersonation</strong> can cause lasting damage to your organization's reputation and customer trust.</p>
                    <p className="mb-2">Email authentication provides measurable brand protection:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Receive reports on who's sending email as your domain</li>
                      <li>Block unauthorized senders from impersonating you</li>
                      <li>Enable BIMI (Brand Indicators for Message Identification) for logo display</li>
                      <li>Build long-term trust with customers and partners</li>
                    </ul>
                    <p className="mt-2">With DMARC reporting, you gain visibility into all email sent using your domain name.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-sidebar py-16 md:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-sidebar-foreground md:text-3xl">Need Help Fixing Your Email Security?</h2>
            <p className="mt-4 text-sidebar-foreground/70">Our team can implement proper DMARC, SPF, and DKIM for your domain</p>
            <div className="mt-8">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={openModal}>Get Expert Help</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
