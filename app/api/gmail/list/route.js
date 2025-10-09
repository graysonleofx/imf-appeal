import { NextResponse } from "next/server";
import { google } from "googleapis";
import supabase from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { accessToken, userEmail, labelIds } = await req.json();

    if (!accessToken || !userEmail) {
      return NextResponse.json(
        { error: "Missing access token or user email" },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // ✅ Get label list for this user
    const labelListRes = await gmail.users.labels.list({ userId: "me" });
    const allLabels = labelListRes.data.labels || [];
    console.log(`✅ Gmail labels fetched: ${allLabels.length}`);

    // ✅ Default fallback label (if none specified)
    const activeLabelIds =
      labelIds && labelIds.length > 0 ? labelIds : ["INBOX"];

    // ✅ Fetch messages from Gmail
    const listRes = await gmail.users.messages.list({
      userId: "me",
      labelIds: activeLabelIds,
      maxResults: 100,
    });

    const messages = listRes.data.messages || [];
    if (messages.length === 0) {
      console.log("⚠️ No messages found in", activeLabelIds);
      return NextResponse.json({ success: true, count: 0 });
    }

    // ✅ Fetch message details
    const detailedMessages = await Promise.all(
      messages.map(async (msg) => {
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

          // ✅ Extract plain text body
          let body = "";
          const parts = msgRes.data.payload?.parts || [];
          const textPart = parts.find(
            (part) => part.mimeType === "text/plain" && part.body?.data
          );
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
          } else if (msgRes.data.payload?.body?.data) {
            body = Buffer.from(msgRes.data.payload.body.data, "base64").toString(
              "utf-8"
            );
          }

          return {
            id: msg.id,
            user_email: userEmail.toLowerCase(),
            subject,
            from,
            snippet,
            body,
            labelIds: messageLabels,
            created_at: new Date().toISOString(),
          };
        } catch (err) {
          console.error("❌ Error fetching message:", msg.id, err);
          return null;
        }
      })
    );

    const validMessages = detailedMessages.filter(Boolean);

    // ✅ Insert or update in Supabase
    const { error } = await supabase
      .from("gmail_messages")
      .upsert(validMessages, {
        onConflict: "id",
        ignoreDuplicates: false,
      });

    if (error) {
      console.error("❌ Supabase upsert error:", error);
      return NextResponse.json(
        { error: "Failed to save messages", details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Synced ${validMessages.length} messages for ${userEmail}`);
    return NextResponse.json({ success: true, count: validMessages.length });
  } catch (error) {
    console.error("❌ Gmail sync server error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
