import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import supabase from "../../../../lib/supabaseClient";  

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
            scope: ["https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid email https://www.googleapis.com/auth/gmail.send  https://www.googleapis.com/auth/gmail.modify"].join(" "), 
            access_type: "offline",
            prompt: "consent",
            response_type: "code"
          },
        },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {  
        session.user.id = token.sub;
        session.user.email = token.email;
        session.user.name = token.name;
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
      }
      return session;
    },

    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.email = profile.email;
        token.name = profile.name;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        // console.log("JWT Profile:", profile);
        // console.log("JWT Account:", account);
        // Store user info in Supabase
        const {data, error} = await supabase 
         .from('gmail_users')
         .insert([
          { 
            id: profile.sub,
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            access_token: account.access_token,
            refresh_token: account.refresh_token
          }
        ]);

        if (error) {
          console.error("Supabase Insert Error:", error);
        } else {
          console.log("Supabase Insert Success:", data);

          // If user already exists, update their tokens
          const { data: existingUser, error: fetchError } = await supabase
            .from('gmail_users')
            .select('*')
            .eq('id', profile.sub)
            .single();
          if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "No rows found" error
            console.error("Supabase Fetch Error:", fetchError);
          } else if (existingUser) {
            // Update existing user tokens
            const { data: updateData, error: updateError } = await supabase
              .from('gmail_users')
              .update({
                accessToken: account.access_token,
                refreshToken: account.refresh_token
              })
              .eq('id', profile.sub);

            if (updateError) {
              console.error("Supabase Update Error:", updateError);
            } else {
              console.log("Supabase Update Success:", updateData);
            }
          }
        }
      }

      return token;
    }
    
  },
  secret: process.env.NEXTAUTH_SECRET,
})


export {handler as GET, handler as POST}






// export async function GET(req) {
//   // const authHeader = req.headers.get("authorization");
//   // const token = authHeader?.split(" ")[1];

//   const url = new URL(req.url);
//   const token = url.searchParams.get("token");
//   const label = url.searchParams.get("label") || "INBOX";

//   console.log("Label:", label);

//   if(!token){
//     return NextResponse.json({error: 'Missing access token'}, {status: 400}, { headers: { 'Content-Type': 'application/json' } });
//   }

//     const {data: { accessToken }} = await supabase
//     .from('gmail_users')
//     .select('accessToken')
//     .eq('accessToken', token)
//     .single();

//     if(error || !accessToken){
//       return NextResponse.json({error: 'Invalid access token'}, {status: 401}, { headers: { 'Content-Type': 'application/json' } });
//     }

//     const oauth2Client = new google.auth.OAuth2();

//     oauth2Client.setCredentials({ access_token: accessToken });

//     const gmail = google.gmail({ version: "v1", auth: oauth2Client });


//   try {
//     const messagesRes = await gmail.users.messages.list({
//       userId: "me",
//       labelIds: [label],
//       maxResults: 1000,
//     });

//     const messages = messagesRes.data.messages || [];
//     const detailedMessages = await Promise.all(
//       messages.map(async (msg) => {
//         const msgRes = await gmail.users.messages.get({
//           userId: "me",
//           id: msg.id,
//         });
//         const headers = msgRes.data.payload.headers;
//         const getHeader = (name) => headers.find((h) => h.name === name)?.value || "";
//         return {
//           id: msgRes.data.id,
//           subject: getHeader("Subject"),
//           from: getHeader("From"),
//           data: msgRes.data,
//           message: msgRes.data.snippet,
//         };
//       })
//     );

//     return NextResponse.json(detailedMessages || [], { status: 200 });
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     return NextResponse.json({ error: "Error fetching messages" }, { status: 500 }, { headers: { 'Content-Type': 'application/json' } });
//   }
// }