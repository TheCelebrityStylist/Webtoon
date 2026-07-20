import { createHash } from "node:crypto";
import type Stripe from "stripe";
import { Prisma, SubscriptionStatus } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { planCatalog, stripeConfig, type PlanKey } from "@/lib/stripe";

export const runtime = "nodejs";

const statuses: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
  incomplete: "INCOMPLETE", incomplete_expired: "INCOMPLETE", trialing: "TRIALING", active: "ACTIVE",
  past_due: "PAST_DUE", canceled: "CANCELED", unpaid: "UNPAID", paused: "PAUSED",
};

async function synchronizeSubscription(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.morrow_user_id;
  const productKey = subscription.metadata.product_key as PlanKey;
  if (!userId || !planCatalog[productKey]) throw new Error("Subscription metadata is incomplete");
  const { prices } = stripeConfig();
  const product = subscription.items.data[0]?.price.product;
  const productId = typeof product === "string" ? product : product?.id;
  if (!productId) throw new Error("Subscription product is missing");
  const plan = await prisma.plan.upsert({
    where: { key: productKey },
    create: { key: productKey, name: planCatalog[productKey].name, stripeProductId: productId, monthlyPriceId: prices[productKey].monthly, annualPriceId: prices[productKey].annual, entitlements: planCatalog[productKey].entitlements },
    update: { stripeProductId: productId, monthlyPriceId: prices[productKey].monthly, annualPriceId: prices[productKey].annual, entitlements: planCatalog[productKey].entitlements, active: true },
  });
  const customer = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const periodEnd = subscription.items.data.reduce((latest, item) => Math.max(latest, item.current_period_end), 0);
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: { userId, planId: plan.id, stripeCustomerId: customer, stripeSubscriptionId: subscription.id, status: statuses[subscription.status], currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null, cancelAtPeriodEnd: subscription.cancel_at_period_end },
    update: { planId: plan.id, status: statuses[subscription.status], currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null, cancelAtPeriodEnd: subscription.cancel_at_period_end },
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const raw = await request.text();
  const { stripe, webhookSecret } = stripeConfig();
  if (!signature || !webhookSecret) return Response.json({ error: "Webhook is not configured" }, { status: 503 });
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(raw, signature, webhookSecret); }
  catch { return Response.json({ error: "Invalid webhook signature" }, { status: 400 }); }

  try {
    await prisma.stripeEvent.create({ data: { id: event.id, type: event.type, livemode: event.livemode, payloadHash: createHash("sha256").update(raw).digest("hex") } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return Response.json({ received: true, duplicate: true });
    throw error;
  }

  try {
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") await synchronizeSubscription(event.data.object);
    await prisma.stripeEvent.update({ where: { id: event.id }, data: { processedAt: new Date() } });
    return Response.json({ received: true });
  } catch (error) {
    await prisma.stripeEvent.update({ where: { id: event.id }, data: { error: error instanceof Error ? error.message.slice(0, 500) : "Unknown processing error" } });
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
