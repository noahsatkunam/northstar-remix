import * as React from "react";
import { motion, Variants } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Default container variants for stagger animations.
 * Coordinates timing of child animations with configurable delays.
 */
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Custom animation variants (optional - uses default container variants if not provided) */
  variants?: Variants;
  /** Delay between each child animation in seconds (default 0.1) */
  staggerChildren?: number;
  /** Delay before starting child animations in seconds (default 0.1) */
  delayChildren?: number;
  /** Viewport amount required to trigger animation (0-1, default 0.2 = 20%) */
  viewportAmount?: number;
  /** Whether animation should only play once (default true) */
  once?: boolean;
}

const StaggerContainer = React.forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({
    className,
    children,
    variants,
    staggerChildren = 0.1,
    delayChildren = 0.1,
    viewportAmount = 0.2,
    once = true,
    onAnimationStart: _onAnimationStart,
    onAnimationEnd: _onAnimationEnd,
    onAnimationIteration: _onAnimationIteration,
    onDrag: _onDrag,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    ...props
  }, ref) => {
    // Create variants with custom stagger timing if not using custom variants
    const animationVariants = React.useMemo(() => {
      if (variants) return variants;

      return {
        hidden: {},
        visible: {
          transition: {
            staggerChildren,
            delayChildren
          }
        }
      };
    }, [variants, staggerChildren, delayChildren]);

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
StaggerContainer.displayName = "StaggerContainer";

export { StaggerContainer, containerVariants };
