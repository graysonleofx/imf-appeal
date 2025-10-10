import { NextResponse } from "next/server";
import { google } from "googleapis";
import supabase from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { accessToken, messageId, action } = await req.json();
    if (!accessToken || !messageId)
      return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    if (action === "delete") {
      await gmail.users.messages.trash({ userId: "me", id: messageId });
      await supabase
        .from("gmail_messages")
        .update({ labelIds: ["TRASH"] })
        .eq("id", messageId);
      console.log("🗑️ Moved to Trash:", messageId);
    } else if (action === "restore") {
      await gmail.users.messages.untrash({ userId: "me", id: messageId });
      await supabase
        .from("gmail_messages")
        .update({ labelIds: ["INBOX"] })
        .eq("id", messageId);
      console.log("♻ Restored:", messageId);
    } else if (action === "permanent") {
      await gmail.users.messages.delete({ userId: "me", id: messageId });
      await supabase.from("gmail_messages").delete().eq("id", messageId);
      console.log("🚮 Permanently deleted:", messageId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
