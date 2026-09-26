"use client";

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <h1>Something went wrong</h1>
        <p>The app hit an unexpected error. Please reload.</p>
        <button
          onClick={retry}
          style={{
            border: "none",
            borderRadius: 10,
            padding: "8px 16px",
            background: "#1439e6",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
