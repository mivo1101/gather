import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "@/components/app/icons";

type SelectVariant = "pill" | "field" | "compact";

const VARIANT_CLASSES: Record<SelectVariant, string> = {
  pill: "rounded-full py-1.5 pl-3.5 pr-9 text-sm",
  field: "rounded-2xl py-3.5 pl-4 pr-10 text-sm",
  compact: "rounded-xl py-2.5 pl-3 pr-9 text-sm",
};

const CHEVRON_INSET: Record<SelectVariant, string> = {
  pill: "right-3",
  field: "right-3.5",
  compact: "right-3",
};

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  variant?: SelectVariant;
  /** Classes for the outer positioning wrapper. */
  wrapperClassName?: string;
}

/** Native select with a consistently padded custom chevron. */
export function Select({
  variant = "field",
  className = "",
  wrapperClassName = "",
  children,
  ...props
}: SelectProps) {
  return (
    <span
      className={`relative inline-flex min-w-0 items-center ${wrapperClassName}`}
    >
      <select
        {...props}
        className={`min-w-0 appearance-none border border-black/10 bg-white text-black outline-none focus:border-signature/40 focus:ring-2 focus:ring-signature/15 ${VARIANT_CLASSES[variant]} ${className}`}
      >
        {children}
      </select>
      <span
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-grey ${CHEVRON_INSET[variant]}`}
        aria-hidden="true"
      >
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </span>
    </span>
  );
}
