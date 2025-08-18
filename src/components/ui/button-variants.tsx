import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-all duration-300 border-0",
      secondary: "bg-gradient-secondary text-secondary-foreground shadow-glow hover:shadow-lg transition-all duration-300 border-0", 
      ghost: "bg-transparent text-foreground hover:bg-muted transition-colors duration-200"
    };

    const sizes = {
      sm: "h-9 px-3 text-sm rounded-md",
      md: "h-12 px-6 text-base rounded-lg",
      lg: "h-14 px-8 text-lg rounded-xl"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GradientButton.displayName = "GradientButton";