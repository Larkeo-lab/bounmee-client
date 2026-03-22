import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

const breadcrumbsVariants = tv({
  slots: {
    base: [
      "flex",
      "flex-wrap",
      "align-center",
      "break-words",
      "text-small",
    ],
    list: [
      "flex",
      "flex-wrap",
      "list-none",
      "p-0",
      "m-0",
    ],
    item: [
      "flex",
      "items-center",
      "color-inherit",
    ],
    separator: [
      "flex",
      "items-center",
      "justify-center",
      "px-1",
      "text-default-400",
    ],
  },
  variants: {
    variant: {
      solid: {
        item: [
          "data-[current=true]:text-default-foreground",
          "data-[current=true]:font-medium",
          "[&:not([data-current=true])]:text-default-500",
          "[&:not([data-current=true])]:transition-colors",
          "[&:not([data-current=true])]:hover:text-default-700",
        ],
      },
      bordered: {
        item: [
          "data-[current=true]:text-primary",
          "data-[current=true]:font-medium",
          "[&:not([data-current=true])]:text-default-500",
          "[&:not([data-current=true])]:transition-colors",
          "[&:not([data-current=true])]:hover:text-default-700",
        ],
      },
      light: {
        item: [
          "data-[current=true]:text-primary",
          "data-[current=true]:font-medium",
          "data-[current=true]:bg-primary/10",
          "data-[current=true]:px-2",
          "data-[current=true]:py-1",
          "data-[current=true]:rounded-small",
          "[&:not([data-current=true])]:text-default-500",
          "[&:not([data-current=true])]:transition-colors",
          "[&:not([data-current=true])]:hover:text-default-700",
        ],
      },
    },
    size: {
      sm: {
        base: "text-xs",
      },
      md: {
        base: "text-sm",
      },
      lg: {
        base: "text-base",
      },
    },
    radius: {
      none: {},
      sm: {},
      md: {},
      lg: {},
      full: {},
    },
    isDisabled: {
      true: {
        base: "opacity-disabled pointer-events-none",
      },
    },
    disableAnimation: {
      true: {},
      false: {
        item: "[&:not([data-current=true])]:transition-colors",
      },
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
});

export interface BreadcrumbItem {
  key?: string | number;
  href?: string;
  children: React.ReactNode;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isCurrent?: boolean;
  isDisabled?: boolean;
  className?: string;
  onClick?: (key: string | number) => void;
}

export interface BreadcrumbsProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof breadcrumbsVariants> {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  itemsBeforeCollapse?: number;
  itemsAfterCollapse?: number;
  renderEllipsis?: (props: { items: BreadcrumbItem[] }) => React.ReactNode;
  classNames?: {
    base?: string;
    list?: string;
    item?: string;
    separator?: string;
    ellipsis?: string;
  };
  onAction?: (key: string | number) => void;
}

const defaultSeparator = (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="1em"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const defaultEllipsis = (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="1em"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  (
    {
      children,
      className,
      classNames,
      items = [],
      separator = defaultSeparator,
      maxItems,
      itemsBeforeCollapse = 1,
      itemsAfterCollapse = 1,
      renderEllipsis,
      variant,
      size,
      radius,
      isDisabled,
      disableAnimation,
      onAction,
      ...props
    },
    ref
  ) => {
    const {
      base,
      list,
      item: itemClass,
      separator: separatorClass,
    } = breadcrumbsVariants({
      variant,
      size,
      radius,
      isDisabled,
      disableAnimation,
    });

    // Convert children to items if items prop is not provided
    const breadcrumbItems = React.useMemo(() => {
      if (items.length > 0) {
        return items;
      }

      return React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return {
            key: index,
            children: child,
            isCurrent: index === React.Children.count(children) - 1,
          } as BreadcrumbItem;
        }
        return null;
      })?.filter(Boolean) || [];
    }, [children, items]);

    // Handle item collapse logic
    const processedItems = React.useMemo(() => {
      if (!maxItems || breadcrumbItems.length <= maxItems) {
        return breadcrumbItems;
      }

      const totalItems = breadcrumbItems.length;
      const itemsToShow = maxItems - 1; // Reserve one spot for ellipsis
      
      if (itemsToShow <= itemsBeforeCollapse + itemsAfterCollapse) {
        // Show first and last items only
        return [
          ...breadcrumbItems.slice(0, 1),
          {
            key: "ellipsis",
            children: renderEllipsis ? 
              renderEllipsis({ items: breadcrumbItems.slice(1, -1) }) : 
              defaultEllipsis,
            isEllipsis: true,
          },
          ...breadcrumbItems.slice(-1),
        ];
      }

      return [
        ...breadcrumbItems.slice(0, itemsBeforeCollapse),
        {
          key: "ellipsis",
          children: renderEllipsis ? 
            renderEllipsis({ 
              items: breadcrumbItems.slice(itemsBeforeCollapse, totalItems - itemsAfterCollapse) 
            }) : 
            defaultEllipsis,
          isEllipsis: true,
        },
        ...breadcrumbItems.slice(totalItems - itemsAfterCollapse),
      ];
    }, [breadcrumbItems, maxItems, itemsBeforeCollapse, itemsAfterCollapse, renderEllipsis]);

    const handleItemClick = (item: BreadcrumbItem, event: React.MouseEvent) => {
      if (item.isDisabled || isDisabled) {
        event.preventDefault();
        return;
      }

      if (item.onClick && item.key !== undefined) {
        item.onClick(item.key);
      }

      if (onAction && item.key !== undefined) {
        onAction(item.key);
      }
    };

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn(base(), classNames?.base, className)}
        {...props}
      >
        <ol className={cn(list(), classNames?.list)}>
          {processedItems.map((item, index) => {
            const isLast = index === processedItems.length - 1;
            const itemKey = item.key ?? index;

            // Handle ellipsis items
            if ('isEllipsis' in item && item.isEllipsis) {
              return (
                <li key={itemKey} className={cn(itemClass(), classNames?.item)}>
                  <div className="flex items-center">
                    <span>{item.children}</span>
                  </div>
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className={cn(separatorClass(), classNames?.separator)}
                    >
                      {separator}
                    </span>
                  )}
                </li>
              );
            }

            // Handle regular breadcrumb items
            const breadcrumbItem = item as BreadcrumbItem;
            
            return (
              <li key={itemKey} className={cn(itemClass(), classNames?.item)}>
                <div
                  className="flex items-center"
                  data-current={breadcrumbItem.isCurrent || isLast}
                  data-disabled={breadcrumbItem.isDisabled || isDisabled}
                >
                  {breadcrumbItem.startContent}
                  
                  {breadcrumbItem.href && !breadcrumbItem.isCurrent && !isLast ? (
                    <a
                      href={breadcrumbItem.href}
                      className={cn("outline-none focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 rounded-small", breadcrumbItem.className)}
                      onClick={(e) => handleItemClick(breadcrumbItem, e)}
                    >
                      {breadcrumbItem.children}
                    </a>
                  ) : (
                    <span
                      className={cn(
                        breadcrumbItem.href && !breadcrumbItem.isDisabled && !isDisabled ? "cursor-pointer" : "",
                        breadcrumbItem.className
                      )}
                      onClick={breadcrumbItem.href ? (e) => handleItemClick(breadcrumbItem, e) : undefined}
                    >
                      {breadcrumbItem.children}
                    </span>
                  )}
                  
                  {breadcrumbItem.endContent}
                </div>
                
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className={cn(separatorClass(), classNames?.separator)}
                  >
                    {separator}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumbs.displayName = "Breadcrumbs";

export { Breadcrumbs, breadcrumbsVariants };