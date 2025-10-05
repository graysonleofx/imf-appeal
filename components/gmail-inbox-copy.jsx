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
import { DeleteIcon } from "lucide-react";
import { send } from "process";

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
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeError, setComposeError] = useState("");
  const [composeSuccess, setComposeSuccess] = useState("");
  const [activeSidebar, setActiveSidebar] = useState("Inbox");

  // Sync Gmail messages from API, then fetch from Supabase
  const syncGmailMessages = async (label = null) => {
    if (!user?.accessToken || !user?.email) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/gmail/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: user.accessToken,
          userEmail: user.email,
          label: label ? labelMap[label] : undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        console.error('❌ Sync error:', result.error);
      } else {
        fetchGmailMessages({userEmail: user.email});
      }
    } catch (err) {
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
  const labelMap = {
    Inbox: "INBOX",
    Starred: "STARRED",
    Snoozed: "SNOOZED",
    Sent: "SENT",
    Drafts: "DRAFT",
    Spam: "SPAM",
    Trash: "TRASH",
    "All Mail": "ALL_MAIL",
    Categories: "CATEGORY",
  };

  const filteredMessages = messages
    .filter((e) => {
      // For tabs (Primary, Promotions, Social)
      if (activeSidebar === "Inbox") {
        return e.tab === activeTab;
      }
      // For other labels
      if (labelMap[activeSidebar]) {
        return (e.labelIds || []).includes(labelMap[activeSidebar]);
      }
      return true;
    })
    .filter(
      (e) =>
        e.sender?.toLowerCase().includes(search.toLowerCase()) ||
        e.subject?.toLowerCase().includes(search.toLowerCase()) ||
        e.snippet?.toLowerCase().includes(search.toLowerCase())
    );
  
  const handleDelete = async (emailId) => {
    if (!emailId) return;
    if (!user?.accessToken) {
      setError("No access token found.");
      return;
    }
    try {
      // Delete via Gmail API
      await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      //  Delete from Supabase
      const { error } = await supabase
        .from("gmail_messages")
        .delete()
        .eq("id", emailId);
      if (error) {
        console.error("Supabase delete error:", error);
      } else {
        // Remove from local state
        setMessages((prev) => prev.filter((msg) => msg.id !== emailId));
        if (previewEmail?.id === emailId) {
          setPreviewEmail(null);
          setPreviewBody("");
        }
      }
    } catch (err) {
      console.error("Failed to delete email:", err);
    }
  };

  const sendEmail = async () => {
    if (!composeTo || !composeBody) {
      setComposeError("To and Body are required.");
      return;
    } 

    try {
      const emailData = [
        "To: " + composeTo,
        "Subject: " + composeSubject,
        "Content-Type: text/html; charset=utf-8",
        "",
        "Body: " + composeBody,
      ].join("\n");

      const encodedEmail = Buffer.from(emailData).toString("base64").replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const emailDataFinal = { raw: encodedEmail };
      setComposeSending(true);
      await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(emailDataFinal),
      });
      setComposeSuccess("Email sent successfully!");
      setComposeError("");
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      // Optionally refresh inbox
      await syncGmailMessages();
      setShowCompose(false);
    } catch (error) {
      console.error("Error sending email:", error);
      setComposeError("Failed to send email.");
    } finally {
      setComposeSending(false);
    }
  }

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
          <span className="text-2xl font-semibold text-gray-800">Overview</span>
          {/* Close button on mobile */}
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
            {sidebarItems.map((item) => (
              <li key={item.label}>
                <button
                  className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition ${
                    activeSidebar === item.label ? "font-semibold bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    setActiveSidebar(item.label);
                    syncGmailMessages(item.label);
                  }}
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
              <span className="w-16 md:w-20 text-right">Action</span>
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

                  <div className="flex items-center">
                    <button
                      className="text-gray-400 hover:text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete action
                        confirm("Are you sure you want to delete this email?") && handleDelete(email.id);
                      }}
                      title="Delete"
                      aria-label="More actions"
                    >
                      <DeleteIcon className="w-5 h-5" />
                    </button>
                  </div>
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

        {/* Compose Email Modal */}
        {showCompose && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-lg mx-auto md:mx-0 md:w-[500px] flex flex-col animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <span className="font-semibold text-gray-800">New Message</span>
                <button
                  className="text-gray-400 hover:text-gray-700 text-xl"
                  onClick={() => {
                    setShowCompose(false);
                    setComposeTo("");
                    setComposeSubject("");
                    setComposeBody("");
                    setComposeError("");
                    setComposeSuccess("");
                  }}
                  title="Close"
                >
                  ×
                </button>
              </div>
              {/* Form */}
              <form
                className="flex flex-col gap-2 px-4 py-3"
                onSubmit={(e) => {e.preventDefault(); sendEmail()}}
              >
                <input
                  type="email"
                  className="border-b border-gray-200 py-2 px-2 outline-none text-sm"
                  placeholder="To"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="border-b border-gray-200 py-2 px-2 outline-none text-sm"
                  placeholder="Subject"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                />
                <textarea
                  className="resize-none min-h-[120px] py-2 px-2 outline-none text-sm"
                  placeholder="Message"
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  required
                />
                {composeError && (
                  <div className="text-red-500 text-xs">{composeError}</div>
                )}
                {composeSuccess && (
                  <div className="text-green-600 text-xs">{composeSuccess}</div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="submit"
                    className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full shadow transition ${
                      composeSending ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                    disabled={composeSending}
                  >
                    {composeSending ? "Sending..." : "Send"}
                  </button>
                  {/* Add more action buttons/icons here if needed */}
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}