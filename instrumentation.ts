// instrumentation.ts
// Sentry server-side setup

export async function register() {
  if (process.env["NEXT_RUNTIME"] === "nodejs" && process.env["SENTRY_DSN"]) {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env["SENTRY_DSN"],
      tracesSampleRate: process.env["NODE_ENV"] === "production" ? 0.1 : 1.0,
      debug: false,
    });
  }
}
