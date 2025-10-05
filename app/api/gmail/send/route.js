import { getServerSession } from "next-auth";
import { google } from "googleapis";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SendEmail } from "../../../../lib/gmail";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }
    if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const body = await req.json();
  if (!body.to || !body.subject || !body.body) {
    return new Response("Missing parameters", { status: 400 });
  }

    const { to, subject, body: emailBody } = body;

  try {
    const gmail = google.gmail({ version: "v1" });
    const raw = Buffer.from(
      `From: ${session.user.email}\r\nTo: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${emailBody}`
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      auth: accessToken,
      requestBody: { raw },
    });

    return new Response("Email sent", { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response("Error sending email", { status: 500 });
  }

}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { accessToken, userEmail, to, subject, body } = req.body;
  if (!accessToken || !userEmail || !to || !body)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const gmail = google.gmail({ version: "v1" });
    const raw = Buffer.from(
      `From: ${userEmail}\r\nTo: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${body}`
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      auth: accessToken,
      requestBody: { raw },
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}