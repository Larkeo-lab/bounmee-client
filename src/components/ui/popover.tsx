import React, { createContext, useContext, useEffect, useRef, useState } from "react";

type PopoverContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

export function Popover({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const ctx = useContext(PopoverContext);
  if (!ctx) return null;

  const { setOpen } = ctx;

  // If asChild is true and children is a single element, clone it and attach handlers.
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: any) => {
        ;(children as any).props.onClick?.(e);
        setOpen((s) => !s);
      },
    } as any);
  }

  return (
    <button type="button" onClick={() => setOpen((s) => !s)}>
      {children}
    </button>
  );
}

export function PopoverContent({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = useContext(PopoverContext);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!ctx || !ref.current) return;
      const target = e.target as Node;
      if (ref.current.contains(target)) return;
      // click outside
      ctx.setOpen(false);
    }

    if (ctx?.open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ctx]);

  if (!ctx) return null;

  return ctx.open ? (
    <div
      ref={ref}
      className={"absolute left-0 mt-2 z-50 min-w-[160px] bg-white rounded shadow " + (className || "")}
      {...rest}
    >
      {children}
    </div>
  ) : null;
}

export default Popover;
