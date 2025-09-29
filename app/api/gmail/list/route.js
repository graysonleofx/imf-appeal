import { google } from "googleapis";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const messagesRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 100,
    });

    const messages = messagesRes.data.messages || [];
    const detailedMessages = await Promise.all(
      messages.map(async (msg) => {
        const msgRes = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
        });
        const headers = msgRes.data.payload.headers;
        const subjectHeader = headers.find((h) => h.name === "Subject");
        const fromHeader = headers.find((h) => h.name === "From");
        return {
          id: msgRes.data.id,
          subject: subjectHeader?.value,
          from: fromHeader?.value,
          message: msgRes.data,
        };
      })
    );

    return NextResponse.json(detailedMessages || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Error fetching messages" }, { status: 500 }, { headers: { 'Content-Type': 'application/json' } });
  }
}