"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import {
  InboxIcon,
  StarIcon,
  TrashIcon,
  PencilIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { DeleteIcon } from "lucide-react";

export default function GmailInbox() {
  const { id: userId } = useParams(); // ✅ get the clicked user's id from URL
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [starred, setStarred] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [previewEmail, setPreviewEmail] = useState(null);
  const [previewBody, setPreviewBody] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeError, setComposeError] = useState("");
  const [composeSuccess, setComposeSuccess] = useState("");
  const [activeSidebar, setActiveSidebar] = useState("Inbox");

  const labelMap = {
    Inbox: "INBOX",
    Sent: "SENT",
    Drafts: "DRAFT",
    Spam: "SPAM",
    Trash: "TRASH",
    "All Mail": "ALL_MAIL",
    Categories: "CATEGORY",
  };

  // ✅ Step 1: Fetch the clicked user's Gmail credentials from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("gmail_users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) {
        console.error("Error fetching user:", error);
        setError("User not found.");
        setLoading(false);
        return;
      }

      setUser(data);
      console.log("✅ Viewing inbox for:", data.email);
      setLoading(false);
    };

    fetchUser();
  }, [userId]);

  // ✅ Step 2: Fetch Gmail messages for that user
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.email) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("gmail_messages")
        .select("*")
        .eq("user_email", user.email.toLowerCase().trim())
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching messages:", error);
        setError("Failed to load messages");
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();
  }, [user]);

  // ✅ Step 3: Sync Gmail messages from API
  const syncGmailMessages = async (labelIds = null) => {
    if (!user?.accessToken || !user?.email) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/gmail/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: user.accessToken,
          userEmail: user.email,
          labelIds: labelIds ? [labelIds] : undefined,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        console.log("✅ Gmail synced successfully");
        fetchMessages();
      } else {
        console.error("❌ Sync failed:", result);
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
    setSyncing(false);
  };

  // ✅ Step 4: Load message body on click
  const fetchEmailBody = async (emailId) => {
    setPreviewLoading(true);
    setPreviewBody("");
    try {
      const { data } = await supabase
        .from("gmail_messages")
        .select("body")
        .eq("id", emailId)
        .maybeSingle();
      setPreviewBody(data?.body || "No message body found.");
    } catch {
      setPreviewBody("Failed to load message body.");
    }
    setPreviewLoading(false);
  };

  // ✅ Step 5: Render UI
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">Loading inbox...</div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  const filteredMessages = messages.filter(
    (msg) =>
      Array.isArray(msg.labelIds) &&
      msg.labelIds.includes(labelMap[activeSidebar]) &&
      (msg.from?.toLowerCase().includes(search.toLowerCase()) ||
        msg.subject?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
      <aside
        className={`
          fixed z-40 top-0 left-0 h-full w-72 bg-white border-r border-gray-200 p-4
          transform transition-transform duration-200 ease-in-out
          ${showSidebar ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:flex flex-col md:w-64 md:z-0
        `}
      >
        <div className="flex items-center mb-8">
          <img
            src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
            alt="Gmail"
            className="w-8 h-8 mr-2"
          />
          <span className="text-2xl font-semibold text-gray-800">
            {user?.name || "User Inbox"}
          </span>
          <button
            className="ml-auto md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setShowSidebar(false)}
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full px-6 py-3 mb-6 shadow transition w-full"
          onClick={() => setShowCompose(true)}
        >
          <PencilIcon className="w-5 h-5" />
          Compose
        </button>

        <nav className="flex-1">
          <ul className="space-y-1">
            {Object.keys(labelMap).map((tab) => (
              <li key={tab}>
                <button
                  className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition ${
                    activeSidebar === tab ? "font-semibold bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    setActiveSidebar(tab);
                    syncGmailMessages(labelMap[tab]);
                  }}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center bg-white border-b border-gray-200 px-2 py-2 sticky top-0 z-20 md:px-4">
          <button
            className="md:hidden mr-3 p-2 rounded hover:bg-gray-100"
            onClick={() => setShowSidebar(true)}
            aria-label="Open sidebar"
          >
            <Bars3Icon className="w-7 h-7 text-gray-700" />
          </button>
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-3 py-2 md:px-4">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 mr-2" />
            <input
              type="text"
              className="bg-transparent outline-none flex-1 text-gray-700 text-sm md:text-base"
              placeholder="Search mail"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className={`ml-2 md:ml-4 flex items-center gap-2 px-3 py-2 rounded-full font-medium transition text-sm md:text-base ${
              syncing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            onClick={() => syncGmailMessages(labelMap[activeSidebar])}
            disabled={syncing}
            title="Sync Gmail"
          >
            <ArrowPathIcon
              className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`}
            />
          </button>
        </header>

        {/* Messages */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-white">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((email) => (
                <div
                  key={email.id}
                  className="flex items-center px-2 py-3 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition"
                  onClick={() => {
                    setPreviewEmail(email);
                    fetchEmailBody(email.id);
                  }}
                >
                  <span className="w-24 md:w-40 truncate font-medium text-gray-800">
                    {email.from}
                  </span>
                  <span className="flex-1 truncate text-gray-600">
                    {email.subject}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                No emails found.
              </div>
            )}
          </div>

          {previewEmail && (
            <div className="fixed inset-0 z-50 bg-white flex flex-col md:static md:w-full md:max-w-2xl md:border-l md:border-gray-200">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div>
                  <div className="text-lg font-semibold">
                    {previewEmail.subject}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {previewEmail.from}
                  </div>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
                  onClick={() => {
                    setPreviewEmail(null);
                    setPreviewBody("");
                  }}
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {previewLoading ? (
                  <div className="text-gray-400">Loading message...</div>
                ) : (
                  <div className="whitespace-pre-wrap text-gray-800 text-sm md:text-base">
                    {previewBody || "No message body found."}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}