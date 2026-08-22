import Link from "next/link";

export interface SetupStepPill {
  id: string;
  label: string;
  done: boolean;
  /** Omit or pass null to render the step as not yet reachable. */
  href?: string | null;
}

/**
 * The brand's progress language: a pink pill once a step is done, black while
 * it is the one to do next, faded grey ahead of that, joined by pink arrows.
 * Shared so the setup flow and Home read as the same product.
 */
export function SetupSteps({
  steps,
  activeId,
  className = "",
}: {
  steps: SetupStepPill[];
  activeId?: string | null;
  className?: string;
}) {
  const pillClass = (active: boolean, done: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
      active
        ? "bg-black text-white"
        : done
          ? "bg-signature/10 text-signature hover:bg-signature/20"
          : "bg-soft-grey text-grey hover:bg-black/[0.08] hover:text-black"
    }`;

  return (
    <ol className={`flex flex-wrap items-center gap-2 ${className}`}>
      {steps.map((step, index) => {
        const active = step.id === activeId;
        const content = (
          <>
            <span aria-hidden="true">
              {step.done && !active ? "✓" : index + 1}
            </span>
            {step.label}
          </>
        );

        return (
          <li key={step.id} className="flex items-center gap-2">
            {index > 0 ? (
              <span className="text-signature/40" aria-hidden="true">
                →
              </span>
            ) : null}
            {step.href ? (
              <Link
                href={step.href}
                aria-current={active ? "step" : undefined}
                className={pillClass(active, step.done)}
              >
                {content}
              </Link>
            ) : (
              <span
                aria-current={active ? "step" : undefined}
                className={`${pillClass(active, step.done)} opacity-60`}
              >
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
