import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Loader2, ChevronDown } from "lucide-react";

const TERMAGEDDON_URL =
  "https://app.termageddon.com/api/policy/ZEZoWWMxWlBOVmhSWTIxNmJFRTlQUT09?email-links=true&h-align=left&no-title=true&table-style=accordion";

export default function PrivacyPolicy() {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(TERMAGEDDON_URL)
      .then((res) => res.text())
      .then((text) => setHtml(text))
      .catch(() => setError(true));
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient-bg py-20 md:py-24">
        <div className="absolute inset-0 grain-texture opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-gradient-shift bg-[length:200%_200%]" aria-hidden="true" />
        <div className="container relative z-10 mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl animate-fade-in-up" style={{ animationDelay: "0ms", animationFillMode: "both" }}>
              Privacy Policy
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300 animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
              How we collect, use, and protect your information.
            </p>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-subtle opacity-50">
          <ChevronDown className="h-8 w-8 text-white" />
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {html ? (
              <div
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-foreground
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-h4:text-base prose-h4:font-semibold prose-h4:mt-6 prose-h4:mb-2
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-li:text-muted-foreground
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-table:border-border prose-td:border-border prose-th:border-border"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Unable to load the privacy policy at this time.</p>
                <a
                  href={TERMAGEDDON_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View Privacy Policy →
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
