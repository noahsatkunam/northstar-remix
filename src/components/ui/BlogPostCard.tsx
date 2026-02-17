import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BlogPostCardProps extends React.HTMLAttributes<HTMLElement> {
  /** Image URL (optional - shows placeholder if not provided) */
  image?: string;
  /** Image alt text */
  imageAlt?: string;
  /** Post category */
  category: string;
  /** Post title */
  title: string;
  /** Post excerpt/summary */
  excerpt: string;
  /** Link URL (optional - renders as link when provided) */
  href?: string;
  /** Call-to-action text */
  ctaText?: string;
}

const BlogPostCard = React.forwardRef<HTMLElement, BlogPostCardProps>(
  (
    {
      className,
      image,
      imageAlt,
      category,
      title,
      excerpt,
      href,
      ctaText = "Read more",
      ...props
    },
    ref
  ) => {
    const cardContent = (
      <>
        {/* Image container with zoom effect */}
        <div className="overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={imageAlt || title}
              className="aspect-video w-full object-cover transition-transform duration-DEFAULT group-hover:scale-105"
            />
          ) : (
            <div className="aspect-video w-full bg-muted transition-transform duration-DEFAULT group-hover:scale-105" />
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category badge */}
          <span className="inline-block bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {category}
          </span>

          {/* Title */}
          <h3 className="mt-3 text-lg font-semibold text-card-foreground">
            {title}
          </h3>

          {/* Excerpt */}
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {excerpt}
          </p>

          {/* CTA with animated arrow */}
          <span className="mt-4 inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-primary/80">
            {ctaText}
            <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" />
          </span>
        </div>
      </>
    );

    const cardClasses = cn(
      "group border border-border bg-card transition-all duration-DEFAULT",
      "hover:border-primary hover:shadow-md",
      className
    );

    // Render as link if href is provided
    if (href) {
      return (
        <Link to={href} className="block">
          <article ref={ref as React.Ref<HTMLElement>} className={cardClasses} {...props}>
            {cardContent}
          </article>
        </Link>
      );
    }

    // Render as article without link
    return (
      <article ref={ref as React.Ref<HTMLElement>} className={cardClasses} {...props}>
        {cardContent}
      </article>
    );
  }
);
BlogPostCard.displayName = "BlogPostCard";

export { BlogPostCard };
