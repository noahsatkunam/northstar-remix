import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Shield, FileCheck, Building2, Search, Map, Settings, Activity, CheckCircle2, Award, ChevronDown, Lock, ShieldCheck, BarChart3, Scale, ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useContactModal } from "@/components/ContactModal";
import { motion } from "framer-motion";
import soc2Badge from "@/assets/soc2-badge.webp";
import hipaaBadge from "@/assets/hipaa-badge.png";

const complianceAreas = [
  {
    icon: Shield,
    title: "HIPAA",
    subtitle: "Healthcare",
    description: "Complete PHI protection and risk management for covered entities and business associates.",
    features: ["Risk Assessments", "BAA Management", "Breach Response"]
  },
  {
    icon: FileCheck,
    title: "SOC 2",
    subtitle: "SaaS & Service Providers",
    description: "Demonstrate your commitment to security, availability, and confidentiality.",
    features: ["Gap Analysis", "Control Implementation", "Audit Prep"]
  },
  {
    icon: ShieldCheck,
    title: "CMMC 2.0",
    subtitle: "Defense Contractors",
    description: "Navigate the complexities of DoD compliance requirements (Level 1 & 2).",
    features: ["CUI Protection", "SPR/SPRS Scoring", "Readiness Assessment"]
  },
  {
    icon: Scale,
    title: "FTC Safeguards",
    subtitle: "Financial Institutions",
    description: "Mandatory information security programs for auto dealers and non-bank lenders.",
    features: ["Encryption", "MFA Implementation", "Vendor Oversight"]
  },
  {
    icon: Lock,
    title: "ITAR",
    subtitle: "Aerospace & Defense",
    description: "Strict control over defense-related technical data and services.",
    features: ["Data Classification", "Access Controls", "Export Compliance"]
  },
  {
    icon: BarChart3,
    title: "NIST CSF",
    subtitle: "General Framework",
    description: "The gold standard for voluntary cybersecurity risk management.",
    features: ["Identify", "Protect", "Detect", "Respond", "Recover"]
  }
];

export default function Compliance() {
  const { openModal } = useContactModal();

  return (
    <Layout>
      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-background pt-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        
        <div className="container relative z-10 px-4 md:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Audit-Ready Infrastructure</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8">
              Compliance Without the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Complexity
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10">
              Navigate HIPAA, CMMC, NIST, ITAR, and industry regulations with confidence through our expert-led approach.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 rounded-full text-lg" onClick={openModal}>
                Request a Compliance Assessment
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* COMPLIANCE AREAS */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {complianceAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-3xl bg-background border border-border/50 p-8 hover:shadow-2xl hover:border-primary/30 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                  <area.icon className="w-32 h-32" />
                </div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <area.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  
                  <div className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">{area.subtitle}</div>
                  <h3 className="text-2xl font-bold mb-4">{area.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {area.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {area.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-32 bg-background">
        <div className="container px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Compliance Approach</h2>
            <p className="text-xl text-muted-foreground">
              A proven methodology that takes you from assessment through continuous compliance.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />
            
            {[
              { title: "Assess", desc: "Comprehensive evaluation of current state", icon: Search },
              { title: "Plan", desc: "Prioritized roadmap to compliance", icon: Settings },
              { title: "Implement", desc: "Technical and administrative controls", icon: FileText },
              { title: "Monitor", desc: "Ongoing validation and improvement", icon: Activity }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative text-center group"
              >
                <div className="w-24 h-24 mx-auto bg-background border-4 border-muted rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:border-primary transition-colors duration-300">
                  <step.icon className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-foreground text-background text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 invert" />
        <div className="container relative z-10 px-4 md:px-8">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Concerned About Your Compliance Posture?</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Our team includes certified compliance professionals dedicated to your success.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/90 text-white shadow-2xl hover:scale-105 transition-all"
              onClick={openModal}
            >
              Request a Compliance Assessment
            </Button>
            <Link to="/risk-assessment">
              <Button 
                variant="outline"
                size="lg" 
                className="h-16 px-10 text-xl rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white transition-all"
              >
                Free Risk Assessment
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
