import * as React from "react";
import { motion, Variants } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Default animation variants for scroll-triggered fade-in-up effect.
 * Uses 20px translateY and 0.4s duration matching existing animation patterns.
 */
const sectionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export interface AnimatedSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Custom animation variants (optional - uses default fade-in-up if not provided) */
  variants?: Variants;
  /** HTML element to render as (defaults to div) */
  as?: keyof JSX.IntrinsicElements;
  /** Viewport amount required to trigger animation (0-1, default 0.2 = 20%) */
  viewportAmount?: number;
  /** Whether animation should only play once (default true) */
  once?: boolean;
  /** Delay before animation starts in seconds */
  delay?: number;
}

const AnimatedSection = React.forwardRef<HTMLDivElement, AnimatedSectionProps>(
  ({
    className,
    children,
    variants = sectionVariants,
    viewportAmount = 0.2,
    once = true,
    delay,
    onAnimationStart: _onAnimationStart,
    onAnimationEnd: _onAnimationEnd,
    onAnimationIteration: _onAnimationIteration,
    onDrag: _onDrag,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    ...props
  }, ref) => {
    // Create modified variants with delay if specified
    const animationVariants = React.useMemo(() => {
      if (!delay) return variants;

      return {
        ...variants,
        visible: {
          ...(typeof variants.visible === 'object' ? variants.visible : {}),
          transition: {
            ...(typeof variants.visible === 'object' && 'transition' in variants.visible
              ? variants.visible.transition as object
              : { duration: 0.4, ease: "easeOut" }),
            delay
          }
        }
      };
    }, [variants, delay]);

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: viewportAmount }}
        variants={animationVariants}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
AnimatedSection.displayName = "AnimatedSection";

export { AnimatedSection, sectionVariants };
