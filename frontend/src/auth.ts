import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { isOtpValid } from "@/lib/otp";
import { clientIp } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit-log";
import { createSession } from "@/lib/sessions";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Google,
    Credentials({
      credentials: {
        email: {},
        password: {},
        otp: {},
        remember: {},
      },
      async authorize(credentials, request) {
        const email = credentials?.email;
        const password = credentials?.password;
        const otp = credentials?.otp;
        const remember = credentials?.remember === "true";
        const ip = clientIp(request);
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }
        const normalizedEmail = email.toLowerCase();

        const { rows } = await pool.query(
          `SELECT id, email, password_hash, role, email_verified,
                  two_factor_enabled, otp_code_hash, otp_expires_at, is_suspended
           FROM users WHERE email = $1`,
          [normalizedEmail]
        );
        const user = rows[0];
        // No row, or a Google-only account with no password set.
        if (!user || !user.password_hash) {
          await logAudit({
            userId: user?.id ?? null,
            action: "login_failure",
            ip,
            metadata: { email: normalizedEmail },
          });
          return null;
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
          await logAudit({ userId: user.id, action: "login_failure", ip });
          return null;
        }

        // login-init already blocks suspended accounts, but that's just a
        // UX gate — this is the actual credential check, so enforce it here too.
        if (user.is_suspended) {
          await logAudit({ userId: user.id, action: "login_failure", ip, metadata: { reason: "suspended" } });
          return null;
        }

        // Signup verification, login 2FA, and password reset all reuse the
        // same OTP columns (one pending code per account), so this covers
        // whichever step is pending for this account.
        if (!user.email_verified || user.two_factor_enabled) {
          if (typeof otp !== "string" || !isOtpValid(user, otp)) {
            await logAudit({ userId: user.id, action: "login_failure", ip, metadata: { reason: "otp" } });
            return null;
          }

          await pool.query(
            `UPDATE users SET email_verified = true, otp_code_hash = NULL,
                    otp_expires_at = NULL WHERE id = $1`,
            [user.id]
          );
        }

        const sessionId = await createSession({
          userId: user.id,
          remember,
          userAgent: request.headers.get("user-agent"),
          ip,
        });

        await logAudit({ userId: user.id, action: "login_success", ip });
        return { id: user.id, email: user.email, role: user.role, sessionId };
      },
    }),
  ],
  callbacks: {
    // Google has no local password/2FA/verification story — this just
    // finds-or-creates the matching row in our own `users` table (keyed by
    // email, since we don't run the full Auth.js DB adapter) so the rest of
    // the app keeps working off one id/role, same as a credentials login.
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      const email = user.email?.toLowerCase();
      if (!email) return false;

      const { rows } = await pool.query(
        "SELECT id, role, is_suspended FROM users WHERE email = $1",
        [email]
      );
      let dbUser = rows[0];
      if (!dbUser) {
        const inserted = await pool.query(
          `INSERT INTO users (email, email_verified, name)
           VALUES ($1, true, $2) RETURNING id, role, is_suspended`,
          [email, user.name ?? null]
        );
        dbUser = inserted.rows[0];
        await logAudit({ userId: dbUser.id, action: "signup", metadata: { provider: "google" } });
      }
      if (dbUser.is_suspended) return false;

      user.id = dbUser.id;
      user.role = dbUser.role;
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role as string;
        token.id = user.id as string;
        if (user.sessionId) {
          token.sessionId = user.sessionId;
        } else if (account?.provider === "google") {
          // No raw request available here to capture IP/user-agent for an
          // OAuth login, unlike the credentials `authorize` path.
          token.sessionId = await createSession({ userId: user.id as string, remember: true });
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.sessionId = token.sessionId as string;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      const token = "token" in message ? message.token : undefined;
      if (token?.sessionId) {
        await pool.query("DELETE FROM sessions WHERE id = $1", [token.sessionId]);
      }
    },
  },
  pages: {
    signIn: "/login",
  },
});
