import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import SteamProvider from "./steam-provider";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    SteamProvider({
      clientId: "steam", // Not used by Steam OpenID but required by NextAuth
      clientSecret: process.env.STEAM_API_KEY || "",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch additional user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { steamId: true, username: true, avatar: true },
        });
        if (dbUser) {
          session.user.steamId = dbUser.steamId;
          session.user.username = dbUser.username;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "steam" && profile) {
        // Update or create user with Steam data
        await prisma.user.upsert({
          where: { id: user.id },
          create: {
            id: user.id,
            steamId: profile.steamid as string,
            username: profile.personaname as string,
            avatar: profile.avatarfull as string,
          },
          update: {
            username: profile.personaname as string,
            avatar: profile.avatarfull as string,
          },
        });
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
});
