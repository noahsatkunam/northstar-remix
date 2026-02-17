import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Award, Handshake, Lightbulb, Users, Globe, ShieldCheck, Trophy } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import { motion } from "framer-motion";
import inc5000Badge from "@/assets/inc-5000-badge.png";
import soc2Badge from "@/assets/soc2-badge.webp";
import hipaaBadge from "@/assets/hipaa-badge.png";

const stats = [
  { label: "Years of Excellence", value: "25+" },
  { label: "Clients Protected", value: "200+" },
  { label: "Inc. 5000 Rankings", value: "2x" },
  { label: "Compliance Audits Passed", value: "100%" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Reliability",
    description: "We do what we say, every time"
  },
  {
    icon: Users,
    title: "Expertise",
    description: "Deep technical knowledge across industries"
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Always exploring better solutions"
  },
  {
    icon: Handshake,
    title: "Partnership",
    description: "Your success is our success"
  }
];

const teamMembers = [
  {
    name: "Ken Satkunam",
    title: "Co-Founder & CEO",
    bio: "CISM-certified leader with 25+ years in IT. Co-founded NorthStar in 2000 and has served organizations of up to 23,000 employees. HCCA speaker and Amazon Best-Selling co-author of \"Cyber Attack Prevention.\"",
    image: "/team/ken-satkunam.jpg"
  },
];

export default function About() {
  const { openModal } = useContactModal();

  return (
    <Layout>
      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-foreground text-background">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 invert" />
        <div className="container relative z-10 px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter mb-8 text-white">
              Your Technology Partner for the <span className="text-primary">Long Haul</span>
            </h1>
            <p className="text-xl md:text-3xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
              Building trusted relationships through reliable IT solutions since 2000
            </p>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-background border-b border-border/50">
        <div className="container px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-6xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="py-32 bg-muted/20">
        <div className="container px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  NorthStar Technology Group was co-founded in 2000 by Ken Satkunam with a simple mission: to provide businesses with the same caliber of IT support that large enterprises enjoy, but with the personalized attention and responsiveness that only a dedicated partner can deliver.
                </p>
                <p>
                  Over 25 years, what started as a small team helping local businesses has grown into a comprehensive managed services provider serving clients across healthcare, financial services, manufacturing, and professional services. NorthStar expanded through the acquisition of eWranglers in 2022 and SmartFirm IT in 2023, and has been recognized as a back-to-back Inc. 5000 honoree (#3837 in 2024 and #2393 in 2025) with 178% three-year growth.
                </p>
                <p>
                  Today, we combine deep technical expertise with a genuine understanding of business operations. We don't just fix problems; we anticipate them. We don't just implement solutions; we ensure they align with your goals. And we don't just provide support; we become an extension of your team.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <img src={inc5000Badge} alt="Inc 5000" className="h-16 object-contain grayscale hover:grayscale-0 transition-all" />
                <img src={soc2Badge} alt="SOC 2" className="h-16 object-contain grayscale hover:grayscale-0 transition-all" />
                <img src={hipaaBadge} alt="HIPAA" className="h-16 object-contain grayscale hover:grayscale-0 transition-all" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-20 blur-3xl rounded-full" />
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-card border border-border/50 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
                  alt="Team collaboration" 
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-32 bg-background">
        <div className="container px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">What Drives Us</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide every decision we make.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-10 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <value.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="py-32 bg-muted/30">
        <div className="container px-4 md:px-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">Leadership Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="group relative overflow-hidden rounded-3xl bg-background border border-border/50">
                <div className="aspect-[4/5] overflow-hidden">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 grayscale group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-4xl font-bold text-gray-400">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-4">{member.title}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured In / Press */}
      <section className="py-32 bg-background">
        <div className="container px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Featured In</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
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
                className="block rounded-3xl border border-border/50 bg-card p-6 text-center hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <span className="text-lg font-bold text-foreground">{item.label}</span>
              </a>
            ))}
          </div>

          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-3">Amazon Best-Selling Book</h3>
            <p className="text-muted-foreground text-lg mb-4">
              Our team co-authored "Cyber Attack Prevention," covering IT department and third-party security strategies.
            </p>
            <a
              href="https://www.amazon.com/Cyber-Attack-Prevention-Department-Third-Party-ebook/dp/B0C79TXWFK"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary font-semibold text-lg hover:underline"
            >
              View on Amazon →
            </a>
          </div>

          <div className="text-center text-muted-foreground">
            <p>Proud NDLTCA Associate Member, FMWF Chamber member, and HCCA presenter.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-foreground text-background text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 invert" />
        <div className="container relative z-10 px-4 md:px-8">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Want to Learn More?</h2>
          <Button 
            size="lg" 
            className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/90 text-white shadow-2xl hover:scale-105 transition-all"
            onClick={openModal}
          >
            Get in Touch
          </Button>
        </div>
      </section>
    </Layout>
  );
}
