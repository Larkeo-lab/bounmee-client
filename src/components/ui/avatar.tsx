import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

const avatarVariants = tv({
  slots: {
    base: [
      "flex",
      "relative",
      "justify-center",
      "items-center",
      "box-border",
      "overflow-hidden",
      "align-middle",
      "text-white",
      "z-0",
      "outline-none",
      "data-[focus-visible=true]:z-10",
      "data-[focus-visible=true]:outline-2",
      "data-[focus-visible=true]:outline-focus",
      "data-[focus-visible=true]:outline-offset-2",
    ],
    img: [
      "flex",
      "object-cover",
      "w-full",
      "h-full",
      "transition-opacity",
      "!duration-500",
      "opacity-0",
      "data-[loaded=true]:opacity-100",
    ],
    fallback: [
      "flex",
      "items-center",
      "justify-center",
      "text-center",
      "h-full",
      "w-full",
      "bg-default-300",
      "text-default-foreground",
      "font-normal",
      "transition-all",
      "duration-300",
    ],
    name: [
      "font-normal",
      "text-center",
      "text-inherit",
    ],
    icon: [
      "flex",
      "items-center",
      "justify-center",
      "text-inherit",
      "w-full",
      "h-full",
    ],
  },
  variants: {
    size: {
      sm: {
        base: "w-8 h-8 text-xs",
      },
      md: {
        base: "w-10 h-10 text-sm",
      },
      lg: {
        base: "w-14 h-14 text-lg",
      },
      xl: {
        base: "w-20 h-20 text-xl",
      },
    },
    color: {
      default: {
        base: "bg-default text-default-foreground",
        fallback: "bg-default-300 text-default-foreground",
      },
      primary: {
        base: "bg-primary text-primary-foreground",
        fallback: "bg-primary text-primary-foreground",
      },
      secondary: {
        base: "bg-secondary text-secondary-foreground",
        fallback: "bg-secondary text-secondary-foreground",
      },
      success: {
        base: "bg-success text-success-foreground",
        fallback: "bg-success text-success-foreground",
      },
      warning: {
        base: "bg-warning text-warning-foreground",
        fallback: "bg-warning text-warning-foreground",
      },
      danger: {
        base: "bg-danger text-danger-foreground",
        fallback: "bg-danger text-danger-foreground",
      },
    },
    radius: {
      none: {
        base: "rounded-none",
      },
      sm: {
        base: "rounded-small",
      },
      md: {
        base: "rounded-medium",
      },
      lg: {
        base: "rounded-large",
      },
      full: {
        base: "rounded-full",
      },
    },
    isBordered: {
      true: {
        base: "ring-2 ring-offset-2 ring-offset-background dark:ring-offset-background",
      },
    },
    isDisabled: {
      true: {
        base: "opacity-disabled cursor-not-allowed",
      },
    },
    disableAnimation: {
      true: {},
      false: {
        img: "transition-opacity !duration-500",
        fallback: "transition-all duration-300",
      },
    },
  },
  defaultVariants: {
    size: "md",
    color: "default",
    radius: "full",
  },
  compoundVariants: [
    {
      color: "default",
      isBordered: true,
      class: {
        base: "ring-default",
      },
    },
    {
      color: "primary",
      isBordered: true,
      class: {
        base: "ring-primary",
      },
    },
    {
      color: "secondary",
      isBordered: true,
      class: {
        base: "ring-secondary",
      },
    },
    {
      color: "success",
      isBordered: true,
      class: {
        base: "ring-success",
      },
    },
    {
      color: "warning",
      isBordered: true,
      class: {
        base: "ring-warning",
      },
    },
    {
      color: "danger",
      isBordered: true,
      class: {
        base: "ring-danger",
      },
    },
  ],
});

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
  icon?: React.ReactNode;
  fallback?: React.ReactNode;
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
  showFallback?: boolean;
  classNames?: {
    base?: string;
    img?: string;
    fallback?: string;
    name?: string;
    icon?: string;
  };
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      icon,
      fallback,
      imgProps,
      showFallback = true,
      className,
      classNames,
      size,
      color,
      radius,
      isBordered,
      isDisabled,
      disableAnimation,
      ...props
    },
    ref
  ) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);

    const {
      base,
      img,
      fallback: fallbackClass,
      name: nameClass,
      icon: iconClass,
    } = avatarVariants({
      size,
      color,
      radius,
      isBordered,
      isDisabled,
      disableAnimation,
    });

    const handleLoad = () => {
      setIsLoaded(true);
      setHasError(false);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoaded(false);
    };

    const getInitials = (name: string) => {
      const names = name.trim().split(" ");
      if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
      }
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const shouldShowImage = src && !hasError;
    const shouldShowFallback = showFallback && (!src || hasError || !isLoaded);

    return (
      <div
        ref={ref}
        className={cn(base(), classNames?.base, className)}
        {...props}
      >
        {shouldShowImage && (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className={cn(img(), classNames?.img)}
            data-loaded={isLoaded}
            onLoad={handleLoad}
            onError={handleError}
            {...imgProps}
          />
        )}
        
        {shouldShowFallback && (
          <div
            className={cn(fallbackClass(), classNames?.fallback)}
            aria-label={alt || name || "Avatar"}
          >
            {fallback || (
              <>
                {icon && (
                  <div className={cn(iconClass(), classNames?.icon)}>
                    {icon}
                  </div>
                )}
                {!icon && name && (
                  <span className={cn(nameClass(), classNames?.name)}>
                    {getInitials(name)}
                  </span>
                )}
                {!icon && !name && (
                  <div className={cn(iconClass(), classNames?.icon)}>
                    <svg
                      fill="none"
                      height="80%"
                      role="img"
                      viewBox="0 0 24 24"
                      width="80%"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H19V9Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar, avatarVariants };