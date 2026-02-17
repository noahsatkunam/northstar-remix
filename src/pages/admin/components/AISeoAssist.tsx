import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Check, CheckCheck, X } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface SeoSuggestions {
  title?: string;
  slug?: string;
  excerpt?: string;
  metaDescription?: string;
  tags?: string[];
  category?: string;
  ogImageAlt?: string;
  _mock?: boolean;
  _fallback?: boolean;
}

interface FieldApplier {
  title?: (v: string) => void;
  slug?: (v: string) => void;
  excerpt?: (v: string) => void;
  metaDescription?: (v: string) => void;
  tags?: (v: string[]) => void;
  category?: (v: string) => void;
}

interface AISeoAssistProps {
  title: string;
  content: string;
  type: "blog" | "webinar";
  currentValues: {
    title?: string;
    slug?: string;
    excerpt?: string;
    metaDescription?: string;
    tags?: string[];
    category?: string;
  };
  onApply: FieldApplier;
}

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  slug: "Slug",
  excerpt: "Excerpt",
  metaDescription: "Meta Description",
  tags: "Tags",
  category: "Category",
  ogImageAlt: "OG Image Alt",
};

export default function AISeoAssist({ title, content, type, currentValues, onApply }: AISeoAssistProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SeoSuggestions | null>(null);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState<Set<string>>(new Set());

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setSuggestions(null);
    setApplied(new Set());
    try {
      const res = await fetch(`${API}/api/ai/seo-assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, type }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setError(err.error || "Failed to get suggestions");
        return;
      }
      setSuggestions(await res.json());
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const applyField = (field: string, value: any) => {
    const fn = (onApply as any)[field];
    if (fn) {
      fn(value);
      setApplied(prev => new Set([...prev, field]));
    }
  };

  const applyAll = () => {
    if (!suggestions) return;
    const fields = ["title", "slug", "excerpt", "metaDescription", "tags", "category"] as const;
    for (const f of fields) {
      if (suggestions[f] !== undefined && (onApply as any)[f]) {
        (onApply as any)[f](suggestions[f]);
      }
    }
    setApplied(new Set(fields));
  };

  const contentTooShort = !content || content.replace(/<[^>]*>/g, "").trim().length < 30;

  return (
    <div className="border rounded-lg p-4 bg-background space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">AI SEO Assist</h3>
      </div>

      {!suggestions && (
        <Button
          onClick={handleAnalyze}
          disabled={loading || contentTooShort}
          variant="outline"
          size="sm"
          className="w-full gap-2"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkles className="h-4 w-4" /> ✨ AI SEO Assist</>
          )}
        </Button>
      )}

      {contentTooShort && !suggestions && !loading && (
        <p className="text-xs text-muted-foreground">Add some content first so AI can analyze it.</p>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {suggestions && (
        <div className="space-y-3">
          {suggestions._mock && (
            <p className="text-xs text-amber-500">Using smart analysis (no AI configured)</p>
          )}

          {(["title", "slug", "excerpt", "metaDescription", "tags", "category"] as const).map(field => {
            const value = suggestions[field];
            if (value === undefined) return null;
            const current = currentValues[field];
            const displayValue = Array.isArray(value) ? value.join(", ") : value;
            const displayCurrent = Array.isArray(current) ? current.join(", ") : current;
            const hasApplier = !!(onApply as any)[field];
            const isApplied = applied.has(field);
            const isDifferent = JSON.stringify(current) !== JSON.stringify(value);

            return (
              <div key={field} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{FIELD_LABELS[field]}</span>
                  {hasApplier && isDifferent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 text-xs px-2 gap-1 ${isApplied ? "text-green-600" : ""}`}
                      onClick={() => applyField(field, value)}
                      disabled={isApplied}
                    >
                      {isApplied ? <><Check className="h-3 w-3" /> Applied</> : "Apply"}
                    </Button>
                  )}
                </div>
                {displayCurrent && isDifferent && (
                  <p className="text-xs text-muted-foreground line-through">{String(displayCurrent).slice(0, 100)}</p>
                )}
                <p className="text-sm bg-muted/50 rounded px-2 py-1">{String(displayValue)}</p>
              </div>
            );
          })}

          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="default" className="flex-1 gap-1" onClick={applyAll}>
              <CheckCheck className="h-3 w-3" /> Apply All
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setSuggestions(null); setApplied(new Set()); }}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
