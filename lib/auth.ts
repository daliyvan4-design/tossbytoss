import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

export const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/compte" },
  providers: [
    ...(googleEnabled
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })]
      : []),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;
        const { db } = await import("@/lib/db");
        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        // Email non vérifié → connexion refusée (l'UI propose de renvoyer le code).
        if (!user.emailVerified) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const { db } = await import("@/lib/db");
        const email = user.email.toLowerCase();
        const existing = await db.user.findUnique({ where: { email } });
        if (!existing) {
          // Nouveau compte Google → créer + email de bienvenue (déjà vérifié par Google)
          await db.user.create({
            data: { email, name: user.name, image: user.image, provider: "google", emailVerified: new Date() },
          }).catch(console.error);
          const { sendAccountWelcome } = await import("@/lib/resend");
          await sendAccountWelcome({ name: user.name, email }).catch(console.error);
        } else {
          await db.user.update({
            where: { email },
            data: { name: user.name ?? undefined, image: user.image ?? undefined, emailVerified: existing.emailVerified ?? new Date() },
          }).catch(console.error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) (session.user as { id?: string }).id = token.sub;
      return session;
    },
  },
});
