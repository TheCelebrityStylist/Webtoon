import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { planCatalog, publicAppUrl, stripeConfig } from "@/lib/stripe";

const input = z.object({
  plan: z.enum(["writer", "professional", "studio"]),
  period: z.enum(["monthly", "annual"]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return Response.json({ error: "Sign in to subscribe" }, { status: 401 });
  const parsed = input.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Choose a valid plan and billing period" }, { status: 400 });

  const { stripe, prices } = stripeConfig();
  const existing = await prisma.subscription.findFirst({ where: { userId: session.user.id }, orderBy: { updatedAt: "desc" } });
  const base = publicAppUrl(request);
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existing?.stripeCustomerId,
    customer_email: existing ? undefined : session.user.email,
    line_items: [{ price: prices[parsed.data.plan][parsed.data.period], quantity: 1 }],
    success_url: `${base}/studio?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/pricing?checkout=canceled`,
    allow_promotion_codes: true,
    subscription_data: { metadata: { morrow_user_id: session.user.id, product_key: parsed.data.plan } },
    metadata: { morrow_user_id: session.user.id, product_key: parsed.data.plan, billing_period: parsed.data.period },
  }, { idempotencyKey: `checkout:${session.user.id}:${parsed.data.plan}:${parsed.data.period}:${new Date().toISOString().slice(0, 13)}` });

  return Response.json({ url: checkout.url, plan: planCatalog[parsed.data.plan].name });
}
