import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Wrench, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContactModal } from "@/components/ContactModal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "Home", href: "/", isTool: false },
  { name: "Services", href: "/services", isTool: false },
  { name: "Compliance", href: "/compliance", isTool: false },
  { name: "About", href: "/about", isTool: false },
  { name: "Blog", href: "/blog", isTool: false },
  { name: "Webinars", href: "/webinars", isTool: false },
  { name: "Security Check", href: "/security-check", isTool: true },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { openModal } = useContactModal();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "py-2" : "py-3"
        )}
      >
        <div className={cn(
          "container mx-auto px-4 transition-all duration-300",
          isScrolled ? "max-w-6xl" : ""
        )}>
          <div className={cn(
            "flex items-center justify-between rounded-full px-6 py-3 transition-all duration-300",
            isScrolled 
              ? "bg-background/80 backdrop-blur-xl border border-border/50 shadow-lg" 
              : "bg-transparent"
          )}>
            {/* Logo */}
            <Link to="/" className="flex items-center group relative z-50">
              <img
                src="/logos/northstar-logo.png"
                alt="NorthStar Technology Group"
                className="h-14 w-auto transition-all duration-300 group-hover:scale-[1.03]"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                    item.isTool 
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : isActive(item.href)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {item.isTool && <Wrench className="w-3 h-3" />}
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>

            {/* CTA & Mobile Toggle */}
            <div className="flex items-center gap-4">
              <Button 
                onClick={openModal}
                className={cn(
                  "hidden lg:flex rounded-full px-6 shadow-lg hover:shadow-primary/25 transition-all hover:scale-105",
                  isScrolled ? "bg-primary text-white" : "bg-primary text-white"
                )}
              >
                Contact Us
              </Button>

              <button
                className="lg:hidden relative z-50 p-2 text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-3xl flex flex-col justify-center px-8"
          >
            <nav className="flex flex-col gap-6">
              {navigation.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={item.href}
                    className="text-4xl font-bold tracking-tight text-foreground hover:text-primary transition-colors flex items-center justify-between group"
                  >
                    {item.name}
                    <ChevronRight className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <Button size="lg" className="w-full text-xl h-16 rounded-2xl" onClick={openModal}>
                  Contact Us
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
