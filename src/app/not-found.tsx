import Link from "next/link";

export default function NotFound() {
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
      <h1>Page not found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/">Back to the job board</Link>
    </div>
  );
}
