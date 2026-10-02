import { next } from "@vercel/edge";

// Gates the whole site behind one shared password, checked as a salted
// SHA-256 hash rather than a plaintext comparison. Both values are set as
// Vercel environment variables (never committed) — see AUTH-SETUP.md.
const SALT = process.env.AUTH_SALT || "";
const HASH = process.env.AUTH_PASSWORD_HASH || "";
const REALM = "ETS 2026 Tool Evaluation";

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function unauthorized() {
  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${REALM}"` }
  });
}

export default async function middleware(request) {
  // Fail open if the env vars aren't set yet, so a missing config doesn't
  // lock everyone out by accident — this should never be the case once
  // AUTH-SETUP.md has been followed for the live event.
  if (!HASH) return next();

  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Basic ")) return unauthorized();

  let password;
  try {
    const decoded = atob(auth.slice(6));
    // Basic auth sends "username:password" — the username is ignored,
    // participants can type anything (or leave it blank) in that field.
    password = decoded.slice(decoded.indexOf(":") + 1);
  } catch {
    return unauthorized();
  }

  const hash = await sha256Hex(SALT + password);
  if (hash !== HASH) return unauthorized();

  return next();
}

export const config = {
  matcher: "/((?!favicon.ico).*)"
};
