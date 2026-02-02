import { cookies } from "next/headers";

const CSRF_COOKIE = "csrf";

export function getCsrfCookie() {
  return cookies().get(CSRF_COOKIE)?.value || null;
}

export function validateCsrfToken(header: string | null, cookie: string | null) {
  return Boolean(header && cookie && header === cookie);
}

export function validateCsrf(req: Request) {
  const header = req.headers.get("x-csrf-token");
  const cookie = getCsrfCookie();
  return validateCsrfToken(header, cookie);
}
