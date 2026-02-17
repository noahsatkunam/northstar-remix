import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Shield, FileCheck, Search, Settings, Activity, CheckCircle2, Lock, ShieldCheck, BarChart3, Scale, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import { AnimatedSection } from "@/components/motion/AnimatedSection";
import { motion } from "framer-motion";

const complianceAreas = [
  {
    icon: Shield,
    title: "HIPAA",
    subtitle: "Healthcare",
    description: "Complete PHI protection and risk management for covered entities and business associates.",
    features: ["Risk Assessments", "BAA Management", "Breach Response"],
  },
  {
    icon: FileCheck,
    title: "SOC 2",
    subtitle: "SaaS & Service Providers",
    description: "Demonstrate your commitment to security, availability, and confidentiality.",
    features: ["Gap Analysis", "Control Implementation", "Audit Prep"],
  },
  {
    icon: ShieldCheck,
    title: "CMMC 2.0",
    subtitle: "Defense Contractors",
    description: "Navigate the complexities of DoD compliance requirements (Level 1 & 2).",
    features: ["CUI Protection", "SPR/SPRS Scoring", "Readiness Assessment"],
  },
  {
    icon: Scale,
    title: "FTC Safeguards",
    subtitle: "Financial Institutions",
    description: "Mandatory information security programs for auto dealers and non-bank lenders.",
    features: ["Encryption", "MFA Implementation", "Vendor Oversight"],
  },
  {
    icon: Lock,
    title: "ITAR",
    subtitle: "Aerospace & Defense",
    description: "Strict control over defense-related technical data and services.",
    features: ["Data Classification", "Access Controls", "Export Compliance"],
  },
  {
    icon: BarChart3,
    title: "NIST CSF",
    subtitle: "General Framework",
    description: "The gold standard for voluntary cybersecurity risk management.",
    features: ["Identify", "Protect", "Detect", "Respond", "Recover"],
  },
];

export default function Compliance() {
  const { openModal } = useContactModal();

  return (
    <Layout>
      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 dot-pattern opacity-30" />
          <div className="absolute top-0 left-1/3 w-[50vw] h-[50vw] bg-primary/[0.05] rounded-full blur-[120px]" />
        </div>

        <div className="container relative z-10 px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm font-medium mb-8">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span className="text-muted-foreground">Audit-Ready Infrastructure</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              Compliance without the{" "}
              <span className="text-gradient">complexity.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10">
              Navigate HIPAA, CMMC, NIST, ITAR, and industry regulations with
              confidence through our expert-led approach.
            </p>
            <Button
              size="lg"
              className="h-13 px-7 text-base rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              onClick={openModal}
            >
              Request a Compliance Assessment
            </Button>
          </motion.div>
        </div>
      </section>

      {/* COMPLIANCE AREAS */}
      <section className="py-24 md:py-36">
        <div className="container px-4 md:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {complianceAreas.map((area, index) => (
              <AnimatedSection key={index} delay={index * 0.08}>
                <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-7 hover:border-primary/30 transition-all duration-300 h-full">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <area.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-white/[0.04] px-2.5 py-1 rounded-md">
                        {area.subtitle}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-3">{area.title}</h3>
                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                      {area.description}
                    </p>

                    <ul className="space-y-2">
                      {area.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-24 md:py-36 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
        <div className="container px-4 md:px-8 relative z-10">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-sm font-semibold text-accent uppercase tracking-[0.2em] mb-4">
                Methodology
              </p>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Our compliance approach.</h2>
              <p className="text-lg text-muted-foreground">
                A proven methodology that takes you from assessment through continuous compliance.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-14 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {[
              { title: "Assess", desc: "Comprehensive evaluation of current state", icon: Search, num: "01" },
              { title: "Plan", desc: "Prioritized roadmap to compliance", icon: Settings, num: "02" },
              { title: "Implement", desc: "Technical and administrative controls", icon: FileText, num: "03" },
              { title: "Monitor", desc: "Ongoing validation and improvement", icon: Activity, num: "04" },
            ].map((step, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <div className="relative text-center group">
                  <div className="w-[72px] h-[72px] mx-auto bg-card border-2 border-border/50 rounded-2xl flex items-center justify-center mb-5 relative z-10 group-hover:border-primary/50 transition-colors duration-300">
                    <step.icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs font-bold text-primary/60 mb-1 font-mono">{step.num}</p>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-accent/5" />
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="container relative z-10 px-4 md:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Concerned about your compliance posture?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Our team includes certified compliance professionals dedicated to your success.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="h-14 px-8 text-base rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                onClick={openModal}
              >
                Request a Compliance Assessment
              </Button>
              <Link to="/security-check">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-base rounded-xl border-border/60 bg-white/[0.03] hover:bg-white/[0.06] hover:border-border transition-all"
                >
                  Free Risk Assessment
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
