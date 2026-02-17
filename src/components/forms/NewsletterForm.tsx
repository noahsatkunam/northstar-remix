import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { submitNewsletterSignup } from "@/services/ghl";

interface NewsletterFormProps {
  source?: string;
  placeholder?: string;
  buttonText?: string;
  className?: string;
}

export function NewsletterForm({ 
  source = "website-newsletter",
  placeholder = "Enter your email",
  buttonText = "Subscribe",
  className = ""
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setStatus("idle");

    try {
      const success = await submitNewsletterSignup({
        email: email.trim(),
        source,
      });

      if (success) {
        setStatus("success");
        setEmail("");
        // Reset success message after 5 seconds
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        throw new Error("Submission failed");
      }
    } catch (err) {
      console.error("Newsletter signup error:", err);
      setStatus("error");
      setError("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      {status === "success" ? (
        <div className="flex items-center gap-2 rounded-lg border border-secondary/50 bg-secondary/10 p-3 text-sm text-secondary">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>Thanks for subscribing! Check your email.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder={placeholder}
              disabled={isSubmitting}
              className={error ? "border-destructive" : ""}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                buttonText
              )}
            </Button>
          </div>
          {error && (
            <div className="flex items-start gap-2 text-xs text-destructive">
              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {status === "error" && !error && (
            <div className="flex items-start gap-2 text-xs text-destructive">
              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
              <span>Failed to subscribe. Please try again.</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
