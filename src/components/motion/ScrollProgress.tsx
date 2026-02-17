import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

import { cn } from "@/lib/utils";

export interface ScrollProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Color class for the progress bar (default: bg-primary) */
  color?: string;
  /** Height of the progress bar in pixels or CSS value (default: 3) */
  height?: number | string;
  /** Spring stiffness for smooth animation (default: 100) */
  springStiffness?: number;
  /** Spring damping for smooth animation (default: 30) */
  springDamping?: number;
  /** Z-index for the progress bar (default: 50) */
  zIndex?: number;
}

/**
 * ScrollProgress displays a thin progress bar at the top of the page
 * that indicates how far the user has scrolled down the page.
 *
 * Uses framer-motion's useScroll and useSpring for smooth, performant animations.
 *
 * @example
 * ```tsx
 * // Add to layout or page root
 * <ScrollProgress />
 *
 * // Custom styling
 * <ScrollProgress
 *   color="bg-blue-500"
 *   height={4}
 *   className="opacity-80"
 * />
 * ```
 */
const ScrollProgress = React.forwardRef<HTMLDivElement, ScrollProgressProps>(
  ({
    className,
    color = "bg-primary",
    height = 3,
    springStiffness = 100,
    springDamping = 30,
    zIndex = 50,
    ...props
  }, ref) => {
    // Track scroll progress (0-1)
    const { scrollYProgress } = useScroll();

    // Apply spring physics for smooth animation
    const scaleX = useSpring(scrollYProgress, {
      stiffness: springStiffness,
      damping: springDamping,
      restDelta: 0.001
    });

    const heightValue = typeof height === "number" ? `${height}px` : height;

    return (
      <div
        ref={ref}
        className={cn("fixed top-0 left-0 right-0 pointer-events-none", className)}
        style={{ zIndex }}
        {...props}
      >
        <motion.div
          className={cn("h-full origin-left", color)}
          style={{
            scaleX,
            height: heightValue
          }}
        />
      </div>
    );
  }
);
ScrollProgress.displayName = "ScrollProgress";

export { ScrollProgress };
