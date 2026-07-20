import Link from "next/link";
import { ActionForm, Field } from "@/components/ActionForm";
import { signInAction, signInGoogle, signInPreviewDemo } from "@/app/actions/auth";
import { getAuthAvailability } from "@/lib/runtime-config";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; reason?: string }> }) {
  const availability = getAuthAvailability();
  const params = await searchParams;
  return <main className="auth-page auth-page--refined">
    <section><p className="eyebrow">MORROW STUDIO</p><h1>Welcome back.</h1><p>Return to your private projects, manuscripts, and story memory.</p><ul className="auth-trust"><li>Private workspace</li><li>Secure session cookies</li><li>Google access stays optional</li></ul></section>
    <div className="auth-panel">
      {availability.deployment === "preview" && <p className="preview-label">Preview deployment · seeded demonstration</p>}
      {(params.reason === "configuration" || !availability.authConfigured) && <div className="auth-notice" role="status"><strong>Sign-in is not configured here.</strong><span>The public site remains available. An administrator must add the server-side authentication secret.</span></div>}
      {params.error && <div className="auth-notice" role="alert"><strong>We could not complete sign-in.</strong><span>The link may have expired or the provider rejected the callback. Try again from this page.</span></div>}
      {availability.databaseConfigured && availability.authConfigured ? <ActionForm action={signInAction} submitLabel="Sign in"><Field name="email" label="Email" type="email" required/><Field name="password" label="Password" type="password" required/><p className="muted">New here? <Link href="/sign-up">Create an account</Link></p></ActionForm> : <div className="auth-empty"><strong>Email sign-in unavailable</strong><p>This deployment has no connected account database. No credentials are collected.</p></div>}
      {availability.googleConfigured && availability.authConfigured && <form action={signInGoogle}><button className="button auth-provider" type="submit">Continue with Google</button><small>Uses the registered callback for this environment.</small></form>}
      {availability.previewDemoEnabled && <form action={signInPreviewDemo} className="preview-demo-form"><button className="button coral" type="submit">Enter the preview studio</button><small>Seeded, temporary, and clearly separate from a production account. No database record is created.</small></form>}
      <Link className="text-link" href="/">Return to the public site</Link>
    </div>
  </main>;
}
