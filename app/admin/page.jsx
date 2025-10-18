"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";

const ACCESS_CODE_KEY = "admin_access_code";
const VALID_ACCESS_CODE =
  process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE ||
  process.env.NEXT_PUBLIC_ADMIN_ACCESS_CODE2;

// 🔹 NEW: credentials for Supabase admin account (stored in .env.local)
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

function AccessCodeScreen({ onSuccess }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (code !== VALID_ACCESS_CODE) {
      setError("Invalid access code. Please try again.");
      return;
    }

    // ✅ Step 1: Save access code locally
    localStorage.setItem(ACCESS_CODE_KEY, code);
    setError("");

    // ✅ Step 2: Log into Supabase as admin
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (signInError) {
      console.error("Supabase admin login failed:", signInError);
      setError("Failed to sign in. Please check your admin credentials.");
      return;
    }

    console.log("Admin signed in successfully:", data);
    onSuccess();
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

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  // ✅ Step 1: Check for access code and Supabase session
  useEffect(() => {
    const init = async () => {
      const code = localStorage.getItem(ACCESS_CODE_KEY);
      if (code === VALID_ACCESS_CODE) {
        setAuthorized(true);
      }

      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        console.log("No Supabase session. Redirecting to login...");
        setAuthorized(false);
      }
    };
    init();
  }, []);

  // ✅ Step 2: Fetch users from Supabase
  useEffect(() => {
    if (!authorized) return;
    async function fetchUsers() {
      setLoading(true);
      const { data, error } = await supabase.from("gmail_users").select("*");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    }
    fetchUsers();
  }, [authorized]);

  // ✅ Step 3: Handle inbox redirect
  const handleUserClick = (userId) => {
    router.push(`/admin/inbox/${userId}`);
  };

  // ✅ Step 4: Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(ACCESS_CODE_KEY);
    router.push("/admin");
  };

  if (!authorized) {
    return <AccessCodeScreen onSuccess={() => setAuthorized(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
            Admin Portal
          </h1>
          <div className="flex items-center gap-2">
            <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg shadow font-semibold text-lg">
              Total Users: {loading ? "..." : users.length}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Log Out
            </button>
          </div>
        </header>

        <section className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-700">User List</h2>
            <span className="text-gray-400 text-sm">
              Click a user to view their Gmail inbox.
            </span>
          </div>
          <div className="overflow-x-auto">
            <ul className="divide-y divide-blue-50">
              {loading ? (
                <li className="py-8 text-center text-blue-400 animate-pulse">
                  Loading users...
                </li>
              ) : users.length === 0 ? (
                <li className="py-8 text-center text-gray-400">
                  No users found.
                </li>
              ) : (
                users.map((user) => (
                  <li
                    key={user.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 rounded-xl hover:bg-blue-50 transition group"
                  >
                    <div
                      onClick={() => handleUserClick(user.id)}
                      className="flex-1 cursor-pointer"
                    >
                      <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition">
                        {user.name}
                      </p>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                    <div className="flex flex-row sm:flex-row items-center gap-2 w-full sm:w-auto">
                      <span
                        onClick={() => handleUserClick(user.id)}
                        className="flex items-center gap-1 text-blue-600 font-medium group-hover:underline cursor-pointer"
                      >
                        Inbox
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                      {/* <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              `Are you sure you want to delete ${user.email}?`
                            )
                          ) {
                            await supabase
                              .from("gmail_users")
                              .delete()
                              .eq("id", user.id);
                            setUsers((prev) =>
                              prev.filter((u) => u.id !== user.id) 
                            );
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition w-full sm:w-auto"
                        style={{ minWidth: 90 }}
                      >
                        Delete
                      </button> */}

                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const confirmed = confirm(`Are you sure you want to delete ${user.email}?`);
                          if (!confirmed) return;

                          // 🔹 Attempt deletion and capture result
                          const { error } = await supabase
                            .from("gmail_users")
                            .delete()
                            .eq("id", user.id);

                          if (error) {
                            console.error("Error deleting user:", error);
                            alert("Failed to delete user. Check your Supabase permissions.");
                            return;
                          }

                          // 🔹 Only update UI after successful delete
                          setUsers((prev) => prev.filter((u) => u.id !== user.id));
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition w-full sm:w-auto"
                        style={{ minWidth: 90 }}
                      >
                        Delete
                      </button>

                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
