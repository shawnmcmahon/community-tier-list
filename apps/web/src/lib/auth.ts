import NextAuth from "next-auth";
import Twitch from "next-auth/providers/twitch";

import { api } from "../../convex/_generated/api";
import { getServerConvexClient } from "@/lib/convex-server";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Twitch({
      clientId: process.env.AUTH_TWITCH_ID ?? "",
      clientSecret: process.env.AUTH_TWITCH_SECRET ?? "",
      authorization: {
        params: {
          scope: "openid",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const twitchUserId =
        account?.providerAccountId ??
        (typeof profile?.sub === "string" ? profile.sub : undefined);

      if (!twitchUserId) {
        return false;
      }

      const twitchDisplayName =
        user.name ??
        (typeof profile?.preferred_username === "string"
          ? profile.preferred_username
          : "Unknown");

      const convex = getServerConvexClient();
      await convex.mutation((api as any).users.upsertFromAuth, {
        twitchUserId,
        twitchDisplayName,
        twitchProfileImageUrl: user.image ?? undefined,
        role: "creator",
      });

      return true;
    },
    async jwt({ token, account, user }) {
      if (account?.provider === "twitch") {
        token.twitchUserId = account.providerAccountId;
      }

      if (user?.name) {
        token.twitchDisplayName = user.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.twitchUserId =
          typeof token.twitchUserId === "string" ? token.twitchUserId : undefined;
        session.user.twitchDisplayName =
          typeof token.twitchDisplayName === "string"
            ? token.twitchDisplayName
            : session.user.name ?? undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
