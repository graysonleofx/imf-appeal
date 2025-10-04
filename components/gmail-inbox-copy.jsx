"use client";

import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import {
  InboxIcon,
  StarIcon,
  ClockIcon,
  PaperAirplaneIcon,
  PencilIcon,
  ExclamationCircleIcon,
  TrashIcon,
  ArchiveBoxIcon,
  TagIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { set } from "date-fns";

// ... UserIcon and tabs definition remain unchanged

const sidebarItems = [
  { label: "Inbox", icon: InboxIcon },
  { label: "Starred", icon: StarIcon },
  { label: "Snoozed", icon: ClockIcon },
  { label: "Sent", icon: PaperAirplaneIcon },
  { label: "Drafts", icon: PencilIcon },
  { label: "Spam", icon: ExclamationCircleIcon },
  { label: "Trash", icon: TrashIcon },
  { label: "All Mail", icon: ArchiveBoxIcon },
  { label: "Categories", icon: TagIcon },
];

const tabs = [
  { name: "Primary", color: "border-blue-500", icon: InboxIcon },
  { name: "Promotions", color: "border-green-500", icon: TagIcon },
  { name: "Social", color: "border-pink-500", icon: UserIcon },
];

function UserIcon(props) {
  return (
    <svg
      {...props}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={props.className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z"
      />
    </svg>
  );
}

// Fetch user from Supabase
const syncUserEmails = async (profileId) => {
  if (!profileId) {
    setError("No profile ID provided");
    return null;
  }
  const { data: user, error } = await supabase
    .from("gmail_users")
    .select("*")
    .eq("id", profileId.toString())
    .maybeSingle();

  if (error) {
    setError("Supabase error: " + error.message);
    return null;
  }
  if (!user) {
    // setError("User not found in Supabase." + error.message);
    console.warn("⚠️ User not found in Supabase.");
    return null;
  }
  setUser(user);
  setError("");
  return {
    email: user.email,
    accessToken: user.accessToken,
  };
};

export default function GmailInbox() {
  const [activeTab, setActiveTab] = useState("Primary");
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState([]);
  const [starred, setStarred] = useState([]);
  const [search, setSearch] = useState("");
  const [previewEmail, setPreviewEmail] = useState(null); // NEW: for preview
  const [previewBody, setPreviewBody] = useState("");     // NEW: for body loading
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // NEW: sidebar toggle

  // Sync Gmail messages from API, then fetch from Supabase
  const syncGmailMessages = async () => {
    if (!user?.accessToken || !user?.email) return;
    setSyncing(true);
    // setError("");
    try {
      const res = await fetch("/api/gmail/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: user.accessToken,
          userEmail: user.email,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        // setError(result.error || "Failed to sync emails");
        console.error('❌ Sync error:', result.error);
      } else {
        console.log('✅ Synced emails:', result);
        fetchGmailMessages({userEmail: user.email}); // Refresh messages after sync
        // setError("");
      }
    } catch (err) {
      // setError("Failed to sync messages: " + err.message);
      console.error('❌ Sync exception:', err);
    }
    setSyncing(false);
  };

  // Fetch Gmail messages from Supabase
  const fetchGmailMessages = async ({userEmail}) => {
    if (!userEmail) return;
    setLoading(true);
    // setError("");
    try {
      const { data, error } = await supabase
        .from("gmail_messages")
        .select("*")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        setError("Supabase fetch error: " + error.message);
        // setMessages([]);
      } 
      setMessages(data || []);
      // setError("");
      setSelected([]); // Clear selection on new fetch
      console.log('📨 Fetched emails:', data);
    } catch (err) {
      // setError("Failed to fetch messages: " + err.message);
      console.error('❌ Fetch exception:', err);
      setMessages([]);
    }
    setLoading(false);
  };

  // Fetch full message body from Supabase or API
  const fetchEmailBody = async (emailId) => {
    setPreviewLoading(true);
    setPreviewBody("");
    try {
      // Try to get body from Supabase first
      const { data, error } = await supabase
        .from("gmail_messages")
        .select("body")
        .eq("id", emailId)
        .maybeSingle();
      if (data?.body) {
        setPreviewBody(data.body);
      } else {
        // Optionally: fetch from API if not in Supabase
        const res = await fetch("/api/gmail/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: emailId, accessToken: user.accessToken, userEmail: user.email }),
        });
        const result = await res.json();
        setPreviewBody(result.body || "No message body found.");
      }
    } catch (err) {
      setPreviewBody("Failed to load message body.");
    }
    setPreviewLoading(false);
  };

  // Initial load: get session, user, and messages
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      const sess = await getSession();
      setSession(sess);
      const userId = sess?.user?.id;
      const userEmail = sess?.user?.email
      const userAccessToken = sess?.accessToken

      console.log('🔑 Session ID:', userId);
      console.log('📧 User Email:', userEmail);
      console.log('🔑 User Access Token:', userAccessToken);

      setUser({id: userId, email: userEmail, accessToken: userAccessToken});

      if (!userId) {
        setError("No user session found.");
        setLoading(false);
        return;
      }
      
      await syncUserEmails(userId);
      setLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    console.log('👤 User state changed:', user);
  }, [user]);

  useEffect(() => {
    if (user?.accessToken && user?.email) {
      syncGmailMessages(user.accessToken, user.email); // Auto-sync on accessToken change
    }
  }, [user?.accessToken, user?.email]);

  // Filter messages by tab and search
  const filteredMessages  = messages
    .filter((e) => e.tab === activeTab)
    .filter(
      (e) =>
        e.sender?.toLowerCase().includes(search.toLowerCase()) ||
        e.subject?.toLowerCase().includes(search.toLowerCase()) ||
        e.snippet?.toLowerCase().includes(search.toLowerCase())
    );

  // UI
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Drawer on mobile) */}
      {/* Overlay for mobile */}
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
        style={{ maxWidth: "90vw" }}
      >
        <div className="flex items-center mb-8">
          <img
            src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
            alt="Gmail"
            className="w-8 h-8 mr-2"
          />
          <span className="text-2xl font-semibold text-gray-800">Gmail</span>
          {/* Close button on mobile */}
          <button
            className="ml-auto md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setShowSidebar(false)}
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full px-6 py-3 mb-6 shadow transition w-full">
          <PencilIcon className="w-5 h-5" />
          Compose
        </button>
        <nav className="flex-1">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.label}>
                <button
                  className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition ${
                    item.label === "Inbox" ? "font-semibold bg-blue-50" : ""
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 text-gray-500" />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar / Navbar */}
        <header className="flex items-center bg-white border-b border-gray-200 px-2 py-2 sticky top-0 z-20 md:px-4">
          {/* Hamburger menu on mobile */}
          <button
            className="md:hidden mr-3 p-2 rounded hover:bg-gray-100"
            onClick={() => setShowSidebar(true)}
            aria-label="Open sidebar"
          >
            <Bars3Icon className="w-7 h-7 text-gray-700" />
          </button>
          {/* Branding on mobile */}
          {/* <div className="flex items-center md:hidden mr-3">
            <img
              src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
              alt="Gmail"
              className="w-7 h-7 mr-1"
            />
            <span className="text-lg font-semibold text-gray-800">Gmail</span>
          </div> */}
          {/* Search bar */}
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
            onClick={syncGmailMessages}
            disabled={syncing}
            title="Sync Gmail"
          >
            <ArrowPathIcon className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`} />
            {/* {syncing ? "Syncing..." : "Sync"} */}
          </button>
        </header>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 -mb-px transition font-medium text-gray-700 text-sm md:text-base ${
                activeTab === tab.name
                  ? `${tab.color} text-blue-600 bg-blue-50`
                  : "border-transparent hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab(tab.name)}
            >
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Error/Loading */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 text-center text-sm">{error}</div>
        )}
        {loading && (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        )}

        {/* Email List & Preview */}
        <div className="flex flex-1 overflow-hidden">
          {/* Email List */}
          <div className={`flex-1 overflow-y-auto bg-white ${previewEmail && "max-w-xl"} min-w-0`}>
            <div className="flex items-center px-2 py-2 border-b border-gray-100 text-gray-500 text-xs md:text-sm sticky top-[10px] bg-white z-10">
              <input
                type="checkbox"
                className="mr-2 accent-blue-600"
                checked={
                  Array.isArray(messages) &&
                  messages.length > 0 &&
                  selected.length === messages.length
                }
                onChange={() => {
                  if (selected.length === messages.length) {
                    setSelected([]);
                  } else {
                    setSelected(messages.map((e) => e.id));
                  }
                }}
              />
              <span className="w-8 mr-2"></span>
              <span className="w-24 md:w-40">From</span>
              <span className="flex-1">Subject</span>
              <span className="w-16 md:w-20 text-right">Time</span>
            </div>

            {Array.isArray(messages) && messages.length > 0 ? (
              messages.map((email) => (
                <div
                  key={email.id}
                  className={`flex items-center px-2 py-3 border-b border-gray-100 cursor-pointer transition group ${
                    email.unread
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={async () => {
                    setPreviewEmail(email);
                    await fetchEmailBody(email.id);
                  }}
                >
                  <input
                    type="checkbox"
                    className="mr-2 accent-blue-600"
                    checked={selected.includes(email.id)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(email.id)
                          ? prev.filter((i) => i !== email.id)
                          : [...prev, email.id]
                      )
                    }
                  />
                  <button
                    className="w-8 h-8 flex items-center justify-center mr-2 rounded-full hover:bg-yellow-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStarred((prev) =>
                        prev.includes(email.id)
                          ? prev.filter((i) => i !== email.id)
                          : [...prev, email.id]
                      );
                    }}
                    aria-label="Star"
                  >
                    <StarIcon
                      className={`w-5 h-5 ${
                        starred.includes(email.id)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-400"
                      }`}
                      fill={starred.includes(email.id) ? "#facc15" : "none"}
                    />
                  </button>
                  <span
                    className={`w-24 md:w-40 truncate font-medium ${
                      email.unread ? "text-gray-900" : "text-gray-700"
                    }`}
                  >
                    {email.from}
                  </span>
                  <span
                    className={`flex-1 truncate ${
                      email.unread
                        ? "font-semibold text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    {email.subject}{" "}
                    <span className="text-gray-500 font-normal ml-2">
                      - {email.subject}
                    </span>
                  </span>
                  <span className="w-16 md:w-20 text-right text-xs text-gray-500">
                    {email.time}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">No emails found.</div>
            )}
          </div>
          {/* Email Preview Panel */}
          {/* On mobile, show preview as full-screen overlay */}
          {previewEmail && (
            <div
              className={`
                fixed inset-0 z-50 bg-white flex flex-col md:static md:w-full md:max-w-2xl md:border-l md:border-gray-200
                ${previewEmail && "animate-fade-in"}
                ${window.innerWidth < 768 ? "" : ""}
              `}
              style={window.innerWidth < 768 ? { minWidth: 0 } : {}}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div>
                  <div className="text-base md:text-lg font-semibold">{previewEmail.subject}</div>
                  <div className="text-gray-500 text-xs md:text-sm">{previewEmail.from}</div>
                  <div className="text-gray-400 text-xs">{previewEmail.time}</div>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
                  onClick={() => {
                    setPreviewEmail(null);
                    setPreviewBody("");
                  }}
                  title="Close"
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
