type Details = Record<string, string | number | boolean | null | undefined>;

export function logServerEvent(event: string, details: Details = {}) {
  console.info(JSON.stringify({ level: "info", event, ...details, timestamp: new Date().toISOString() }));
}

export function logServerError(event: string, error: unknown, details: Details = {}) {
  const message = error instanceof Error ? error.message : "Unknown server error";
  console.error(JSON.stringify({ level: "error", event, message, ...details, timestamp: new Date().toISOString() }));
}
