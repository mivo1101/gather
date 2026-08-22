/**
 * Grey means nothing is happening yet, green means it is live, blue means it
 * is behind you. Muted is the same grey story as neutral but faded, so a
 * trashed item never reads as an ordinary draft.
 */
const toneStyles = {
  neutral: { dot: "bg-[#a9aab1]", text: "text-[#6a6b72]" },
  green: { dot: "bg-[#22c17b]", text: "text-[#0f8a55]" },
  blue: { dot: "bg-[#3d9bf5]", text: "text-[#1f6fd0]" },
  muted: { dot: "bg-black/15", text: "text-grey" },
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
