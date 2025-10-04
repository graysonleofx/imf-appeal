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
    await SendEmail({ to, subject, body: emailBody, accessToken, from: session.user.email });
    return new Response("Email sent", { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response("Error sending email", { status: 500 });
  }

}