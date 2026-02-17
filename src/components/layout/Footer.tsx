import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Facebook, Instagram, ArrowRight, Twitter } from "lucide-react";
import { useContactModal } from "@/components/ContactModal";
import inc5000Badge from "@/assets/inc-5000-badge.png";
import soc2Badge from "@/assets/soc2-badge.webp";
import hipaaBadge from "@/assets/hipaa-badge.png";

const quickLinks = [
  { name: "Services", href: "/services" },
  { name: "Compliance", href: "/compliance" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
];

const resources = [
  { name: "Webinars", href: "/webinars" },
  { name: "DMARC Tool", href: "/dmarc-checker" },
  { name: "Security Check", href: "/security-check" },
];

export function Footer() {
  const { openModal } = useContactModal();

  return (
    <footer className="relative border-t border-border/30">
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-background pointer-events-none" />

      <div className="container px-4 md:px-8 py-16 md:py-20 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-block">
              <img
                src="/logos/northstar-logo-white.png"
                alt="NorthStar Technology Group"
                className="h-10 w-auto opacity-90"
              />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Managed IT, cybersecurity, compliance, and AI automation for regulated organizations. Trusted since 2000.
            </p>
            <div className="flex items-center gap-3">
              <img src={inc5000Badge} alt="Inc 5000" className="h-9 object-contain grayscale opacity-30 hover:opacity-60 transition-opacity" />
              <img src={soc2Badge} alt="SOC 2" className="h-9 object-contain grayscale opacity-30 hover:opacity-60 transition-opacity" />
              <img src={hipaaBadge} alt="HIPAA" className="h-9 object-contain grayscale opacity-30 hover:opacity-60 transition-opacity" />
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="tel:+1-866-337-9096"
                  className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary/60" />
                  866-337-9096
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@northstar-tg.com"
                  className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary/60" />
                  info@northstar-tg.com
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary/60" />
                Fargo, ND
              </li>
            </ul>
            <div className="flex gap-2 mt-5">
              {[
                { Icon: Linkedin, href: "https://www.linkedin.com/company/northstar-technology-group" },
                { Icon: Twitter, href: "https://x.com/NorthstarTG" },
                { Icon: Facebook, href: "https://www.facebook.com/NorthStarTG" },
                { Icon: Instagram, href: "https://www.instagram.com/northstartechno" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-border/30 flex items-center justify-center hover:bg-white/[0.08] hover:border-border/60 transition-all text-muted-foreground hover:text-foreground"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground/60">
          <p>&copy; {new Date().getFullYear()} NorthStar Technology Group. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
