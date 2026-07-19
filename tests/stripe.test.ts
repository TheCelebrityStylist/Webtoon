import { afterEach, describe, expect, it } from "vitest";
import { planCatalog, publicAppUrl, stripeConfig } from "@/lib/stripe";

const keys = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_PRICE_WRITER_MONTHLY", "STRIPE_PRICE_WRITER_ANNUAL", "STRIPE_PRICE_PROFESSIONAL_MONTHLY", "STRIPE_PRICE_PROFESSIONAL_ANNUAL", "STRIPE_PRICE_STUDIO_MONTHLY", "STRIPE_PRICE_STUDIO_ANNUAL", "NEXT_PUBLIC_APP_URL"] as const;

describe("Stripe production configuration", () => {
  afterEach(() => keys.forEach((key) => delete process.env[key]));

  it("maps every plan and billing period to a Stripe price", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_placeholder";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_placeholder";
    for (const key of keys.filter((key) => key.startsWith("STRIPE_PRICE_"))) process.env[key] = `price_${key.toLowerCase()}`;
    const config = stripeConfig();
    expect(Object.keys(config.prices)).toEqual(Object.keys(planCatalog));
    expect(config.prices.studio.annual).toMatch(/^price_/);
  });

  it("requires a trusted canonical application origin", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://webtoon-xi.vercel.app/studio";
    expect(publicAppUrl()).toBe("https://webtoon-xi.vercel.app");
  });
});
