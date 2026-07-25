"use client";

interface BrandCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  className?: string;
}

/** Custom checkbox using brand black + signature pink. */
export function BrandCheckbox({
  checked,
  onChange,
  label,
  className = "",
}: BrandCheckboxProps) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center ${className}`}
      onClick={(event) => event.stopPropagation()}
    >
      <span className="sr-only">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
          checked
            ? "border-black bg-signature"
            : "border-black/25 bg-white"
        }`}
      >
        {checked && (
          <svg
            className="h-3 w-3 text-black"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 6.2L4.8 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </label>
  );
}
