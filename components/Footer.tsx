// components/Footer.tsx

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #e5e7eb" }}>
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "24px 16px",
          fontSize: "14px",
          color: "#6b7280",
        }}
      >
        © {new Date().getFullYear()} EU Webtoon MVP
      </div>
    </footer>
  );
}
