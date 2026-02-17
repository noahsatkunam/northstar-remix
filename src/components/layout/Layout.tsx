import { ReactNode, useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { X } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface BannerSettings {
  enabled: boolean;
  text: string;
  link: string;
  style: string;
}

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [banner, setBanner] = useState<BannerSettings | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem("site_settings_cache");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setBanner(parsed.banner);
        return;
      } catch {}
    }
    fetch(`${API}/api/settings`)
      .then(r => r.json())
      .then(data => {
        sessionStorage.setItem("site_settings_cache", JSON.stringify(data));
        setBanner(data.banner);
      })
      .catch(() => setBanner({ enabled: false, text: "", link: "", style: "gradient" }));
  }, []);

  const showBanner = banner?.enabled && !bannerDismissed;

  return (
    <div className="flex min-h-screen flex-col">
      {showBanner && (
        <div className="relative z-50 flex items-center justify-center gap-2 bg-gradient-to-r from-primary via-primary/90 to-accent px-4 py-2.5 text-sm font-medium text-white">
          <a href={banner.link || "/webinars"} className="hover:underline">
            {banner.text}
          </a>
          <button
            onClick={() => setBannerDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-white/20 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <ScrollProgress />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
