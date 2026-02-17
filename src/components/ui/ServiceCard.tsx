import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Service title */
  title: string;
  /** Service description */
  description: string;
  /** Link URL (optional - renders link when provided) */
  href?: string;
  /** Call-to-action text */
  ctaText?: string;
}

const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  ({ className, icon: Icon, title, description, href, ctaText = "Learn more", ...props }, ref) => {
    const ctaContent = (
      <span className="mt-4 inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80">
        {ctaText}
        <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" />
      </span>
    );

    return (
      <div
        ref={ref}
        className={cn(
          "group border border-border bg-card p-6 shadow-sm transition-all duration-DEFAULT rounded-xl",
          "hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg",
          className
        )}
        {...props}
      >
        <div className="flex h-12 w-12 items-center justify-center bg-primary/10 transition-transform duration-fast group-hover:scale-110">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-card-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
        {href ? (
          <Link to={href}>
            {ctaContent}
          </Link>
        ) : (
          ctaContent
        )}
      </div>
    );
  }
);
ServiceCard.displayName = "ServiceCard";

export { ServiceCard };
