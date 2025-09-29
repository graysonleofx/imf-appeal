import {NextResponse} from "next/server";

export async function POST(request) {
  console.log("Received request to log user");
  try {
    const body = await request.json();
    console.log("Request body:", body);
    if (!body || !body.email) {
      return NextResponse.json({ error: "Invalid request, email is required" }, { status: 400 });
    }
    const { email, name } = body;
    console.log("Logging user:", { email, name });
    alert("Logging user:", { email, name });
    

    // Here you can add logic to log the user to your database

    // For demonstration, we'll just return the user info
    return NextResponse.json({ success: true, message: "User logged successfully", user: { email, name } });
  } catch (error) {
    console.error("Error logging user:", error);
    return NextResponse.json({ success: false, error: "Failed to log user" }, { status: 500 });
  }
}
