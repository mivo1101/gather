"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-grey">
        Gather
      </p>
      <h1 className="mt-3 text-3xl font-bold text-black">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-grey">
        {error.message || "The page failed to load. Try again, or restart the dev server."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-black/90"
      >
        Try again
      </button>
    </div>
  );
}
