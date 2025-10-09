"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import GmailInbox from "@/components/gmail-inbox-copy";
import supabase from "@/lib/supabaseClient";

export default function InboxPage() {
  const router = useRouter();
  const { id: userId } = useParams(); // userId from the URL
  const [adminSession, setAdminSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Step 1: Verify admin is logged in
  useEffect(() => {
    const verifyAdmin = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data?.session) {
        console.warn("No admin session found. Redirecting to /admin...");
        router.push("/admin");
        return;
      }

      // Keep admin logged in
      setAdminSession(data.session);
      console.log("✅ Admin logged in as:", data.session.user.email);
    };

    verifyAdmin();
  }, [router]);

  // ✅ Step 2: Fetch the clicked user's details (not the admin)
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("gmail_users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) {
        console.error("Error fetching user:", error);
        alert("User not found. Returning to dashboard.");
        router.push("/admin");
        return;
      }

      console.log("📩 Viewing inbox for:", data.email);
      setUser(data);
      setLoading(false);
    };

    fetchUser();
  }, [userId, router]);

  // ✅ Step 3: Handle logout for admin
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
  };

  // ✅ Step 4: Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-700">
        <p className="text-lg mb-2">Loading inbox...</p>
        <p className="text-sm opacity-70">User ID: {userId}</p>
      </div>
    );
  }

  // ✅ Step 5: Render user inbox (while admin is logged in)
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => router.push("/admin")}
        >
          &larr; Back to Dashboard
        </button>

        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-2">
        {user ? `${user.name}'s Inbox` : "User Inbox"}
      </h1>
      <p className="text-gray-500 mb-4">{user?.email}</p>

      {/* ✅ This displays the user's Gmail inbox (based on userId) */}
      <GmailInbox userId={userId} />
    </div>
  );
}
