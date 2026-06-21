import DiscordProvider from "next-auth/providers/discord";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId:     process.env.DISCORD_CLIENT_ID     ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "identify guilds" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken   = account.access_token;
        token.discordId     = profile.id;
        token.avatar        = profile.avatar;
        token.discriminator = profile.discriminator;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.discordId = token.discordId;
      session.user.avatar    = token.avatar
        ? `https://cdn.discordapp.com/avatars/${token.discordId}/${token.avatar}.png?size=64`
        : `https://cdn.discordapp.com/embed/avatars/0.png`;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: { signIn: "/" },
  secret: process.env.NEXTAUTH_SECRET,
};
