import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        shimmer: "animate-shimmer bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50",
        glow: "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,102,204,0.5)] hover:shadow-[0_0_30px_rgba(0,102,204,0.7)] transition-shadow duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    // Radix Slot (used by `asChild`) calls React.Children.only(children).
    // That means it MUST receive exactly one React element as its child.
    // Even `{false && <X />}` counts as an extra child node, so we must render
    // a different tree when `asChild` is enabled.

    // In real-world JSX, you can accidentally introduce extra children like
    // whitespace-only text nodes. Radix Slot can't handle that.
    const normalizedChildren = React.Children.toArray(children).filter((child) => {
      if (child === null || child === undefined) return false;
      if (typeof child === "string") return child.trim().length > 0;
      return true;
    });

    if (asChild) {
      const onlyChild = normalizedChildren[0];
      const isSingleElementChild =
        normalizedChildren.length === 1 && React.isValidElement(onlyChild);

      // If we don't have exactly one element child, fall back to a normal button
      // rather than crashing the whole app.
      if (!isSingleElementChild) {
        return (
          <button
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            disabled={disabled || isLoading}
            {...props}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : null}
            {children}
          </button>
        );
      }

      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          // Slot's ref type depends on the underlying child element.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={ref as any}
          {...props}
        >
          {onlyChild}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="animate-spin" /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
