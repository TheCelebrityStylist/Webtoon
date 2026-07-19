import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { publicAppUrl, stripeConfig } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in to manage billing" }, { status: 401 });
  const subscription = await prisma.subscription.findFirst({ where: { userId: session.user.id }, orderBy: { updatedAt: "desc" } });
  if (!subscription) return Response.json({ error: "No subscription found" }, { status: 404 });
  const portal = await stripeConfig().stripe.billingPortal.sessions.create({ customer: subscription.stripeCustomerId, return_url: `${publicAppUrl(request)}/studio/settings` });
  return Response.json({ url: portal.url });
}
