"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import {
  PencilIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  TrashIcon,
  
} from "@heroicons/react/24/outline";
import { RotateCcwIcon } from "lucide-react";

export default function GmailInbox() {
  const { id: userId } = useParams(); // ✅ user id from URL

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

  const labelMap = {
    Inbox: "INBOX",
    Sent: "SENT",
    Drafts: "DRAFT",
    Spam: "SPAM",
    Trash: "TRASH",
    "All Mail": "CATEGORY_PERSONAL", // Gmail uses CATEGORY_* for All Mail
  };

  // ✅ 1. Fetch user and auto-sync Gmail on load
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

      // Normalize key names so both access_token and accessToken work
      const normalizedUser = {
        ...data,
        accessToken: data.accessToken || data.access_token,
        email: data.email?.toLowerCase().trim(),
      };
      setUser(normalizedUser);
      console.log("✅ Viewing inbox for:", normalizedUser.email);


      // 🆕 Immediately trigger sync when user loads
      try {
        const res = await fetch("/api/gmail/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken: data.accessToken,
            userEmail: data.email,
          }),
        });
        const result = await res.json();
        if (res.ok) {
          console.log(`✅ Initial sync complete (${result.count || 0} msgs)`);
          await fetchMessages(data.email);
        } else {
          console.error("❌ Initial sync failed:", result);
        }
      } catch (err) {
        console.error("🚨 Sync error:", err);
      }

      setLoading(false);
    };

    fetchUser();
  }, [userId]);

  // ✅ 2. Fetch messages from Supabase
  const fetchMessages = async (email) => {
    const targetEmail = email || user?.email;
    if (!targetEmail) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("gmail_messages")
      .select("*")
      .eq("user_email", targetEmail.toLowerCase().trim())
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

  // ✅ 3. Manual sync by label
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
        console.log(`✅ Gmail synced: ${result.count || 0} messages`);
        await fetchMessages();
      } else {
        console.error("❌ Sync failed:", result);
      }
    } catch (err) {
      console.error("Sync error:", err);
    }
    setSyncing(false);
  };

  // ✅ 4. Load full message body
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

      if (data?.labelIds?.includes("UNREAD")) {
        const newLabels = data.labelIds.filter((l) => l !== "UNREAD");
        await supabase
          .from("gmail_messages")
          .update({ labelIds: newLabels })
          .eq("id", emailId);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === emailId ? { ...m, labelIds: newLabels } : m
          )
        );
      }
    } catch {
      setPreviewBody("Failed to load message body.");
    }
    setPreviewLoading(false);
  };

  // ✅ 5. Realtime updates
  useEffect(() => {
    if (!user?.email) return;
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
          console.log("📩 New message:", payload.new);
          setMessages((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email]);

  // ✅ 6. Auto-sync every 60s
  useEffect(() => {
    if (!user?.accessToken || !user?.email) return;
    const interval = setInterval(() => {
      console.log("🔄 Auto-sync Gmail every 60s");
      syncGmailMessages(labelMap[activeSidebar]);
    }, 60000);
    return () => clearInterval(interval);
  }, [user?.accessToken, user?.email, activeSidebar]);


  
  // ✅ Delete or Restore
  const handleMessageAction = async (messageId, action) => {
    if (!user?.accessToken) return;

    const actionLabels = {
      delete: "🗑 Move to Trash?",
      restore: "♻ Restore this message to Inbox?",
      permanent: "⚠ Permanently delete this message?",
    };
    if (!window.confirm(actionLabels[action])) return;

    try {
      const res = await fetch("/api/gmail/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: user.accessToken,
          messageId,
          action,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        console.log(`✅ ${action} success`);
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } else {
        console.error("❌ Action failed:", result.error);
      }
    } catch (err) {
      console.error("Action error:", err);
    }
  };

  // ✅ 7. Filter by label + search
  const filteredMessages = messages
    .filter((msg) => {
      const labels = Array.isArray(msg.labelIds)
        ? msg.labelIds
        : typeof msg.labelIds === "string"
        ? JSON.parse(msg.labelIds)
        : [];

      const labelId = labelMap[activeSidebar];
      return labelId ? labels.includes(labelId) : labels.includes("INBOX");
    })
    .filter(
      (msg) =>
        msg.from?.toLowerCase().includes(search.toLowerCase()) ||
        msg.subject?.toLowerCase().includes(search.toLowerCase())
    );

  if (loading)
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">{error}</div>;

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
          onClick={() => alert("Compose not implemented")}
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
                  <span className="ml-4 text-sm text-gray-400">
                    {activeSidebar === "Trash" ? (
                      <>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleMessageAction(email.id, 'restore');
                          }}
                        >
                          <RotateCcwIcon className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                        </button>

                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleMessageAction(email.id, 'permanently');
                          }}
                        >
                          <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-600" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleMessageAction(email.id, 'delete');
                          }}
                        >
                          <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-600" />
                        </button>
                      </>
                    )}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                No emails found.
              </div>
            )}
          </div>

          {/* Preview */}
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
