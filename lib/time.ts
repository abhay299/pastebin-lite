const TEST_MODE_ENABLED = process.env.TEST_MODE === "1";

export function getNow(req?: Request): number {
  if (!TEST_MODE_ENABLED) {
    return Date.now();
  }

  if (!req) {
    return Date.now();
  }

  const headerValue = req.headers.get("x-test-now-ms");

  if (!headerValue) {
    return Date.now();
  }

  const parsed = Number(headerValue);

  if (Number.isNaN(parsed)) {
    return Date.now();
  }

  return parsed;
}
