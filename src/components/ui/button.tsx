import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

const buttonVariants = tv({
  base: [
    "inline-flex",
    "items-center",
    "justify-center",
    "rounded-medium",
    "text-small",
    "font-medium",
    "transition-all",
    "duration-200",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-focus",
    "focus-visible:ring-offset-2",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    "data-[pressed=true]:scale-[0.97]",
    "data-[focus-visible=true]:outline-none",
    "data-[focus-visible=true]:ring-2",
    "data-[focus-visible=true]:ring-focus",
    "data-[focus-visible=true]:ring-offset-2",
  ],
  variants: {
    variant: {
      default: [
        "bg-primary",
        "text-primary-foreground",
        "hover:bg-primary/90",
        "data-[hover=true]:bg-primary/90",
      ],
      destructive: [
        "bg-danger",
        "text-danger-foreground",
        "hover:bg-danger/90",
        "data-[hover=true]:bg-danger/90",
      ],
      outline: [
        "border",
        "border-default-300",
        "bg-transparent",
        "hover:bg-default-100",
        "data-[hover=true]:bg-default-100",
      ],
      secondary: [
        "bg-secondary",
        "text-secondary-foreground",
        "hover:bg-secondary/80",
        "data-[hover=true]:bg-secondary/80",
      ],
      ghost: [
        "hover:bg-default-100",
        "data-[hover=true]:bg-default-100",
      ],
      link: [
        "text-primary",
        "underline-offset-4",
        "hover:underline",
        "data-[hover=true]:underline",
      ],
      flat: [
        "bg-default-100",
        "text-default-foreground",
        "hover:bg-default-200",
        "data-[hover=true]:bg-default-200",
      ],
      bordered: [
        "border-2",
        "border-default-200",
        "bg-transparent",
        "hover:bg-default-100",
        "data-[hover=true]:bg-default-100",
      ],
      light: [
        "bg-transparent",
        "text-primary",
        "hover:bg-primary/10",
        "data-[hover=true]:bg-primary/10",
      ],
    },
    size: {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-8",
      icon: "h-10 w-10",
    },
    color: {
      default: "",
      primary: "",
      secondary: "",
      success: [
        "bg-success",
        "text-success-foreground",
        "hover:bg-success/90",
        "data-[hover=true]:bg-success/90",
      ],
      warning: [
        "bg-warning",
        "text-warning-foreground",
        "hover:bg-warning/90",
        "data-[hover=true]:bg-warning/90",
      ],
      danger: [
        "bg-danger",
        "text-danger-foreground",
        "hover:bg-danger/90",
        "data-[hover=true]:bg-danger/90",
      ],
    },
    radius: {
      none: "rounded-none",
      sm: "rounded-small",
      md: "rounded-medium",
      lg: "rounded-large",
      full: "rounded-full",
    },
    fullWidth: {
      true: "w-full",
    },
    isLoading: {
      true: "cursor-not-allowed",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
    color: "default",
    radius: "md",
  },
  compoundVariants: [
    {
      variant: "default",
      color: "primary",
      class: [
        "bg-primary",
        "text-primary-foreground",
        "hover:bg-primary/90",
        "data-[hover=true]:bg-primary/90",
      ],
    },
    {
      variant: "default",
      color: "secondary",
      class: [
        "bg-secondary",
        "text-secondary-foreground",
        "hover:bg-secondary/90",
        "data-[hover=true]:bg-secondary/90",
      ],
    },
    {
      variant: "outline",
      color: "primary",
      class: [
        "border-primary",
        "text-primary",
        "hover:bg-primary/10",
        "data-[hover=true]:bg-primary/10",
      ],
    },
    {
      variant: "ghost",
      color: "primary",
      class: [
        "text-primary",
        "hover:bg-primary/10",
        "data-[hover=true]:bg-primary/10",
      ],
    },
  ],
});

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      color,
      radius,
      fullWidth,
      isLoading,
      startContent,
      endContent,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          buttonVariants({
            variant,
            size,
            color,
            radius,
            fullWidth,
            isLoading,
          }),
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {startContent && !isLoading && (
          <span className="mr-2">{startContent}</span>
        )}
        {children}
        {endContent && <span className="ml-2">{endContent}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };