// Smoke test for the signup/login flow. Run against a live dev server:
//   npm run dev &  node scripts/smoke-test-auth.mjs
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const email = `smoke-${Date.now()}@example.com`;
const password = "correct-horse-battery";

function extractCookie(res) {
  const raw = res.headers.get("set-cookie") ?? "";
  return raw.split(",").map((c) => c.split(";")[0]).join("; ");
}

async function signup(body) {
  return fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function login(email, password) {
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const cookie = extractCookie(csrfRes);
  const { csrfToken } = await csrfRes.json();

  const res = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookie,
    },
    body: new URLSearchParams({ email, password, csrfToken, json: "true" }),
  });
  return extractCookie(res).includes("session-token");
}

async function main() {
  const signupRes = await signup({ email, password });
  assert.equal(signupRes.status, 200, "signup should succeed");

  const dupRes = await signup({ email, password });
  assert.equal(dupRes.status, 409, "duplicate signup should be rejected");

  const badRes = await signup({ email: "not-an-email", password: "short" });
  assert.equal(badRes.status, 400, "invalid signup input should be rejected");

  const wrongLogin = await login(email, "wrong-password");
  assert.equal(wrongLogin, false, "wrong password should not create a session");

  const rightLogin = await login(email, password);
  assert.equal(rightLogin, true, "correct credentials should create a session");

  console.log("all auth smoke tests passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
