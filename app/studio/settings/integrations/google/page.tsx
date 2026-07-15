import Link from "next/link";
import { GoogleFileBrowser } from "@/components/GoogleFileBrowser";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/session";

const services = [
  ["Drive", "Select files and save exports", "drive"],
  ["Docs", "Preview manuscript structure", "docs"],
  ["Sheets", "Preview and validate structured rows", "sheets"],
  ["Calendar", "Create writing deadlines", "calendar"],
] as const;

export default async function GoogleSettings() {
  const user = await requireUser();
  const connection = await prisma.integrationConnection.findUnique({ where: { userId_provider: { userId: user.id, provider: "google" } } });
  const connected = Boolean(connection && !connection.revokedAt);

  return (
    <main className="studio-content">
      <p className="eyebrow">INTEGRATIONS</p>
      <h1>Google Workspace</h1>
      <p>Connect only the service you need. Sign-in access and document access remain separate permissions.</p>
      {connected ? (
        <section className="integration-status">
          <strong>{connection?.accountEmail ?? "Google account connected"}</strong>
          <p>Morrow can only use the permissions shown below.</p>
          <ul>{connection?.grantedScopes.map(scope => <li key={scope}>{scope}</li>)}</ul>
          <small>Your refresh token is encrypted on the server and never sent to this page.</small>
        </section>
      ) : (
        <section className="empty">
          <h2>No Workspace services connected</h2>
          <p>Choose one narrow permission. Google will show exactly what Morrow is asking to access.</p>
        </section>
      )}
      <div className="overview-grid">
        {services.map(([name, copy, id]) => (
          <article key={id}><h2>{name}</h2><p>{copy}</p><Link className="button secondary" href={`/api/integrations/google/connect?service=${id}`}>Connect {name}</Link></article>
        ))}
      </div>
      {connected && <GoogleFileBrowser />}
    </main>
  );
}
