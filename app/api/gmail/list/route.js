import { NextResponse } from "next/server";
import { google } from "googleapis";
import supabase from "@/lib/supabaseClient";

// ✅ Gmail labels map
const LABEL_MAP = {
  INBOX: "INBOX",
  SENT: "SENT",
  DRAFT: "DRAFT",
  SPAM: "SPAM",
  TRASH: "TRASH",
  ALL_MAIL: "CATEGORY_PERSONAL", // Gmail's "All Mail" may map differently
  CATEGORY: "CATEGORY_PERSONAL",
};

/**
 * ✅ POST: Sync Gmail messages for a specific user
 * Expects JSON body: { accessToken, userEmail, labelIds? }
 */
export async function POST(req) {
  try {
    const { accessToken, userEmail, labelIds } = await req.json();

    if (!accessToken || !userEmail) {
      console.error("❌ Missing required parameters");
      return NextResponse.json(
        { error: "Missing access token or user email" },
        { status: 400 }
      );
    }

    console.log("🔍 Starting Gmail sync for:", userEmail);
    console.log("📦 Labels requested:", labelIds || Object.keys(LABEL_MAP));

    // Initialize Google OAuth client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const labelsToFetch = labelIds?.length
      ? labelIds
      : Object.values(LABEL_MAP);

    let allMessages = [];

    // ✅ Loop through each label
    for (const label of labelsToFetch) {
      console.log(`📬 Fetching Gmail label: ${label}`);

      const listRes = await gmail.users.messages.list({
        userId: "me",
        labelIds: [label],
        includeSpamTrash: true, // ✅ ensures Spam/Trash messages appear
        maxResults: 50,
      });

      const messages = listRes.data.messages || [];
      console.log(`✅ Found ${messages.length} messages in ${label}`);

      if (messages.length === 0) continue;

      // Fetch full message details
      for (const msg of messages) {
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
          const from = getHeader("From") || "(Unknown Sender)";
          const snippet = msgRes.data.snippet || "";
          const msgLabels = msgRes.data.labelIds || [];
          const parts = msgRes.data.payload?.parts || [];

          let body = "";
          const textPart = parts.find(
            (p) => p.mimeType === "text/plain" && p.body?.data
          );

          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
          } else if (msgRes.data.payload?.body?.data) {
            body = Buffer.from(
              msgRes.data.payload.body.data,
              "base64"
            ).toString("utf-8");
          }

          allMessages.push({
            id: msg.id,
            user_email: userEmail.toLowerCase(),
            subject,
            from,
            snippet,
            body,
            labelIds: msgLabels,
            unread: msgLabels.includes("UNREAD"),
            created_at: new Date().toISOString(),
          });
        } catch (msgErr) {
          console.error(`⚠️ Failed to fetch message ${msg.id}:`, msgErr);
        }
      }
    }

    // ✅ Save messages to Supabase
    if (allMessages.length > 0) {
      const { error: insertError } = await supabase
        .from("gmail_messages")
        .upsert(allMessages, { onConflict: "id" });

      if (insertError) {
        console.error("❌ Supabase insert error:", insertError);
        return NextResponse.json(
          { error: "Failed to save messages" },
          { status: 500 }
        );
      }

      console.log(`✅ Synced ${allMessages.length} messages for ${userEmail}`);
    } else {
      console.log(`ℹ️ No messages found for ${userEmail}.`);
    }

    return NextResponse.json({
      success: true,
      count: allMessages.length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Gmail sync fatal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
