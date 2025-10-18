// app/api/admin/messages/route.js
import { NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Step 1: find the user's email from gmail_users
    const { data: user, error: userError } = await supabase
      .from("gmail_users")
      .select("email")
      .eq("id", userId)
      .single();

    if (userError || !user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Step 2: get all messages for that email
    const { data: messages, error: msgError } = await supabase
      .from("gmail_messages")
      .select("*")
      .eq("user_email", user.email.toLowerCase())
      .order("created_at", { ascending: false });

    if (msgError)
      return NextResponse.json({ error: msgError.message }, { status: 500 });

    return NextResponse.json({ success: true, messages });
  } catch (err) {
    console.error("Admin fetch messages error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
