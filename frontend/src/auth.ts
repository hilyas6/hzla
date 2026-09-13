import crypto from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

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
        if (
          typeof email !== "string" ||
          typeof password !== "string" ||
          typeof otp !== "string"
        ) {
          return null;
        }

        const { rows } = await pool.query(
          "SELECT id, email, password_hash, role, otp_code_hash, otp_expires_at FROM users WHERE email = $1",
          [email.toLowerCase()]
        );
        const user = rows[0];
        if (!user) return null;

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return null;

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        const otpValid =
          user.otp_code_hash === otpHash &&
          user.otp_expires_at &&
          new Date(user.otp_expires_at) > new Date();
        if (!otpValid) return null;

        await pool.query(
          "UPDATE users SET otp_code_hash = NULL, otp_expires_at = NULL WHERE id = $1",
          [user.id]
        );

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
