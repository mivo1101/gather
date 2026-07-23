import Link from "next/link";

interface LogoProps {
  className?: string;
  href?: string;
}

/** Gather wordmark with the signature "+" icon mark */
export function Logo({ className = "", href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="Gather - Home"
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-lg font-bold text-signature"
        aria-hidden="true"
      >
        +
      </span>
      <span className="text-xl font-semibold tracking-tight text-black">
        Gather
      </span>
    </Link>
  );
}
