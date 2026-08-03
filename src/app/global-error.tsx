"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fff",
          color: "#000",
        }}
      >
        <div style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <p style={{ fontSize: 12, letterSpacing: "0.12em", color: "#8E8E93" }}>
            GATHER
          </p>
          <h1 style={{ margin: "12px 0 8px", fontSize: 28 }}>
            Something went wrong
          </h1>
          <p style={{ margin: "0 0 20px", color: "#8E8E93", fontSize: 14 }}>
            {error.message || "The app hit an unexpected error."}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: 0,
              borderRadius: 999,
              background: "#000",
              color: "#fff",
              padding: "10px 18px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
