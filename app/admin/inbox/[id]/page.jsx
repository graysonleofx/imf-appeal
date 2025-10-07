"use client";

import GmailInbox from "@/components/gmail-inbox-copy";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";

const ACCESS_CODE_KEY = "admin_access_code";
const VALID_ACCESS_CODE = process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE || "123456"; // Set your code in .env

function AccessCodeScreen({ onSuccess }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === VALID_ACCESS_CODE) {
      localStorage.setItem(ACCESS_CODE_KEY, code);
      setError("");
      onSuccess();
    } else {
      setError("Invalid access code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md flex flex-col gap-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">
          Admin Access
        </h2>
        <p className="text-gray-500 text-center">
          Enter your admin access code to continue.
        </p>
        <input
          type="password"
          className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
          placeholder="Access Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
        />
        {error && (
          <div className="text-red-500 text-center text-sm">{error}</div>
        )}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Enter Portal
        </button>
      </form>
    </div>
  );
}

export default function InboxPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check for access code in localStorage
    const code =
      typeof window !== "undefined" && localStorage.getItem(ACCESS_CODE_KEY);
    if (code === VALID_ACCESS_CODE) {
      setAuthorized(true);
    }
  }, []);

  useEffect(() => {
    if (!authorized) return;
    async function fetchUser() {
      if (!userId) return;
      const { data, error } = await supabase
        .from("gmail_users")
        .select("id, name, email")
        .eq("id", userId)
        .single();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data);
      }
    }
    fetchUser();
  }, [userId, authorized]);

  if (!authorized) {
    return <AccessCodeScreen onSuccess={() => setAuthorized(true)} />;
  }

  return (
    <div className="container mx-auto p-4">
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => router.push("/admin")}
      >
        &larr; Back to Dashboard
      </button>
      <h1 className="text-2xl font-bold mb-2">
        {user ? `${user.name}'s Inbox` : "User Inbox"}
      </h1>
      <p className="text-gray-500 mb-4">{user?.email}</p>
      <GmailInbox userId={userId} />
    </div>
  );
}