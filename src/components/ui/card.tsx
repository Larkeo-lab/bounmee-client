"use client";

import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

const cardVariants = tv({
  slots: {
    base: [
      "bg-content1",
      "border-small",
      "border-divider",
      "rounded-large",
      "shadow-small",
      "p-4",
      "transition-all",
      "duration-200",
    ],
    header: [
      "flex",
      "items-center",
      "justify-between",
      "pb-3",
      "border-b",
      "border-divider",
      "mb-4",
    ],
    body: [
      "text-small",
      "text-default-600",
    ],
    footer: [
      "flex",
      "items-center",
      "justify-between",
      "pt-3",
      "border-t",
      "border-divider",
      "mt-4",
    ],
  },
  variants: {
    variant: {
      default: {},
      bordered: {
        base: "border-2 border-default-200",
      },
      shadow: {
        base: "shadow-medium",
      },
      flat: {
        base: "bg-default-100 shadow-none border-none",
      },
    },
    size: {
      sm: {
        base: "p-3",
      },
      md: {
        base: "p-4",
      },
      lg: {
        base: "p-6",
      },
    },
    hoverable: {
      true: {
        base: "hover:shadow-medium hover:scale-[1.02] cursor-pointer",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children?: React.ReactNode;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, hoverable, children, ...props }, ref) => {
    const { base } = cardVariants({ variant, size, hoverable });

    return (
      <div
        ref={ref}
        className={cn(base(), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const { header } = cardVariants();

    return (
      <div
        ref={ref}
        className={cn(header(), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    const { body } = cardVariants();

    return (
      <div
        ref={ref}
        className={cn(body(), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    const { footer } = cardVariants();

    return (
      <div
        ref={ref}
        className={cn(footer(), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardBody.displayName = "CardBody";
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardBody, CardFooter };