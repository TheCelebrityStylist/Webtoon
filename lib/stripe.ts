import Stripe from "stripe";
import { z } from "zod";

const priceEnvironment = z.object({
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_PRICE_WRITER_MONTHLY: z.string().startsWith("price_"),
  STRIPE_PRICE_WRITER_ANNUAL: z.string().startsWith("price_"),
  STRIPE_PRICE_PROFESSIONAL_MONTHLY: z.string().startsWith("price_"),
  STRIPE_PRICE_PROFESSIONAL_ANNUAL: z.string().startsWith("price_"),
  STRIPE_PRICE_STUDIO_MONTHLY: z.string().startsWith("price_"),
  STRIPE_PRICE_STUDIO_ANNUAL: z.string().startsWith("price_"),
});

export type PlanKey = "writer" | "professional" | "studio";
export type BillingPeriod = "monthly" | "annual";

export const planCatalog = {
  writer: { name: "Morrow Writer", entitlements: { projects: 3, reviewPasses: 20, collaborators: 0 } },
  professional: { name: "Morrow Professional", entitlements: { projects: -1, reviewPasses: 80, collaborators: 1 } },
  studio: { name: "Morrow Studio", entitlements: { projects: -1, reviewPasses: -1, collaborators: 10 } },
} as const;

export function stripeConfig() {
  const parsed = priceEnvironment.parse(process.env);
  return {
    stripe: new Stripe(parsed.STRIPE_SECRET_KEY),
    webhookSecret: parsed.STRIPE_WEBHOOK_SECRET,
    prices: {
      writer: { monthly: parsed.STRIPE_PRICE_WRITER_MONTHLY, annual: parsed.STRIPE_PRICE_WRITER_ANNUAL },
      professional: { monthly: parsed.STRIPE_PRICE_PROFESSIONAL_MONTHLY, annual: parsed.STRIPE_PRICE_PROFESSIONAL_ANNUAL },
      studio: { monthly: parsed.STRIPE_PRICE_STUDIO_MONTHLY, annual: parsed.STRIPE_PRICE_STUDIO_ANNUAL },
    } satisfies Record<PlanKey, Record<BillingPeriod, string>>,
  };
}

export function publicAppUrl(request?: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return new URL(configured).origin;
  if (request) return new URL(request.url).origin;
  throw new Error("NEXT_PUBLIC_APP_URL is required");
}
