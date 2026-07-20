import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { calendarDateTime, previewCharacterRows } from "@/integrations/google/validation";
import { decryptToken, encryptToken, oauthStatePayload, signOAuthState, verifyOAuthState } from "@/integrations/google/security";

describe("Google Workspace integration boundaries", () => {
  beforeEach(() => {
    process.env.AUTH_SECRET = "test-auth-secret-with-enough-entropy";
    process.env.INTEGRATION_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  });
  afterEach(() => {
    delete process.env.AUTH_SECRET;
    delete process.env.INTEGRATION_ENCRYPTION_KEY;
  });

  it("round-trips refresh tokens with authenticated encryption", () => {
    const encrypted = encryptToken("refresh-token-value");
    expect(encrypted).not.toContain("refresh-token-value");
    expect(decryptToken(encrypted)).toBe("refresh-token-value");
  });

  it("binds OAuth state to user and expiry", () => {
    const state = signOAuthState("user-1", "nonce", Date.now() + 60_000);
    expect(verifyOAuthState(state, "user-1")).toBe(true);
    expect(verifyOAuthState(state, "user-2")).toBe(false);
    expect(oauthStatePayload(state, "user-1")?.nonce).toBe("nonce");
  });

  it("validates Sheets rows and Calendar time zones", () => {
    expect(previewCharacterRows([{ name: "Mara", role: "Lead" }, { name: "", role: "Lead" }]).map((row) => row.valid)).toEqual([true, false]);
    expect(calendarDateTime("2026-08-01T09:00:00Z", "Europe/Amsterdam").timeZone).toBe("Europe/Amsterdam");
    expect(() => calendarDateTime("not-a-date", "UTC")).toThrow("Invalid deadline");
  });
});
