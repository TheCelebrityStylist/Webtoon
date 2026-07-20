import { handlers } from "@/auth";
import { getAuthAvailability } from "@/lib/runtime-config";
import { logServerEvent } from "@/lib/server-log";
import type { NextRequest } from "next/server";

function unavailable() {
  logServerEvent("auth.unavailable", { reason: "missing_secret" });
  return Response.json({ error: "Authentication is temporarily unavailable", code: "AUTH_NOT_CONFIGURED" }, { status: 503 });
}

export async function GET(request: NextRequest) {
  return getAuthAvailability().authConfigured ? handlers.GET(request) : unavailable();
}

export async function POST(request: NextRequest) {
  return getAuthAvailability().authConfigured ? handlers.POST(request) : unavailable();
}
