import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import clsx from "clsx";
import { Link } from "react-router-dom";

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface BreadcrumProps {
  items: BreadcrumbItemType[];
  className?: string;
  /** Optional navigation guard — called instead of the default Link behaviour */
  onNavigate?: (href: string) => void;
}

export default function Breadcrum({
  items,
  className,
  onNavigate,
}: BreadcrumProps) {
  return (
    <Breadcrumbs className={clsx("mb-3", className)}>
      {items.map((item, index) => {
        const isLastItem = index === items.length - 1;

        return (
          <BreadcrumbItem
            key={index}
            className={
              isLastItem ? "text-black dark:text-white font-medium" : ""
            }
          >
            {item.href && onNavigate ? (
              <span
                className="cursor-pointer"
                onClick={() => onNavigate(item.href!)}
              >
                {item.label}
              </span>
            ) : (
              <Link to={item.href || ""}>{item.label}</Link>
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumbs>
  );
}
