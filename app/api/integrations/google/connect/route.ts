import { randomBytes } from "node:crypto";
import { auth } from "@/auth";
import { oauthNonceHash, safeOAuthReturnTo, signOAuthState } from "@/integrations/google/security";
import { prisma } from "@/lib/prisma";
const drive = "https://www.googleapis.com/auth/drive.file";
const scopes = { drive: [drive], docs: [drive, "https://www.googleapis.com/auth/documents"], sheets: [drive, "https://www.googleapis.com/auth/spreadsheets"], calendar: ["https://www.googleapis.com/auth/calendar.events"] };
export async function GET(request: Request) {
  const session = await auth(); if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const requestUrl = new URL(request.url); const clientId = process.env.GOOGLE_CLIENT_ID; const redirectUri = process.env.GOOGLE_INTEGRATION_REDIRECT_URI;
  if (!clientId || !redirectUri) return new Response("Google integration is not configured", { status: 503 });
  const service = requestUrl.searchParams.get("service") as keyof typeof scopes; if (!scopes[service]) return new Response("Unsupported Google service", { status: 400 });
  const nonce = randomBytes(18).toString("hex"); const expiresAt = Date.now() + 10 * 60_000;
  await prisma.oAuthState.create({ data: { userId: session.user.id, nonceHash: oauthNonceHash(nonce), expiresAt: new Date(expiresAt) } });
  const state = signOAuthState(session.user.id, nonce, expiresAt, safeOAuthReturnTo(requestUrl.searchParams.get("returnTo")));
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: "code", access_type: "offline", prompt: "consent", scope: scopes[service].join(" "), state, include_granted_scopes: "true" }).toString();
  return Response.redirect(url);
}
