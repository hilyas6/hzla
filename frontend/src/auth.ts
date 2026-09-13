import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { isOtpValid } from "@/lib/otp";

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
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        const otp = credentials?.otp;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const { rows } = await pool.query(
          `SELECT id, email, password_hash, role, email_verified,
                  two_factor_enabled, otp_code_hash, otp_expires_at
           FROM users WHERE email = $1`,
          [email.toLowerCase()]
        );
        const user = rows[0];
        if (!user) return null;

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return null;

        // Both signup verification and login 2FA reuse the same OTP columns,
        // so this covers whichever step is pending for this account.
        if (!user.email_verified || user.two_factor_enabled) {
          if (typeof otp !== "string" || !isOtpValid(user, otp)) return null;

          await pool.query(
            `UPDATE users SET email_verified = true, otp_code_hash = NULL,
                    otp_expires_at = NULL WHERE id = $1`,
            [user.id]
          );
        }

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
