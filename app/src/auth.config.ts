import type { NextAuthConfig } from "next-auth";

/**
 * Configuração "leve" do NextAuth: sem adapter/Prisma e sem providers que
 * precisam de banco. Usada pelo proxy.ts (rodando em ambiente restrito),
 * pra evitar que o driver do Postgres (`pg`) seja importado ali.
 * A configuração completa (com adapter e providers) fica em auth.ts.
 */
export const authConfig = {
  providers: [],
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: "USER" | "OWNER" | "ADMIN" }).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "OWNER" | "ADMIN";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
