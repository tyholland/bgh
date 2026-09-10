"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        padding: "60px 20px",
        textAlign: "center",
      }}
    >
      <h1>Something went wrong</h1>
      <p>
        We couldn&apos;t load this page right now. Please try again in a moment.
      </p>
      <button
        onClick={reset}
        style={{
          border: "none",
          borderRadius: 10,
          padding: "8px 16px",
          background: "#1439e6",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
