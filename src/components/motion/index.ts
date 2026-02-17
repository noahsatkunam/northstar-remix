/**
 * Motion Components - Barrel Export
 *
 * Reusable animation wrapper components for scroll-triggered effects
 * using framer-motion. All components respect prefers-reduced-motion.
 *
 * @example
 * import { AnimatedSection, StaggerContainer, StaggerItem, ScrollProgress } from "@/components/motion";
 */

// AnimatedSection - Scroll-triggered fade-in wrapper
export {
  AnimatedSection,
  sectionVariants,
  type AnimatedSectionProps,
} from "./AnimatedSection";

// StaggerContainer - Container for staggered child animations
export {
  StaggerContainer,
  containerVariants,
  type StaggerContainerProps,
} from "./StaggerContainer";

// StaggerItem - Individual staggered item wrapper
export {
  StaggerItem,
  itemVariants,
  type StaggerItemProps,
} from "./StaggerItem";

// ScrollProgress - Optional scroll progress indicator
export {
  ScrollProgress,
  type ScrollProgressProps,
} from "./ScrollProgress";

// CountUp - Scroll-triggered count-up animation
export { CountUp } from "./CountUp";
