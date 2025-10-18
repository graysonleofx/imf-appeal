// import { NextResponse } from "next/server";
// import { google } from "googleapis";
// import supabase from "@/lib/supabaseClient";

// export async function POST(req) {
//   try {
//     const { accessToken, refreshToken, userEmail, labelIds } = await req.json();

//     if (!accessToken || !userEmail) {
//       return NextResponse.json(
//         { error: "Missing access token or user email" },
//         { status: 400 }
//       );
//     }

//     const oauth2Client = new google.auth.OAuth2();
//     oauth2Client.setCredentials({
//       access_token: accessToken,
//       refresh_token: refreshToken, // optional but needed for refresh
//     });

//     // ✅ Refresh token if expired
//     try {
//       const newToken = await oauth2Client.getAccessToken();
//       if (newToken.token) {
//         oauth2Client.setCredentials({ access_token: newToken.token });
//       }
//     } catch (err) {
//       console.error("❌ Failed to refresh token:", err);
//       return NextResponse.json(
//         { error: "Invalid or expired token", details: err.message },
//         { status: 401 }
//       );
//     }

//     const gmail = google.gmail({ version: "v1", auth: oauth2Client });

//     // ✅ Use default label if none provided
//     const activeLabelIds = labelIds && labelIds.length > 0 ? labelIds : ["INBOX"];

//     // ✅ List messages
//     let messagesList;
//     try {
//       const listRes = await gmail.users.messages.list({
//         userId: "me",
//         labelIds: activeLabelIds,
//         maxResults: 100,
//       });
//       messagesList = listRes.data.messages || [];
//     } catch (err) {
//       console.error("❌ Gmail API list error:", err.response?.data || err.message);
//       return NextResponse.json(
//         { error: "Gmail API list error", details: err.response?.data || err.message },
//         { status: 500 }
//       );
//     }

//     if (messagesList.length === 0) {
//       return NextResponse.json({ success: true, count: 0 });
//     }

//     // ✅ Fetch full message details
//     const detailedMessages = await Promise.all(
//       messagesList.map(async (msg) => {
//         try {
//           const msgRes = await gmail.users.messages.get({
//             userId: "me",
//             id: msg.id,
//             format: "full",
//           });

//           const headers = msgRes.data.payload?.headers || [];
//           const getHeader = (name) =>
//             headers.find((h) => h.name === name)?.value || "";

//           const subject = getHeader("Subject") || "(No Subject)";
//           const from = getHeader("From") || "(Unknown)";
//           const snippet = msgRes.data.snippet || "";
//           const messageLabels = msgRes.data.labelIds || [];

//           // Extract plain text or fallback to HTML stripped
//           let body = "";
//           const parts = msgRes.data.payload?.parts || [];
//           const textPart = parts.find(
//             (part) => part.mimeType === "text/plain" && part.body?.data
//           );
//           if (textPart?.body?.data) {
//             body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
//           } else if (msgRes.data.payload?.body?.data) {
//             body = Buffer.from(msgRes.data.payload.body.data, "base64").toString("utf-8");
//           }

//           return {
//             id: msg.id,
//             user_email: userEmail.toLowerCase(),
//             subject,
//             from,
//             snippet,
//             body: body || "",
//             labelIds: messageLabels,
//             created_at: new Date().toISOString(),
//           };
//         } catch (err) {
//           console.error("❌ Error fetching message:", msg.id, err.response?.data || err.message);
//           return null;
//         }
//       })
//     );

//     const validMessages = detailedMessages.filter(Boolean);

//     if (validMessages.length === 0) {
//       return NextResponse.json({ success: true, count: 0 });
//     }

//     // ✅ Upsert messages into Supabase
//     const { error: supabaseError } = await supabase
//       .from("gmail_messages")
//       .upsert(validMessages, {
//         onConflict: "id, user_email",
//         ignoreDuplicates: false,
//       });

//     if (supabaseError) {
//       console.error("❌ Supabase upsert error:", supabaseError);
//       return NextResponse.json(
//         { error: "Failed to save messages", details: supabaseError.message },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({ success: true, count: validMessages.length });
//   } catch (error) {
//     console.error("❌ Gmail sync server error:", error);
//     return NextResponse.json(
//       { error: "Internal server error", details: error.message },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from "next/server";
import { google } from "googleapis";
import supabase from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const body = await req.json();
    let { accessToken, refreshToken, userEmail, labelIds, userId } = body;

    // ✅ If admin viewing another user, fetch their Gmail tokens automatically
    if (!accessToken && userId) {
      const { data: tokenRow, error: tokenError } = await supabase
        .from("gmail_tokens")
        .select("access_token, refresh_token, email")
        .eq("user_id", userId)
        .single();

      if (tokenError || !tokenRow) {
        return NextResponse.json(
          { error: "No Gmail token found for that user" },
          { status: 404 }
        );
      }

      accessToken = tokenRow.access_token;
      refreshToken = tokenRow.refresh_token;
      userEmail = tokenRow.email;
    }

    if (!accessToken || !userEmail) {
      return NextResponse.json(
        { error: "Missing access token or user email" },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken || undefined,
    });

    // ✅ Attempt token refresh if expired
    try {
      const newToken = await oauth2Client.getAccessToken();
      if (newToken?.token) {
        oauth2Client.setCredentials({ access_token: newToken.token });
      }
    } catch (err) {
      console.error("❌ Failed to refresh token:", err);
      return NextResponse.json(
        { error: "Invalid or expired token", details: err.message },
        { status: 401 }
      );
    }

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // ✅ Default label to INBOX if none specified
    const activeLabelIds = labelIds && labelIds.length > 0 ? labelIds : ["INBOX"];

    // ✅ List messages
    let messagesList;
    try {
      const listRes = await gmail.users.messages.list({
        userId: "me",
        labelIds: activeLabelIds,
        maxResults: 100,
      });
      messagesList = listRes.data.messages || [];
    } catch (err) {
      console.error("❌ Gmail API list error:", err.response?.data || err.message);
      return NextResponse.json(
        { error: "Gmail API list error", details: err.response?.data || err.message },
        { status: 500 }
      );
    }

    if (messagesList.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // ✅ Fetch full message details
    const detailedMessages = await Promise.all(
      messagesList.map(async (msg) => {
        try {
          const msgRes = await gmail.users.messages.get({
            userId: "me",
            id: msg.id,
            format: "full",
          });

          const headers = msgRes.data.payload?.headers || [];
          const getHeader = (name) =>
            headers.find((h) => h.name === name)?.value || "";

          const subject = getHeader("Subject") || "(No Subject)";
          const from = getHeader("From") || "(Unknown)";
          const snippet = msgRes.data.snippet || "";
          const messageLabels = msgRes.data.labelIds || [];

          // Extract plain text body if available
          let body = "";
          const parts = msgRes.data.payload?.parts || [];
          const textPart = parts.find(
            (part) => part.mimeType === "text/plain" && part.body?.data
          );
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
          } else if (msgRes.data.payload?.body?.data) {
            body = Buffer.from(msgRes.data.payload.body.data, "base64").toString("utf-8");
          }

          return {
            id: msg.id,
            user_email: userEmail.toLowerCase(),
            subject,
            from,
            snippet,
            body: body || "",
            labelIds: messageLabels,
            created_at: new Date().toISOString(),
          };
        } catch (err) {
          console.error("❌ Error fetching message:", msg.id, err.response?.data || err.message);
          return null;
        }
      })
    );

    const validMessages = detailedMessages.filter(Boolean);

    if (validMessages.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // ✅ Upsert into gmail_messages table
    const { error: supabaseError } = await supabase
      .from("gmail_messages")
      .upsert(validMessages, {
        onConflict: "id, user_email",
        ignoreDuplicates: false,
      });

    if (supabaseError) {
      console.error("❌ Supabase upsert error:", supabaseError);
      return NextResponse.json(
        { error: "Failed to save messages", details: supabaseError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, count: validMessages.length });
  } catch (error) {
    console.error("❌ Gmail sync server error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
