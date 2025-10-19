import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const {
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} = process.env;

function base64UrlEncode(str) {
  return Buffer.from(str, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function POST(request) {
  try {
    // env checks
    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("[api/gmail/send] Missing SUPABASE_URL or SUPABASE_ANON_KEY");
      return NextResponse.json({ error: "Server missing SUPABASE_URL or SUPABASE_ANON_KEY" }, { status: 500 });
    }
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("[api/gmail/send] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
      return NextResponse.json({ error: "Server missing Google client credentials" }, { status: 500 });
    }

    // create Supabase client server-side (safe at runtime)
    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const payload = await request.json().catch(() => ({}));
    console.log("[api/gmail/send] incoming body:", payload);

    const { userId, to, subject, body: htmlBody } = payload || {};
    if (!userId || !to || !subject || !htmlBody) {
      console.warn("[api/gmail/send] missing fields");
      return NextResponse.json({ error: "Missing fields: userId, to, subject and body are required." }, { status: 400 });
    }

    // DB read
    const { data: user, error: dbErr } = await supabase
      .from("gmail_users")
      .select("email, refresh_token")
      .eq("id", userId)
      .maybeSingle();

    console.log("[api/gmail/send] supabase result:", { user, dbErr });
    if (dbErr) {
      console.error("[api/gmail/send] Supabase read error:", dbErr);
      return NextResponse.json({ error: "Failed to read user from DB", details: dbErr.message }, { status: 500 });
    }
    if (!user) {
      console.warn("[api/gmail/send] user not found:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!user.refresh_token) {
      console.warn("[api/gmail/send] user missing refresh_token:", userId);
      return NextResponse.json({ error: "No refresh_token stored for user" }, { status: 400 });
    }

    // Exchange refresh_token -> access_token
    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: user.refresh_token,
      }),
    });

    const tokenJson = await tokenResp.json().catch(() => ({}));
    console.log("[api/gmail/send] token exchange response:", { status: tokenResp.status, tokenJson });
    if (!tokenResp.ok || !tokenJson.access_token) {
      console.error("[api/gmail/send] token exchange failed:", tokenJson);
      return NextResponse.json({ error: "Failed to refresh access token", details: tokenJson }, { status: 401 });
    }
    const accessToken = tokenJson.access_token;

    // Build raw message
    const fromHeader = user.email || "me";
    const parts = [
      `From: ${fromHeader}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset="UTF-8"`,
      "",
      htmlBody,
    ];
    const raw = base64UrlEncode(parts.join("\r\n"));

    // Send message
    const sendResp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });

    const sendJson = await sendResp.json().catch(() => ({}));
    console.log("[api/gmail/send] gmail send response:", { status: sendResp.status, sendJson });
    if (!sendResp.ok) {
      return NextResponse.json({ error: "Gmail send failed", details: sendJson }, { status: sendResp.status || 500 });
    }

    // Persist new access token (optional)
    try {
      await supabase
        .from("gmail_users")
        .update({ access_token: accessToken, accessToken: accessToken })
        .eq("id", userId);
    } catch (e) {
      console.warn("[api/gmail/send] failed to persist access_token:", e.message);
    }

    return NextResponse.json({ success: true, result: sendJson }, { status: 200 });
  } catch (err) {
    console.error("[api/gmail/send] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error", details: String(err?.message || err) }, { status: 500 });
  }
}