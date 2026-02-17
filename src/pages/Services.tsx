import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Server, Shield, Bot, Lightbulb, CheckCircle2, ArrowRight, Cpu, Zap } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import { AnimatedSection } from "@/components/motion/AnimatedSection";
import { motion } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";

const serviceCategories = [
  {
    id: "managed-it",
    icon: Server,
    title: "Managed IT Services",
    subtitle: "Operational Excellence",
    description: "Comprehensive IT support that keeps your business running smoothly.",
    features: [
      "24/7 Proactive Monitoring",
      "Strategic Vendor Management",
      "Cloud Infrastructure (Azure/AWS)",
      "Disaster Recovery Planning",
    ],
    accent: "primary",
  },
  {
    id: "cybersecurity",
    icon: Shield,
    title: "Cybersecurity & Compliance",
    subtitle: "Unshakeable Defense",
    description: "Protect your business and meet regulatory requirements with confidence.",
    features: [
      "MDR & Endpoint Protection",
      "HIPAA / CMMC / SOC 2 Compliance",
      "Zero Trust Architecture",
      "Dark Web Intelligence",
    ],
    accent: "primary",
  },
  {
    id: "ai-automation",
    icon: Bot,
    title: "AI & Automation",
    subtitle: "Future Velocity",
    description: "Leverage intelligent automation to transform your operations.",
    features: [
      "Process Automation (RPA)",
      "Custom AI Agents",
      "Intelligent Document Processing",
      "Workflow Optimization",
    ],
    accent: "accent",
  },
  {
    id: "consulting",
    icon: Lightbulb,
    title: "Strategic Consulting",
    subtitle: "Visionary Leadership",
    description: "Expert guidance to align technology with your business goals.",
    features: [
      "Virtual CISO / CIO",
      "Digital Transformation",
      "M&A Technology Due Diligence",
      "IT Budgeting & Forecasting",
    ],
    accent: "accent",
  },
];

export default function Services() {
  const { openModal } = useContactModal();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Layout>
      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 dot-pattern opacity-30" />
          <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-primary/[0.05] rounded-full blur-[120px]" />
        </div>

        <div className="container relative z-10 px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span className="text-muted-foreground">Our Services</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              Technology solutions that drive your{" "}
              <span className="text-gradient">business forward.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              From day-to-day IT support to AI-powered automation, we deliver the
              expertise you need to stay secure and scale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="h-13 px-7 text-base rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                onClick={openModal}
              >
                Get a Free Assessment
              </Button>
              <Link to="/security-check">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 px-7 text-base rounded-xl border-border/60 bg-white/[0.03] hover:bg-white/[0.06]"
                >
                  Free Security Check
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SERVICE BLOCKS */}
      <section ref={containerRef} className="relative py-24 md:py-36">
        <div className="container px-4 md:px-8">
          <div className="space-y-12 md:space-y-16">
            {serviceCategories.map((service, index) => (
              <ServiceBlock key={service.id} service={service} index={index} />
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
              Not sure where to start?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Our team will assess your current environment and recommend the right solutions.
            </p>
            <Button
              size="lg"
              className="h-14 px-8 text-base rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              onClick={openModal}
            >
              Get a Free Assessment
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}

function ServiceBlock({ service, index }: { service: (typeof serviceCategories)[number]; index: number }) {
  const isAccent = service.accent === "accent";
  const color = isAccent ? "accent" : "primary";

  return (
    <AnimatedSection>
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center rounded-3xl bg-card/50 border border-border/30 p-8 md:p-12 hover:border-border/60 transition-all duration-300">
        <div className={`space-y-6 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${isAccent ? "bg-accent/10" : "bg-primary/10"}`}>
            <service.icon className={`w-7 h-7 ${isAccent ? "text-accent" : "text-primary"}`} />
          </div>

          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.15em] mb-2 ${isAccent ? "text-accent" : "text-primary"}`}>
              {service.subtitle}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {service.title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {service.description}
            </p>
          </div>

          <ul className="space-y-3">
            {service.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-[15px]">
                <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${isAccent ? "text-accent" : "text-primary"}`} />
                {feature}
              </li>
            ))}
          </ul>

          <Button
            variant="outline"
            className={`group rounded-xl px-5 border-border/60 bg-white/[0.03] hover:bg-white/[0.06] transition-all`}
          >
            Learn More
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className={`relative ${index % 2 === 1 ? "lg:order-1" : ""}`}>
          <div className={`absolute inset-0 ${isAccent ? "bg-accent/5" : "bg-primary/5"} blur-3xl rounded-full`} />
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/30 bg-card flex items-center justify-center">
            <service.icon className="w-32 h-32 text-muted-foreground/[0.06]" />
            <div className="absolute bottom-6 left-6 right-6 p-5 bg-white/[0.04] backdrop-blur-md rounded-xl border border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">
                  Active
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 bg-white/10 rounded-full w-3/4" />
                <div className="h-1.5 bg-white/10 rounded-full w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
