import Link from "next/link";

interface LogoProps {
  className?: string;
  href?: string;
  /** Use on dark backgrounds */
  light?: boolean;
}

/** Gather wordmark with the signature "+" icon mark */
export function Logo({ className = "", href = "/", light = false }: LogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="Gather - Home"
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold text-signature ${
          light ? "bg-white" : "bg-black"
        }`}
        aria-hidden="true"
      >
        +
      </span>
      <span
        className={`text-xl font-semibold tracking-tight ${
          light ? "text-white" : "text-black"
        }`}
      >
        Gather
      </span>
    </Link>
  );
}
