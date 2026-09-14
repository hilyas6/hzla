import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { isOtpValid } from "@/lib/otp";
import { clientIp } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit-log";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        otp: {},
      },
      async authorize(credentials, request) {
        const email = credentials?.email;
        const password = credentials?.password;
        const otp = credentials?.otp;
        const ip = clientIp(request);
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }
        const normalizedEmail = email.toLowerCase();

        const { rows } = await pool.query(
          `SELECT id, email, password_hash, role, email_verified,
                  two_factor_enabled, otp_code_hash, otp_expires_at
           FROM users WHERE email = $1`,
          [normalizedEmail]
        );
        const user = rows[0];
        if (!user) {
          await logAudit({ userId: null, action: "login_failure", ip, metadata: { email: normalizedEmail } });
          return null;
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
          await logAudit({ userId: user.id, action: "login_failure", ip });
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

        await logAudit({ userId: user.id, action: "login_success", ip });
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
