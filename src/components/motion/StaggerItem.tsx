import * as React from "react";
import { motion, Variants } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Default item variants for stagger animations.
 * Provides fade-in-up effect matching existing animation patterns.
 */
const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export interface StaggerItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Custom animation variants (optional - uses default item variants if not provided) */
  variants?: Variants;
  /** Animation duration in seconds (default 0.3) */
  duration?: number;
}

const StaggerItem = React.forwardRef<HTMLDivElement, StaggerItemProps>(
  ({
    className,
    children,
    variants,
    duration = 0.3,
    onAnimationStart: _onAnimationStart,
    onAnimationEnd: _onAnimationEnd,
    onAnimationIteration: _onAnimationIteration,
    onDrag: _onDrag,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    ...props
  }, ref) => {
    // Create variants with custom duration if not using custom variants
    const animationVariants = React.useMemo(() => {
      if (variants) return variants;

      return {
        hidden: {
          opacity: 0,
          y: 12
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            ease: [0.25, 0.1, 0.25, 1] as const
          }
        }
      };
    }, [variants, duration]);

    return (
      <motion.div
        ref={ref}
        variants={animationVariants}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerItem.displayName = "StaggerItem";

export { StaggerItem, itemVariants };
