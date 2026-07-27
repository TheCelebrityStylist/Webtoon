import { GoogleConnectionError } from "@/integrations/google/client";
import { AuthorizationError, ResourceNotFoundError } from "./authorization";

export function apiErrorResponse(error: unknown) {
  if (error instanceof ResourceNotFoundError) return Response.json({ error: error.message, code: "NOT_FOUND" }, { status: 404 });
  if (error instanceof AuthorizationError) return Response.json({ error: error.message, code: "FORBIDDEN" }, { status: 403 });
  if (error instanceof GoogleConnectionError) {
    const status = error.status >= 500 ? 502 : error.status;
    return Response.json({ error: error.message, code: "GOOGLE_PROVIDER_ERROR" }, { status });
  }
  return Response.json({ error: "The operation could not be completed", code: "INTERNAL_ERROR" }, { status: 500 });
}
