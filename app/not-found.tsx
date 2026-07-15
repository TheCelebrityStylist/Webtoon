import Link from "next/link";
export default function NotFound() { return <main className="route-state"><span className="route-state-mark">404</span><h1>That page is not in this story.</h1><p>The link may be old, or the page may have moved.</p><Link className="button" href="/">Return to Morrow</Link></main>; }
