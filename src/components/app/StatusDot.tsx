const toneStyles = {
  amber: { dot: "bg-[#d98a45]", text: "text-[#9a5a2a]" },
  green: { dot: "bg-[#3f9c74]", text: "text-[#2f7a5b]" },
  gold: { dot: "bg-[#c39a24]", text: "text-[#85620e]" },
  neutral: { dot: "bg-[#a3a4aa]", text: "text-[#66676d]" },
  muted: { dot: "bg-grey", text: "text-grey" },
} as const;

export type StatusTone = keyof typeof toneStyles;

/**
 * Status as a coloured dot plus text rather than a filled pill, so cards spend
 * their one filled shape on the action instead of the label.
 */
export function StatusDot({
  tone,
  label,
  className = "",
}: {
  tone: StatusTone;
  label: string;
  className?: string;
}) {
  const style = toneStyles[tone];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold ${style.text} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
