"use client";

import { useEffect } from "react";

// Last-resort boundary: replaces the root layout when an error is thrown in the
// layout itself, so it must render its own <html>/<body>. Global stylesheets are
// not applied here, so styles are inlined to guarantee a presentable fallback.
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#0b1120",
          color: "#e5e7eb",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <div
            style={{
              margin: "0 auto",
              width: "3.5rem",
              height: "3.5rem",
              borderRadius: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(239,68,68,0.15)",
              fontSize: "1.75rem",
            }}
          >
            ⚠️
          </div>
          <h1
            style={{
              marginTop: "1.25rem",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#f9fafb",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "#9ca3af",
            }}
          >
            A critical error occurred. Please try again — if the problem persists,
            reload the page or contact support.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#fff",
              background: "#2563eb",
              border: "none",
              borderRadius: "9999px",
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
