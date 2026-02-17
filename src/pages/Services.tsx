import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Server, Shield, Bot, Lightbulb, CheckCircle2, ArrowRight, ChevronRight, Cpu, Globe, Zap } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";

const serviceCategories = [
  {
    id: "managed-it",
    icon: Server,
    title: "Managed IT Services",
    subtitle: "Operational Excellence",
    description: "Comprehensive IT support that keeps your business running smoothly",
    features: [
      "24/7 Proactive Monitoring",
      "Strategic Vendor Management",
      "Cloud Infrastructure (Azure/AWS)",
      "Disaster Recovery Planning"
    ],
    color: "from-blue-500 to-cyan-400"
  },
  {
    id: "cybersecurity",
    icon: Shield,
    title: "Cybersecurity & Compliance",
    subtitle: "Unshakeable Defense",
    description: "Protect your business and meet regulatory requirements with confidence",
    features: [
      "MDR & Endpoint Protection",
      "HIPAA / CMMC / SOC 2 Compliance",
      "Zero Trust Architecture",
      "Dark Web Intelligence"
    ],
    color: "from-indigo-500 to-purple-500"
  },
  {
    id: "ai-automation",
    icon: Bot,
    title: "AI & Automation",
    subtitle: "Future Velocity",
    description: "Leverage intelligent automation to transform your operations",
    features: [
      "Process Automation (RPA)",
      "Custom AI Agents",
      "Intelligent Document Processing",
      "Workflow Optimization"
    ],
    color: "from-emerald-500 to-teal-400"
  },
  {
    id: "consulting",
    icon: Lightbulb,
    title: "Strategic Consulting",
    subtitle: "Visionary Leadership",
    description: "Expert guidance to align technology with your business goals",
    features: [
      "Virtual CISO / CIO",
      "Digital Transformation",
      "M&A Technology Due Diligence",
      "IT Budgeting & Forecasting"
    ],
    color: "from-orange-500 to-amber-400"
  }
];

export default function Services() {
  const { openModal } = useContactModal();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <Layout>
      {/* HERO */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-background pt-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
        
        <div className="container relative z-10 px-4 md:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6 border border-accent/20">
              <Zap className="w-4 h-4" />
              <span>Our Services</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8">
              Technology Solutions That Drive Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-accent">
                Business Forward
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              From day-to-day IT support to AI-powered automation, we deliver the expertise you need.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 rounded-full text-lg" onClick={openModal}>
                Get a Free Assessment
              </Button>
              <Link to="/risk-assessment">
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg">
                  Free Assessment
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STICKY SCROLL SECTION */}
      <section ref={containerRef} className="relative bg-background py-20">
        <div className="container px-4 md:px-8">
          {serviceCategories.map((service, index) => (
            <ServiceBlock key={service.id} service={service} index={index} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 invert" />
        <div className="container relative z-10 px-4 md:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
            Not Sure Where to Start?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Our team will assess your current environment and recommend the right solutions.
          </p>
          <Button 
            size="lg" 
            className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/90 text-white shadow-2xl hover:scale-105 transition-all"
            onClick={openModal}
          >
            Get a Free Assessment
          </Button>
        </div>
      </section>
    </Layout>
  );
}

function ServiceBlock({ service, index }: { service: any, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="min-h-screen flex items-center justify-center py-20 sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/10 last:border-0"
    >
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center w-full">
        <div className="order-2 lg:order-1 space-y-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} text-white shadow-lg`}>
            <service.icon className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${service.color} mb-2 uppercase tracking-wider`}>
              {service.subtitle}
            </h3>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              {service.title}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {service.description}
            </p>
          </div>

          <ul className="space-y-4">
            {service.features.map((feature: string, i: number) => (
              <li key={i} className="flex items-center gap-4 text-lg font-medium">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center text-white text-xs`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          <Button variant="outline" className="group h-12 px-6 rounded-full text-lg hover:bg-primary hover:text-white transition-all">
            Learn More <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="order-1 lg:order-2 relative">
          <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-10 blur-3xl rounded-full`} />
          <div className="relative aspect-square rounded-[2rem] overflow-hidden border border-border/50 bg-card shadow-2xl group hover:scale-[1.02] transition-transform duration-500">
             <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-10" />
             {/* Abstract Visual Representation */}
             <div className="absolute inset-0 flex items-center justify-center">
                <service.icon className={`w-48 h-48 text-muted-foreground/10 group-hover:text-primary/20 transition-colors duration-500`} />
             </div>
             
             {/* Decorative UI Elements */}
             <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 z-20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">STATUS: ACTIVE</div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-white/20 rounded-full w-3/4" />
                  <div className="h-2 bg-white/20 rounded-full w-1/2" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
