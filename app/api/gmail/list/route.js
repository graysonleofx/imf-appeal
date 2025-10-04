import { NextResponse } from "next/server";
import { google } from "googleapis";
import supabase from "@/lib/supabaseClient";

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];



  // const url = new URL(req.url);
  // const token = url.searchParams.get("token");
  // const label = url.searchParams.get("label") || "INBOX";

  // console.log("Label:", label);

  if(!token){
    return NextResponse.json({error: 'Missing access token'}, {status: 400});
  }

    const {data: { accessToken }} = await supabase
    .from('gmail_users')
    .select('accessToken')
    .eq('accessToken', token)
    .single();

    if(error || !accessToken){
      return NextResponse.json({error: 'Invalid access token'}, {status: 401}, { headers: { 'Content-Type': 'application/json' } });
    }

    const oauth2Client = new google.auth.OAuth2();

    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });


  try {
    const messagesRes = await gmail.users.messages.list({
      userId: "me",
      labelIds: [label],
      maxResults: 1000,
    });

    const messages = messagesRes.data.messages || [];
    const detailedMessages = await Promise.all(
      messages.map(async (msg) => {
        const msgRes = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
        });
        const headers = msgRes.data.payload.headers;
        const getHeader = (name) => headers.find((h) => h.name === name)?.value || "";
        return {
          id: msgRes.data.id,
          subject: getHeader("Subject"),
          from: getHeader("From"),
          data: msgRes.data,
          message: msgRes.data.snippet,
        };
      })
    );

    return NextResponse.json(detailedMessages || [], { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Error fetching messages" }, { status: 500 }, { headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(req) {
  const { accessToken, userEmail } = await req.json();

  if (!accessToken || !userEmail) {
    return NextResponse.json(
      { error: "Missing access token or user email" },
      {
        status: 400,
      }
    );
  }
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });
    const messages = listRes.data.messages || [];
    
    if(messages.length === 0){
      console.log("No messages found.");
      return NextResponse.json([], { status: 200 });
    }
    const detailedMessages = await Promise.all(
      messages.map(async (msg) => {
        const msgRes = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full",
        });
        // body:JSON.stringify({accessToken, userEmail})
        
        const headers = msgRes.data.payload?.headers || [];
        const getHeader = (name) => headers.find((h) => h.name === name)?.value || "";
        const subject = getHeader("Subject") || "(No Subject)";
        const from = getHeader("From") || "(Unknown)";
        const snippet = msgRes.data.snippet || "";

        let body = "" ;
        const parts = msgRes.data.payload?.parts || [];
        const textParts = parts.find(part => part.mimeType === 'text/plain' && part.body?.data);

        if(textParts?.body?.data){
          body = Buffer.from(textParts.body.data, 'base64').toString('utf-8');
        } else if(msgRes.data.payload?.body?.data){
          body = Buffer.from(msgRes.data.payload.body.data, 'base64').toString('utf-8');
        }
          
        console.log("Message:", {id: msgRes.data.id, subject, from, snippet, body});

        return {
          id: msgRes.data.id,
          user_email: userEmail,
          subject,
          from,
          raw: msgRes.data,
          snippet,
          created_at: new Date().toISOString(),
          body,
        };
      })
    );

    // Insert into supabase
    // const {error} = await supabase
    //  .from('gmail_messages')
    //  .insert(detailedMessages);
    const { error } = await supabase.from("gmail_messages").upsert(detailedMessages , { onConflict: 'id, user_email', ignoreDuplicates: false });

    if (error) {
      console.error("Supabase insert error", error);
      return NextResponse.json({ error: "Failed to save messages" }, { status: 500 });
    }

    console.log(`✅ Synced ${detailedMessages.length} messages for ${userEmail}`);
  
    return NextResponse.json({ success: true, count: detailedMessages.length });

  } catch(error){
     console.error("Gmail sync error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}