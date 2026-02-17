import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/motion/AnimatedSection";
import { CountUp } from "@/components/motion/CountUp";
import {
  Shield,
  Rocket,
  ArrowRight,
  CheckCircle2,
  Server,
  Heart,
  Scale,
  Building,
  Lock,
  Globe,
  Cpu,
  Wifi,
  ShieldCheck,
  Cloud,
  Headphones,
  Quote,
  Star,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";
import inc5000Badge from "@/assets/inc-5000-badge.png";
import soc2Badge from "@/assets/soc2-badge.webp";
import hipaaBadge from "@/assets/hipaa-badge.png";

export default function Index() {
  const protectPropelRef = useRef<HTMLDivElement>(null);

  const scrollToProtectPropel = () => {
    const element = document.getElementById("protect-propel");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Layout>
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/[0.07] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-accent/[0.05] rounded-full blur-[100px]" />
          <div className="absolute inset-0 dot-pattern opacity-40" />
        </div>

        <div className="container relative z-10 px-4 md:px-8 pt-28 pb-16 md:pt-40 md:pb-28">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex justify-center md:justify-start mb-8"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 text-accent font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  Inc. 5000 #2393
                </span>
                <span className="w-px h-3 bg-white/10" />
                <span>25+ years protecting regulated organizations</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.05] text-center md:text-left mb-8"
            >
              We protect and modernize{" "}
              <span className="text-gradient">regulated organizations.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed text-center md:text-left mb-10"
            >
              Cybersecurity, compliance, and AI readiness for healthcare,
              defense contractors, financial services, and law firms. Stay
              secure, audit-ready, and fully operational.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <Button
                size="lg"
                className="h-13 px-7 text-base rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30"
                onClick={scrollToProtectPropel}
              >
                See How It Works
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link to="/security-check">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 px-7 text-base rounded-xl border-border/60 bg-white/[0.03] hover:bg-white/[0.06] hover:border-border transition-all duration-200 w-full sm:w-auto"
                >
                  Run a Security Check
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center gap-5 mt-14 justify-center md:justify-start"
            >
              <span className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">
                Certified
              </span>
              <div className="flex items-center gap-4">
                <img src={inc5000Badge} alt="Inc 5000" className="h-8 object-contain opacity-40 grayscale" />
                <img src={soc2Badge} alt="SOC 2 Type II" className="h-8 object-contain opacity-40 grayscale" />
                <img src={hipaaBadge} alt="HIPAA Compliant" className="h-8 object-contain opacity-40 grayscale" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <button
            onClick={scrollToProtectPropel}
            className="flex flex-col items-center gap-2 text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
            aria-label="Scroll to learn more"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] font-medium">Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-8 rounded-full border border-current flex justify-center pt-1.5"
            >
              <div className="w-1 h-1.5 rounded-full bg-current" />
            </motion.div>
          </button>
        </motion.div>
      </section>

      {/* ===== PARTNER MARQUEE ===== */}
      <section className="py-6 border-y border-border/30 bg-white/[0.01] overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-content" style={{ animation: "marquee 40s linear infinite" }}>
            {[...Array(2)].map((_, i) => (
              <span key={i} className="inline-flex items-center gap-12 md:gap-16 px-6 md:px-8">
                <img src={inc5000Badge} alt="Inc 5000" className="h-8 md:h-9 object-contain opacity-25 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-500" />
                <img src={soc2Badge} alt="SOC 2" className="h-8 md:h-9 object-contain opacity-25 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-500" />
                <img src={hipaaBadge} alt="HIPAA" className="h-8 md:h-9 object-contain opacity-25 grayscale hover:grayscale-0 hover:opacity-60 transition-all duration-500" />
                <span className="text-sm font-semibold text-foreground/15 whitespace-nowrap tracking-[0.15em] uppercase">Microsoft</span>
                <span className="text-sm font-semibold text-foreground/15 whitespace-nowrap tracking-[0.15em] uppercase">CrowdStrike</span>
                <span className="text-sm font-semibold text-foreground/15 whitespace-nowrap tracking-[0.15em] uppercase">SentinelOne</span>
                <span className="text-sm font-semibold text-foreground/15 whitespace-nowrap tracking-[0.15em] uppercase">Palo Alto</span>
                <span className="text-sm font-semibold text-foreground/15 whitespace-nowrap tracking-[0.15em] uppercase">Dell</span>
                <span className="text-sm font-semibold text-foreground/15 whitespace-nowrap tracking-[0.15em] uppercase">Datto</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MANIFESTO + STATS ===== */}
      <section className="py-24 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
        <div className="container px-4 md:px-8 relative z-10">
          <div className="max-w-4xl mx-auto space-y-16">
            <AnimatedSection>
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-6 text-center">
                The Challenge
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-center">
                Regulated organizations are being pulled in{" "}
                <span className="text-primary">two directions</span>.
              </h2>
            </AnimatedSection>

            <AnimatedSection>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
                Cyber risk is rising. Compliance expectations are tightening. And
                AI is transforming the world faster than most teams can safely
                adapt. Yet many IT strategies are still reactive: fragmented
                vendors, constant firefighting, and no clear path forward.
              </p>
            </AnimatedSection>

            {/* Stats */}
            <AnimatedSection>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/30 rounded-2xl overflow-hidden border border-border/30">
                {[
                  { value: 500, suffix: "+", label: "Endpoints Managed" },
                  { value: 99.9, suffix: "%", label: "Uptime SLA", decimals: 1 },
                  { value: 24, suffix: "/7", label: "Threat Monitoring" },
                  { value: 25, suffix: "+", label: "Years Experience" },
                ].map((stat, i) => (
                  <div key={i} className="bg-background/80 p-6 md:p-8 text-center">
                    <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                      <CountUp end={stat.value} duration={2} decimals={stat.decimals || 0} />
                      <span className="text-primary">{stat.suffix}</span>
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <p className="text-2xl md:text-3xl font-medium text-foreground leading-snug text-center max-w-3xl mx-auto">
                We believe organizations entrusted with sensitive data deserve
                technology that creates{" "}
                <span className="text-primary">stability, confidence, and a future-ready advantage</span>
                {" "}without adding chaos or complexity.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== PROTECT & PROPEL ===== */}
      <section id="protect-propel" className="py-24 md:py-36 relative" ref={protectPropelRef}>
        <div className="container px-4 md:px-8">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
              <p className="text-sm font-semibold text-accent uppercase tracking-[0.2em] mb-4">
                Our Approach
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                A system built for regulated confidence.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Two phases that keep you secure and audit-ready today, then help you modernize with safe, practical AI.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* PROTECT */}
            <AnimatedSection>
              <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 md:p-10 hover:border-primary/30 transition-all duration-500 h-full">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/[0.06] transition-colors duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Protect</h3>
                      <p className="text-sm text-muted-foreground">Your foundation</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Security, compliance, and uptime you can count on. We lock down your environment so you can focus on what matters.
                  </p>

                  <ul className="space-y-3">
                    {[
                      "Protected from ransomware and breaches",
                      "Audit-ready year-round (HIPAA / CMMC / GLBA)",
                      "Operational uptime you can count on",
                      "24/7 monitoring and response",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-[15px]">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </AnimatedSection>

            {/* PROPEL */}
            <AnimatedSection delay={0.15}>
              <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 md:p-10 hover:border-accent/30 transition-all duration-500 h-full">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/[0.06] transition-colors duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Rocket className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Propel</h3>
                      <p className="text-sm text-muted-foreground">Your advantage</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Safe AI adoption, automation, and modern growth. We help you move faster without breaking compliance.
                  </p>

                  <ul className="space-y-3">
                    {[
                      "Secure, compliant AI adoption",
                      "Automation that frees up staff time",
                      "Faster workflows and documentation",
                      "Scale without adding headcount",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-[15px]">
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ===== WHO WE SERVE ===== */}
      <section className="py-24 md:py-36 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
        <div className="container px-4 md:px-8 relative z-10">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-4">
                Industries
              </p>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Built for organizations that can't afford mistakes.
              </h2>
              <p className="text-lg text-muted-foreground">
                Where audits, downtime, and sensitive data exposure carry real consequences.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Heart,
                title: "Healthcare",
                tag: "HIPAA",
                desc: "HIPAA-secure systems that protect patient care and reduce audit stress.",
                link: "/compliance",
                linkText: "Explore Healthcare IT",
              },
              {
                icon: Shield,
                title: "DoD Contractors",
                tag: "CMMC",
                desc: "CMMC-ready cybersecurity that keeps contracts compliant and assessments smooth.",
                link: "/services",
                linkText: "View CMMC Solutions",
              },
              {
                icon: Scale,
                title: "Law & Finance",
                tag: "GLBA",
                desc: "Technology that protects client confidentiality and strengthens trust.",
                link: "/services",
                linkText: "See Solutions",
              },
              {
                icon: Building,
                title: "Enterprise",
                tag: "Multi-framework",
                desc: "Comprehensive security and compliance for complex, high-stakes environments.",
                link: "/services",
                linkText: "Learn More",
              },
            ].map((industry, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <Link to={industry.link} className="group block h-full">
                  <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-7 hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <industry.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-white/[0.04] px-2.5 py-1 rounded-md">
                        {industry.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{industry.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                      {industry.desc}
                    </p>
                    <span className="inline-flex items-center text-sm text-primary font-medium group-hover:gap-2 gap-1 transition-all">
                      {industry.linkText}
                      <ArrowRight className="w-3.5 h-3.5 arrow-animate" />
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES GRID ===== */}
      <section className="py-24 md:py-36">
        <div className="container px-4 md:px-8">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-accent uppercase tracking-[0.2em] mb-4">
                  Capabilities
                </p>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  How we help.
                </h2>
                <p className="text-lg text-muted-foreground">
                  Everything you need to stay secure, audit-ready, and prepared for
                  safe AI modernization.
                </p>
              </div>
              <Link to="/services">
                <Button
                  variant="outline"
                  className="rounded-xl px-5 border-border/60 bg-white/[0.03] hover:bg-white/[0.06] hover:border-border"
                >
                  View All Services
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Server, title: "Managed IT & Operations", desc: "Always-on systems that reduce downtime and keep your organization running smoothly." },
              { icon: Lock, title: "Cybersecurity & Compliance", desc: "24/7 security and compliance-ready controls that keep audits stress-free." },
              { icon: Cloud, title: "Cloud Infrastructure", desc: "Azure and AWS migration, optimization, and management." },
              { icon: Cpu, title: "AI Modernization", desc: "Automation and productivity gains, with the guardrails regulated teams require." },
              { icon: ShieldCheck, title: "EDR / XDR", desc: "Endpoint detection and response across your entire fleet." },
              { icon: Wifi, title: "SASE & Zero Trust", desc: "Secure access service edge for the modern workforce." },
              { icon: Headphones, title: "Co-Managed IT", desc: "Augment your internal team with our engineers on demand." },
              { icon: Globe, title: "Compliance", desc: "HIPAA, SOC 2, CMMC, GLBA: audit-ready, always." },
            ].map((service, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div className="group p-6 rounded-2xl bg-card/50 border border-border/30 hover:bg-card hover:border-border/60 transition-all duration-300 cursor-pointer h-full">
                  <service.icon className="w-8 h-8 text-muted-foreground mb-5 group-hover:text-primary transition-colors duration-300" />
                  <h3 className="text-base font-bold mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 md:py-36 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
        <div className="container px-4 md:px-8 relative z-10">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-4">
                Testimonials
              </p>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Trusted in high-stakes environments.
              </h2>
              <p className="text-muted-foreground">
                Back-to-back Inc. 5000 honoree: #3837 (2024) and #2393 (2025) with 178% three-year growth.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                quote: "NorthStar gave us the confidence that our security and compliance posture could keep pace with our growth. They don't just manage our IT. They genuinely understand the regulatory pressures we face every day.",
                name: "IT Director",
                title: "Healthcare Organization",
                stars: 5,
              },
              {
                quote: "Their team feels like an extension of ours. Response times are incredible, and they actually understand the unique demands of financial services.",
                name: "Michael Torres",
                title: "VP of Operations, Meridian Capital",
                stars: 5,
              },
              {
                quote: "We needed CMMC compliance fast. NorthStar delivered a clear roadmap and executed flawlessly. Our contracts were never at risk.",
                name: "James Wright",
                title: "CEO, Apex Defense Solutions",
                stars: 5,
              },
            ].map((testimonial, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="relative p-7 rounded-2xl bg-card border border-border/50 hover:border-border transition-all duration-300 h-full flex flex-col">
                  <Quote className="w-8 h-8 text-primary/20 mb-5" />
                  <p className="text-muted-foreground leading-relaxed mb-6 flex-1 text-[15px]">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: testimonial.stars }).map((_, si) => (
                      <Star key={si} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.title}</div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-accent/5" />
          <div className="absolute inset-0 dot-pattern opacity-30" />
        </div>

        <div className="container relative z-10 px-4 md:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight max-w-4xl mx-auto">
              Start with clarity, not a sales pitch.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              In regulated environments, you don't need more noise. You need to
              know where you stand. We'll help you understand your security,
              compliance, and AI readiness clearly.
            </p>

            <div className="flex items-center justify-center gap-4 md:gap-8 mb-10">
              <img src={inc5000Badge} alt="Inc 5000" className="h-9 md:h-11 object-contain opacity-30 grayscale" />
              <img src={soc2Badge} alt="SOC 2" className="h-9 md:h-11 object-contain opacity-30 grayscale" />
              <img src={hipaaBadge} alt="HIPAA" className="h-9 md:h-11 object-contain opacity-30 grayscale" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/security-check">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  Run a Security & AI Readiness Check
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-base rounded-xl border-border/60 bg-white/[0.03] hover:bg-white/[0.06] hover:border-border transition-all"
                >
                  Learn About Us
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
