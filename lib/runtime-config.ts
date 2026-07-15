export type AuthAvailability = {
  authConfigured: boolean;
  databaseConfigured: boolean;
  googleConfigured: boolean;
  previewDemoEnabled: boolean;
  deployment: "production" | "preview" | "development";
};

export function getAuthAvailability(environment: Record<string, string | undefined> = process.env): AuthAvailability {
  const deployment = environment.VERCEL_ENV === "production"
    ? "production"
    : environment.VERCEL_ENV === "preview"
      ? "preview"
      : "development";
  const authConfigured = Boolean(environment.AUTH_SECRET ?? environment.NEXTAUTH_SECRET);
  const databaseConfigured = Boolean(environment.DATABASE_URL);
  const googleConfigured = Boolean(environment.GOOGLE_CLIENT_ID && environment.GOOGLE_CLIENT_SECRET);
  const previewDemoEnabled = deployment === "preview" && environment.AUTH_PREVIEW_DEMO === "true" && authConfigured;
  return { authConfigured, databaseConfigured, googleConfigured, previewDemoEnabled, deployment };
}

export const PREVIEW_DEMO_USER_ID = "morrow-preview-demo";
export function isPreviewDemoUser(id?: string | null) {
  return id === PREVIEW_DEMO_USER_ID;
}
