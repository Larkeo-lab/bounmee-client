import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

const inputVariants = tv({
  slots: {
    base: [
      "group",
      "flex",
      "flex-col",
      "data-[hidden=true]:hidden",
    ],
    mainWrapper: [
      "h-full",
      "flex",
      "flex-col",
    ],
    inputWrapper: [
      "relative",
      "w-full",
      "inline-flex",
      "tap-highlight-transparent",
      "shadow-sm",
      "px-3",
      "bg-default-100",
      "data-[hover=true]:bg-default-200",
      "group-data-[focus=true]:bg-default-100",
      "min-h-unit-10",
      "rounded-medium",
      "flex-col",
      "items-start",
      "justify-center",
      "gap-0",
      "transition-background",
      "motion-reduce:transition-none",
      "!duration-150",
      "outline-none",
      "group-data-[focus-visible=true]:z-10",
      "group-data-[focus-visible=true]:ring-2",
      "group-data-[focus-visible=true]:ring-focus",
      "group-data-[focus-visible=true]:ring-offset-2",
      "group-data-[focus-visible=true]:ring-offset-background",
    ],
    innerWrapper: [
      "inline-flex",
      "w-full",
      "items-center",
      "h-full",
      "box-border",
      "group-data-[has-start-content=true]:ps-1.5",
      "group-data-[has-end-content=true]:pe-1.5",
    ],
    input: [
      "w-full",
      "font-normal",
      "bg-transparent",
      "!outline-none",
      "placeholder:text-foreground-500",
      "focus-visible:outline-none",
      "data-[has-start-content=true]:ps-1.5",
      "data-[has-end-content=true]:pe-1.5",
      "file:cursor-pointer",
      "file:bg-transparent",
      "file:border-0",
      "autofill:bg-transparent",
      "bg-clip-text",
      "text-small",
      "group-data-[has-value=true]:text-default-foreground",
    ],
    label: [
      "absolute",
      "z-10",
      "pointer-events-none",
      "origin-top-left",
      "rtl:origin-top-right",
      "subpixel-antialiased",
      "block",
      "text-small",
      "text-foreground-600",
      "cursor-text",
      "will-change-auto",
      "!duration-200",
      "!ease-out",
      "motion-reduce:transition-none",
      "transition-[transform,color,left,opacity]",
      "group-data-[filled-within=true]:text-default-600",
      "group-data-[filled-within=true]:pointer-events-auto",
      "group-data-[filled-within=true]:text-xs",
      "group-data-[filled-within=true]:-translate-y-[calc(50%_+_theme(fontSize.xs)/2_-_6px)]",
    ],
    description: [
      "text-tiny",
      "text-foreground-400",
      "mt-1",
    ],
    errorMessage: [
      "text-tiny",
      "text-danger",
      "mt-1",
    ],
    startContent: [
      "flex",
      "items-center",
      "text-default-400",
    ],
    endContent: [
      "flex",
      "items-center",
      "text-default-400",
    ],
  },
  variants: {
    variant: {
      flat: {
        inputWrapper: [
          "bg-default-100",
          "data-[hover=true]:bg-default-200",
          "group-data-[focus=true]:bg-default-100",
        ],
      },
      faded: {
        inputWrapper: [
          "bg-default-100",
          "border-medium",
          "border-default-200",
          "data-[hover=true]:border-default-300",
          "group-data-[focus=true]:border-default-foreground",
          "group-data-[focus=true]:bg-default-100",
        ],
      },
      bordered: {
        inputWrapper: [
          "border-medium",
          "border-default-200",
          "data-[hover=true]:border-default-300",
          "group-data-[focus=true]:border-default-foreground",
          "bg-transparent",
        ],
      },
      underlined: {
        inputWrapper: [
          "!px-1",
          "!pb-0",
          "!gap-1",
          "relative",
          "box-border",
          "border-b-medium",
          "border-default-300",
          "!rounded-none",
          "hover:border-default-400",
          "after:content-['']",
          "after:w-0",
          "after:origin-center",
          "after:bg-default-foreground",
          "after:absolute",
          "after:left-1/2",
          "after:-translate-x-1/2",
          "after:-bottom-[2px]",
          "after:h-[2px]",
          "group-data-[focus=true]:after:w-full",
          "after:transition-width",
          "motion-reduce:after:transition-none",
          "bg-transparent",
        ],
      },
    },
    size: {
      sm: {
        inputWrapper: "h-8 min-h-8 px-2",
        input: "text-xs",
        label: "text-xs",
      },
      md: {
        inputWrapper: "h-10 min-h-10",
        input: "text-sm",
        label: "text-sm",
      },
      lg: {
        inputWrapper: "h-12 min-h-12",
        input: "text-base",
        label: "text-base",
      },
    },
    radius: {
      none: {
        inputWrapper: "rounded-none",
      },
      sm: {
        inputWrapper: "rounded-small",
      },
      md: {
        inputWrapper: "rounded-medium",
      },
      lg: {
        inputWrapper: "rounded-large",
      },
      full: {
        inputWrapper: "rounded-full",
      },
    },
    labelPlacement: {
      outside: {
        base: "flex flex-col",
      },
      "outside-left": {
        base: "flex flex-row items-center flex-nowrap data-[has-helper=true]:items-start",
        inputWrapper: "flex-1",
        mainWrapper: "flex flex-col",
        label: "relative text-foreground pr-2 rtl:pl-2 rtl:pr-0",
      },
      inside: {
        label: "text-tiny cursor-text",
        inputWrapper: "flex-col items-start justify-center gap-0",
      },
    },
    fullWidth: {
      true: {
        base: "w-full",
      },
    },
    isClearable: {
      true: {},
    },
    isDisabled: {
      true: {
        base: "opacity-disabled pointer-events-none",
      },
    },
    isInvalid: {
      true: {
        label: "!text-danger",
        input: "placeholder:text-danger-foreground",
        inputWrapper: "!bg-danger-50 !border-danger group-data-[focus=true]:!border-danger",
      },
    },
    isRequired: {
      true: {
        label: "after:content-['*'] after:text-danger after:ml-0.5",
      },
    },
    isReadOnly: {
      true: {
        inputWrapper: "cursor-default",
        input: "cursor-default",
      },
    },
    disableAnimation: {
      true: {
        label: "transition-none",
        inputWrapper: "transition-none",
        input: "transition-none",
      },
      false: {
        inputWrapper: "transition-background motion-reduce:transition-none !duration-150",
        label: "will-change-auto !duration-200 !ease-out motion-reduce:transition-none transition-[transform,color,left,opacity]",
        clearButton: "transition-opacity motion-reduce:transition-none",
      },
    },
  },
  defaultVariants: {
    variant: "flat",
    size: "md",
    fullWidth: true,
    labelPlacement: "inside",
    isDisabled: false,
    disableAnimation: false,
  },
});

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  description?: string;
  errorMessage?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  labelPlacement?: "inside" | "outside" | "outside-left";
  isClearable?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  isReadOnly?: boolean;
  disableAnimation?: boolean;
  classNames?: {
    base?: string;
    label?: string;
    inputWrapper?: string;
    innerWrapper?: string;
    input?: string;
    description?: string;
    errorMessage?: string;
  };
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      radius,
      fullWidth,
      labelPlacement,
      isClearable,
      isDisabled,
      isInvalid,
      isRequired,
      isReadOnly,
      disableAnimation,
      label,
      description,
      errorMessage,
      startContent,
      endContent,
      classNames,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

    const {
      base,
      label: labelClass,
      inputWrapper,
      innerWrapper,
      input,
      description: descriptionClass,
      errorMessage: errorMessageClass,
      startContent: startContentClass,
      endContent: endContentClass,
    } = inputVariants({
      variant,
      size,
      radius,
      fullWidth,
      labelPlacement,
      isClearable,
      isDisabled,
      isInvalid,
      isRequired,
      isReadOnly,
      disableAnimation,
    });

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const shouldLabelBeOutside = labelPlacement === "outside" || labelPlacement === "outside-left";
    const shouldLabelBeInside = labelPlacement === "inside";

    return (
      <div
        className={cn(base(), classNames?.base, className)}
        data-slot="base"
        data-filled-within={hasValue}
        data-focus={isFocused}
        data-focus-visible={isFocused}
        data-has-start-content={!!startContent}
        data-has-end-content={!!endContent}
        data-has-helper={!!(description || errorMessage)}
      >
        {shouldLabelBeOutside && label && (
          <label
            className={cn(labelClass(), classNames?.label)}
            data-slot="label"
          >
            {label}
          </label>
        )}
        <div className={cn(inputWrapper(), classNames?.inputWrapper)} data-slot="input-wrapper">
          {shouldLabelBeInside && label && (
            <label
              className={cn(labelClass(), classNames?.label)}
              data-slot="label"
            >
              {label}
            </label>
          )}
          <div className={cn(innerWrapper(), classNames?.innerWrapper)} data-slot="inner-wrapper">
            {startContent && (
              <div className={cn(startContentClass())} data-slot="start-content">
                {startContent}
              </div>
            )}
            <input
              ref={ref}
              className={cn(input(), classNames?.input)}
              data-slot="input"
              data-filled={hasValue}
              data-has-start-content={!!startContent}
              data-has-end-content={!!endContent}
              disabled={isDisabled}
              readOnly={isReadOnly}
              required={isRequired}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              {...props}
            />
            {endContent && (
              <div className={cn(endContentClass())} data-slot="end-content">
                {endContent}
              </div>
            )}
          </div>
        </div>
        {description && !isInvalid && (
          <div className={cn(descriptionClass(), classNames?.description)} data-slot="description">
            {description}
          </div>
        )}
        {errorMessage && isInvalid && (
          <div className={cn(errorMessageClass(), classNames?.errorMessage)} data-slot="error-message">
            {errorMessage}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };