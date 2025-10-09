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
  const { id: userId } = useParams(); // ✅ clicked user id from URL
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [previewEmail, setPreviewEmail] = useState(null);
  const [previewBody, setPreviewBody] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState("Inbox");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeError, setComposeError] = useState("");
  const [composeSuccess, setComposeSuccess] = useState("");

  const labelMap = {
    Inbox: "INBOX",
    Sent: "SENT",
    Drafts: "DRAFT",
    Spam: "SPAM",
    Trash: "TRASH",
    "All Mail": "ALL_MAIL",
    Categories: "CATEGORY",
  };

  // ✅ 1. Fetch clicked user credentials
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

  // ✅ 2. Fetch messages from Supabase
  const fetchMessages = async () => {
    if (!user?.email) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("gmail_messages")
      .select("*")
      .eq("user_email", user.email.toLowerCase().trim())
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages");
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  // ✅ 3. Sync Gmail messages (from API)
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

  // ✅ 4. Fetch single email body
  const fetchEmailBody = async (emailId) => {
    setPreviewLoading(true);
    setPreviewBody("");
    try {
      const { data } = await supabase
        .from("gmail_messages")
        .select("body, labelIds")
        .eq("id", emailId)
        .maybeSingle();

      setPreviewBody(data?.body || "No message body found.");

      // ✅ Mark as read if "UNREAD"
      if (data?.labelIds?.includes("UNREAD")) {
        const newLabels = data.labelIds.filter((l) => l !== "UNREAD");
        await supabase
          .from("gmail_messages")
          .update({ labelIds: newLabels })
          .eq("id", emailId);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === emailId ? { ...msg, labelIds: newLabels } : msg
          )
        );
      }
    } catch {
      setPreviewBody("Failed to load message body.");
    }
    setPreviewLoading(false);
  };

  // ✅ 5. Live update when new emails arrive
  useEffect(() => {
    if (!user?.email) return;
    console.log("👂 Listening for new emails via Supabase realtime...");
    const channel = supabase
      .channel(`inbox-${user.email}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "gmail_messages",
          filter: `user_email=eq.${user.email}`,
        },
        (payload) => {
          console.log("📩 New email:", payload.new);
          setMessages((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email]);

  // ✅ 6. Auto-poll every 60s
  useEffect(() => {
    if (!user?.accessToken || !user?.email) return;
    const interval = setInterval(() => {
      console.log("🔄 Auto-sync Gmail every 60s");
      syncGmailMessages(labelMap[activeSidebar]);
    }, 60000);
    return () => clearInterval(interval);
  }, [user?.accessToken, user?.email, activeSidebar]);

  // ✅ 7. Properly handle label filtering even if labelIds is string
  const filteredMessages = messages.filter((msg) => {
    const labels = Array.isArray(msg.labelIds)
      ? msg.labelIds
      : typeof msg.labelIds === "string"
      ? JSON.parse(msg.labelIds)
      : [];

    if (activeSidebar === "Inbox") {
      return labels.includes("INBOX");
    }

    const labelId = labelMap[activeSidebar];
    return labelId ? labels.includes(labelId) : false;
  }).filter(
    (msg) =>
      msg.from?.toLowerCase().includes(search.toLowerCase()) ||
      msg.subject?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ 8. UI
  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

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
        className={`fixed z-40 top-0 left-0 h-full w-72 bg-white border-r p-4 transition-transform duration-200 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:static md:translate-x-0 md:flex flex-col md:w-64`}
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

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center bg-white border-b px-2 py-2 sticky top-0 z-20 md:px-4">
          <button
            className="md:hidden mr-3 p-2 rounded hover:bg-gray-100"
            onClick={() => setShowSidebar(true)}
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
            className={`ml-2 md:ml-4 flex items-center gap-2 px-3 py-2 rounded-full font-medium transition ${
              syncing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            onClick={() => syncGmailMessages(labelMap[activeSidebar])}
            disabled={syncing}
          >
            <ArrowPathIcon className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`} />
          </button>
        </header>

        {/* Emails */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-white">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((email) => (
                <div
                  key={email.id}
                  className={`flex items-center px-2 py-3 border-b cursor-pointer transition ${
                    email.labelIds?.includes("UNREAD")
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "hover:bg-gray-50"
                  }`}
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
                  <div className="text-gray-500 text-sm">{previewEmail.from}</div>
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
