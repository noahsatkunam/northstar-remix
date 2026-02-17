import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Facebook, Instagram, ArrowRight, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  { name: "Contact", href: "/about" },
];

export function Footer() {
  const { openModal } = useContactModal();
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-foreground text-background border-t border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 invert pointer-events-none" />
      
      <div className="container px-4 md:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-4 gap-12 lg:gap-24">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-8">
            <Link to="/" className="inline-block">
              <img
                src="/logos/northstar-logo-white.png"
                alt="NorthStar Technology Group"
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Your trusted partner for managed IT services, cybersecurity, compliance, and AI automation.
            </p>
            <div className="flex gap-4">
              <img src={inc5000Badge} alt="Inc 5000" className="h-12 object-contain grayscale opacity-50 hover:opacity-100 transition-opacity" />
              <img src={soc2Badge} alt="SOC 2" className="h-12 object-contain grayscale opacity-50 hover:opacity-100 transition-opacity" />
              <img src={hipaaBadge} alt="HIPAA" className="h-12 object-contain grayscale opacity-50 hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Links Column */}
          <div className="space-y-8">
            <h3 className="text-lg font-bold text-white">Explore</h3>
            <ul className="space-y-4">
              {[...quickLinks, ...resources].map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-400 hover:text-primary transition-colors flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-8">
            <h3 className="text-lg font-bold text-white">Connect</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <a href="tel:+1-866-337-9096" className="hover:text-white transition-colors">866-337-9096</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:info@northstar-tg.com" className="hover:text-white transition-colors">info@northstar-tg.com</a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Fargo, ND</span>
              </li>
            </ul>
            <div className="flex gap-4">
              {[
                { Icon: Linkedin, href: "https://www.linkedin.com/company/northstar-technology-group" },
                { Icon: Twitter, href: "https://x.com/NorthstarTG" },
                { Icon: Facebook, href: "https://www.facebook.com/NorthStarTG" },
                { Icon: Instagram, href: "https://www.instagram.com/northstartechno" },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-gray-400">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} NorthStar Technology Group. All rights reserved.</p>
          <div className="flex gap-8">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
