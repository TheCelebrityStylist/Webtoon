"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="route-state"><span className="route-state-mark">m</span><h1>This page could not open.</h1><p>Your work has not been changed. Try the request once more or return to the public site.</p><div><button className="button" onClick={reset}>Try again</button><Link className="text-link" href="/">Return home</Link></div></main>; }
