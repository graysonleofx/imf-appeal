import { debug } from "console";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            // scope: [
            //   "openid",
            //   "email",
            //   "https://www.googleapis.com/auth/userinfo.email",
            //   "https://www.googleapis.com/auth/userinfo.profile",
            //   "https://www.googleapis.com/auth/user.emails.read",
            //   "https://www.googleapis.com/auth/gmail.send",
            //   "https://mail.google.com"
            // ].join(''),
            scope: ["https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid email https://www.googleapis.com/auth/user.emails.read https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://mail.google.com/"].join(" "), 
            access_type: "offline",
            prompt: "consent"
          },
        },
    }),
  ],
  // session: {
  //   strategy: "jwt",
  // },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.email = profile.email;
        token.name = profile.name;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }

      return token;
    },
    async session({ session, token}) {
      if(token){
        session.user.email = token.email
        session.user.name = token.name
      }
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      // session.user.email = user.email;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})


export {handler as GET, handler as POST}