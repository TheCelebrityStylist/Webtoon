// components/Footer.tsx

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footerInner">
        <span>© {new Date().getFullYear()} EU Webtoon MVP</span>
        <span>Vertical-first storytelling · Fast Pass credits</span>
      </div>
    </footer>
  );
}
