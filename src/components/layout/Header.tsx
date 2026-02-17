import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight, Shield } from "lucide-react";
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
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled ? "py-2" : "py-4"
        )}
      >
        <div className={cn(
          "container mx-auto px-4 transition-all duration-500",
          isScrolled ? "max-w-6xl" : ""
        )}>
          <div className={cn(
            "flex items-center justify-between px-5 py-2.5 transition-all duration-500",
            isScrolled
              ? "rounded-2xl bg-background/70 backdrop-blur-2xl border border-border/50 shadow-xl shadow-black/10"
              : "bg-transparent"
          )}>
            <Link to="/" className="flex items-center group relative z-50">
              <img
                src="/logos/northstar-logo-white.png"
                alt="NorthStar Technology Group"
                className="h-10 w-auto transition-all duration-300 group-hover:opacity-80"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "relative px-3.5 py-2 text-[13px] font-medium tracking-wide transition-all duration-200 rounded-lg",
                    item.isTool
                      ? "text-accent hover:text-accent/80 flex items-center gap-1.5"
                      : isActive(item.href)
                        ? "text-foreground bg-white/[0.06]"
                        : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.isTool && <Shield className="w-3 h-3" />}
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button
                onClick={openModal}
                className="hidden lg:flex h-9 rounded-lg px-5 text-[13px] font-semibold bg-primary hover:bg-primary/90 text-white transition-all duration-200"
              >
                Contact Us
              </Button>

              <button
                className="lg:hidden relative z-50 p-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-3xl flex flex-col justify-center px-8"
          >
            <nav className="flex flex-col gap-2">
              {navigation.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "text-3xl sm:text-4xl font-bold tracking-tight transition-colors flex items-center justify-between group py-3",
                      isActive(item.href) ? "text-primary" : "text-foreground hover:text-primary"
                    )}
                  >
                    {item.name}
                    <ChevronRight className="w-6 h-6 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 pt-8 border-t border-border"
              >
                <Button
                  size="lg"
                  className="w-full text-lg h-14 rounded-xl bg-primary hover:bg-primary/90"
                  onClick={() => { setMobileMenuOpen(false); openModal(); }}
                >
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
