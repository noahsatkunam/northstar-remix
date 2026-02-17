import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Users, Lightbulb, Handshake, ArrowUpRight } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import { AnimatedSection } from "@/components/motion/AnimatedSection";
import { CountUp } from "@/components/motion/CountUp";
import { motion } from "framer-motion";
import inc5000Badge from "@/assets/inc-5000-badge.png";
import soc2Badge from "@/assets/soc2-badge.webp";
import hipaaBadge from "@/assets/hipaa-badge.png";

const stats = [
  { label: "Years of Excellence", value: 25, suffix: "+" },
  { label: "Clients Protected", value: 200, suffix: "+" },
  { label: "Inc. 5000 Rankings", value: 2, suffix: "x" },
  { label: "Compliance Audits Passed", value: 100, suffix: "%" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Reliability",
    description: "We do what we say, every time.",
  },
  {
    icon: Users,
    title: "Expertise",
    description: "Deep technical knowledge across industries.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Always exploring better solutions.",
  },
  {
    icon: Handshake,
    title: "Partnership",
    description: "Your success is our success.",
  },
];

const teamMembers = [
  {
    name: "Ken Satkunam",
    title: "Co-Founder & CEO",
    bio: "CISM-certified leader with 25+ years in IT. Co-founded NorthStar in 2000 and has served organizations of up to 23,000 employees. HCCA speaker and Amazon Best-Selling co-author of \"Cyber Attack Prevention.\"",
    image: "/team/ken-satkunam.jpg",
  },
];

export default function About() {
  const { openModal } = useContactModal();

  return (
    <Layout>
      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 dot-pattern opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[50vw] bg-primary/[0.06] rounded-full blur-[120px]" />
        </div>

        <div className="container relative z-10 px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight mb-8">
              Your technology partner for the{" "}
              <span className="text-gradient">long haul.</span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Building trusted relationships through reliable IT solutions since 2000.
            </p>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 border-y border-border/30">
        <div className="container px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/30 rounded-2xl overflow-hidden border border-border/30">
            {stats.map((stat, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="bg-background/80 p-6 md:p-8 text-center">
                  <div className="text-3xl md:text-5xl font-bold text-foreground mb-1">
                    <CountUp end={stat.value} duration={2} />
                    <span className="text-primary">{stat.suffix}</span>
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {stat.label}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="py-24 md:py-36">
        <div className="container px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <AnimatedSection>
              <div className="space-y-6">
                <p className="text-sm font-semibold text-accent uppercase tracking-[0.2em]">
                  Our Story
                </p>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                  From a small team to an award-winning MSP.
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    NorthStar Technology Group was co-founded in 2000 by Ken Satkunam with a simple mission: to provide businesses with the same caliber of IT support that large enterprises enjoy, but with the personalized attention and responsiveness that only a dedicated partner can deliver.
                  </p>
                  <p>
                    Over 25 years, what started as a small team helping local businesses has grown into a comprehensive managed services provider serving clients across healthcare, financial services, manufacturing, and professional services. NorthStar expanded through the acquisition of eWranglers in 2022 and SmartFirm IT in 2023, and has been recognized as a back-to-back Inc. 5000 honoree (#3837 in 2024 and #2393 in 2025) with 178% three-year growth.
                  </p>
                  <p>
                    Today, we combine deep technical expertise with a genuine understanding of business operations. We don't just fix problems; we anticipate them. We don't just implement solutions; we ensure they align with your goals.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <img src={inc5000Badge} alt="Inc 5000" className="h-12 object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all" />
                  <img src={soc2Badge} alt="SOC 2" className="h-12 object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all" />
                  <img src={hipaaBadge} alt="HIPAA" className="h-12 object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all" />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border/50">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                    alt="Team collaboration"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 md:py-36 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
        <div className="container px-4 md:px-8 relative z-10">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-4">
                Values
              </p>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">What drives us.</h2>
              <p className="text-lg text-muted-foreground">
                The principles that guide every decision we make.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-5">
            {values.map((value, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="group p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="py-24 md:py-36">
        <div className="container px-4 md:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-accent uppercase tracking-[0.2em] mb-4">
                Leadership
              </p>
              <h2 className="text-3xl md:text-5xl font-bold">Meet the team.</h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50">
                  <div className="aspect-[4/5] overflow-hidden">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 grayscale group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-card text-3xl font-bold text-muted-foreground/30">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                    <p className="text-primary text-sm font-medium mb-3">{member.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED IN */}
      <section className="py-24 md:py-36 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
        <div className="container px-4 md:px-8 relative z-10">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-sm font-semibold text-primary uppercase tracking-[0.2em] mb-4">
                Recognition
              </p>
              <h2 className="text-3xl md:text-5xl font-bold">Featured in.</h2>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
            {[
              { label: "Faces of Fargo 2023", url: "https://facesoffargo.com/meet-the-face-of-it-cyber-security-northstar-technology-group/" },
              { label: "Faces of Fargo 2024", url: "https://facesoffargo.com/face-of-it-and-cyber-security-northstar-technology-group/" },
              { label: "BisMan Inc.", url: "https://bismaninc.com/how-to-survive-cybersecurity-threats-with-ken-satkunam-and-dan-defay/" },
              { label: "Fargo INC!", url: "https://fargoinc.com/northstar-technology-group-is-your-business-pitstop-for-growth-and-security/" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-border/50 bg-card p-5 hover:border-primary/30 transition-all duration-300"
              >
                <span className="font-semibold">{item.label}</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>

          <AnimatedSection>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h3 className="text-xl font-bold mb-2">Amazon Best-Selling Book</h3>
              <p className="text-muted-foreground mb-4">
                Our team co-authored "Cyber Attack Prevention," covering IT department and third-party security strategies.
              </p>
              <a
                href="https://www.amazon.com/Cyber-Attack-Prevention-Department-Third-Party-ebook/dp/B0C79TXWFK"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary font-semibold hover:underline gap-1"
              >
                View on Amazon
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </AnimatedSection>

          <div className="text-center text-sm text-muted-foreground">
            <p>Proud NDLTCA Associate Member, FMWF Chamber member, and HCCA presenter.</p>
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
              Want to learn more?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Let's talk about how we can help your organization.
            </p>
            <Button
              size="lg"
              className="h-14 px-8 text-base rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              onClick={openModal}
            >
              Get in Touch
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
