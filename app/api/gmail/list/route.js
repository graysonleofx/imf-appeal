import { google } from "googleapis";

export async function GET(req) {
  const accessToken = req.headers.get("authorization")?.split("Bearer")[1];

  const gmailRes = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}