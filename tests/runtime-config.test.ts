import { describe, expect, it } from "vitest";
import { getAuthAvailability, isPreviewDemoUser, PREVIEW_DEMO_USER_ID } from "@/lib/runtime-config";

describe("deployment-aware authentication",()=>{
  it("does not enable preview authentication without both an explicit flag and secret",()=>{
    expect(getAuthAvailability({VERCEL_ENV:"preview",AUTH_PREVIEW_DEMO:"true"}).previewDemoEnabled).toBe(false);
    expect(getAuthAvailability({VERCEL_ENV:"preview",AUTH_SECRET:"secret",AUTH_PREVIEW_DEMO:"false"}).previewDemoEnabled).toBe(false);
  });
  it("enables the seeded path only in a deliberately configured preview",()=>{
    const config=getAuthAvailability({VERCEL_ENV:"preview",AUTH_SECRET:"secret",AUTH_PREVIEW_DEMO:"true"});
    expect(config.previewDemoEnabled).toBe(true);expect(config.deployment).toBe("preview");
  });
  it("never enables preview demo authentication in production",()=>{
    const config=getAuthAvailability({VERCEL_ENV:"production",AUTH_SECRET:"secret",AUTH_PREVIEW_DEMO:"true"});
    expect(config.previewDemoEnabled).toBe(false);expect(config.deployment).toBe("production");
  });
  it("reports database and Google paths independently",()=>{
    const config=getAuthAvailability({DATABASE_URL:"postgresql://db",GOOGLE_CLIENT_ID:"id",GOOGLE_CLIENT_SECRET:"secret"});
    expect(config.databaseConfigured).toBe(true);expect(config.googleConfigured).toBe(true);expect(config.authConfigured).toBe(false);
  });
  it("recognizes only the fixed non-production demo identity",()=>{expect(isPreviewDemoUser(PREVIEW_DEMO_USER_ID)).toBe(true);expect(isPreviewDemoUser("user-1")).toBe(false)});
});
