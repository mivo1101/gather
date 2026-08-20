/** Visible and screen-reader-friendly marker for required fields. */
export function RequiredMark() {
  return (
    <>
      <span className="ml-0.5 text-signature" aria-hidden="true">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}
