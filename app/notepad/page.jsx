"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import {
  FolderIcon,
  TrashIcon,
  PlusCircleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

export default function NotepadPage() {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [saveStatus, setSaveStatus] = useState("All changes saved");
  const [showSupport, setShowSupport] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [accessToken, setAccessToken] = useState("");

  // Fetch latest signed-in user from gmail_users table
  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const { data, error } = await supabase
          .from("gmail_users")
          .select("email, access_token")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) console.error("Supabase fetch error:", error);
        if (data) {
          setUserEmail(data.email);
          setAccessToken(data.access_token);
        }
      } catch (err) {
        console.error("Error fetching gmail_users:", err);
      }
    };
    fetchLatestUser();
  }, []);

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("notes-app-v1");
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotes(parsed);
      if (parsed.length > 0) setSelectedId(parsed[0].id);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    localStorage.setItem("notes-app-v1", JSON.stringify(notes));
  }, [notes]);

  // Save indicator
  useEffect(() => {
    if (saveStatus === "Saving...") {
      const t = setTimeout(() => setSaveStatus("All changes saved"), 1000);
      return () => clearTimeout(t);
    }
  }, [saveStatus]);

  // Support popup timer
  useEffect(() => {
    const timer = setTimeout(() => setShowSupport(true), 3000000); // 50 minutes
    return () => clearTimeout(timer);
  }, []);

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateNote = () => {
    const newNote = { id: generateId(), title: "", content: "" };
    setNotes([newNote, ...notes]);
    setSelectedId(newNote.id);
    setSaveStatus("Saving...");
  };

  const handleSelectNote = (id) => setSelectedId(id);

  const handleContentChange = (val) => {
    setNotes((notes) =>
      notes.map((n) => (n.id === selectedId ? { ...n, content: val } : n))
    );
    setSaveStatus("Saving...");
  };

  const handleTitleChange = (val) => {
    setNotes((notes) =>
      notes.map((n) => (n.id === selectedId ? { ...n, title: val } : n))
    );
    setSaveStatus("Saving...");
  };

  const selectedNote = notes.find((n) => n.id === selectedId);

  // ✉️ Gmail send
  // const sendNoteToGmail = async () => {
  //   if (!accessToken) {
  //     alert("Google token not found — please log in again.");
  //     return;
  //   }
  //   if (!selectedNote) {
  //     alert("No note selected.");
  //     return;
  //   }

  //   try {
  //     const emailBody = [
  //       `To: ${userEmail}`,
  //       `Subject: ${selectedNote.title || "Untitled Note"}`,
  //       "Content-Type: text/plain; charset=UTF-8",
  //       "",
  //       selectedNote.content || "(No content)",
  //     ].join("\n");

  //     const encodedMessage = btoa(unescape(encodeURIComponent(emailBody)))
  //       .replace(/\+/g, "-")
  //       .replace(/\//g, "_")
  //       .replace(/=+$/, "");

  //     const res = await fetch(
  //       "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ raw: encodedMessage }),
  //       }
  //     );

  //     if (res.ok) {
  //       alert("✅ Note saved on cloud in your Gmail Sent folder!");
  //     } else {
  //       const err = await res.json();
  //       console.error("Gmail save error:", err);
  //       alert("⚠️ Failed to Save note. Please try again.");
  //     }
  //   } catch (err) {
  //     console.error("Save to Gmail failed:", err);
  //     alert("⚠️ Error saving note.");
  //   }
  // };

  const sendNoteToGmail = async () => {
    if (!accessToken) {
      alert("Google token not found — please log in again.");
      return;
    }
    if (!selectedNote) {
      alert("No note selected.");
      return;
    }

    try {
      const emailBody = [
        `From: ${userEmail}`,
        `To: ${userEmail}`,
        `Subject: ${selectedNote.title || "Untitled Note"}`,
        "Content-Type: text/plain; charset=UTF-8",
        "X-Label-Note: SavedNote",
        "",
        selectedNote.content || "(No content)",
      ].join("\n");

      const encodedMessage = btoa(unescape(encodeURIComponent(emailBody)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      // Step 1: Send the message
      const sendRes = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raw: encodedMessage }),
        }
      );

      if (!sendRes.ok) {
        const err = await sendRes.json();
        console.error("Gmail send error:", err);
        alert("⚠️ Failed to send note. Please try again.");
        return;
      }

      const sentData = await sendRes.json();

      // Step 2: Remove from inbox (if Gmail duplicates it)
      await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${sentData.id}/modify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            removeLabelIds: ["INBOX"],
            addLabelIds: ["SENT"],
          }),
        }
      );

      alert("✅ Note saved on cloud check your Gmail Sent folder!");
    } catch (err) {
      console.error("Send to Gmail failed:", err);
      alert("⚠️ Error saving note.");
    }
  };



  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 select-none">
        <span className="text-xs text-yellow-400 font-mono tracking-widest">
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
        {userEmail && (
          <span className="text-xs text-yellow-500 truncate max-w-[150px]">
            {userEmail}
          </span>
        )}
      </div>

      {/* Header */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-yellow-400 tracking-tight">Notepad</h1>
      </div>

      {/* Search */}
      <div className="px-4 pb-2">
        <input
          className="w-full rounded-full bg-neutral-900 text-yellow-100 placeholder:text-neutral-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-2 pb-24">
        <div className="text-xs text-neutral-400 uppercase px-2 pt-2 pb-1">Notes</div>
        {filteredNotes.length === 0 && (
          <div className="text-neutral-600 text-center mt-8">No notes yet.</div>
        )}
        <ul>
          {filteredNotes.map((note) => (
            <li key={note.id}>
              <button
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition ${
                  note.id === selectedId
                    ? "bg-blue-900/30 border border-blue-400 text-blue-100 font-semibold"
                    : "bg-neutral-900 text-blue-100 hover:bg-yellow-900/20"
                }`}
                onClick={() => handleSelectNote(note.id)}
              >
                <div className="truncate">{note.title || "Untitled Note"}</div>
                <div className="text-xs text-neutral-400 truncate">
                  {note.content?.slice(0, 40)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Note Editor */}
      {selectedNote && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-95 flex flex-col md:static md:bg-transparent md:p-0 transition-all duration-300 mb-24">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <button
              className="flex text-yellow-400 font-bold text-lg"
              onClick={() => setSelectedId(null)}
              aria-label="Close Note Editor"
            >
              ←
            </button>
            <span className="text-yellow-400 font-semibold text-lg">Edit Note</span>
            <span />
          </div>
          <div className="flex-1 flex flex-col p-4">
            <input
              className="w-full mb-2 px-2 py-2 border-b border-neutral-700 bg-transparent text-xl font-semibold text-yellow-100 focus:outline-none focus:border-yellow-400"
              value={selectedNote.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Title"
            />
            <textarea
              className="flex-1 w-full px-2 py-2 border border-neutral-700 rounded resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-neutral-900 text-blue-100 text-base"
              value={selectedNote.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start typing your note..."
              rows={16}
              style={{ minHeight: "400px" }}
            />
            <div className="flex justify-between items-center mt-3">
              <span
                className={`text-xs ${
                  saveStatus === "Saving..." ? "text-yellow-400" : "text-green-500"
                }`}
              >
                {saveStatus}
              </span>

              {userEmail && (
                <button
                  onClick={sendNoteToGmail}
                  className="flex items-center gap-1 bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-300 transition"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  Save to Gmail
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between px-8 py-3 md:px-16 ">
        <button
          className="flex flex-col items-center text-yellow-400 hover:text-yellow-300"
          onClick={handleCreateNote}
        >
          <PencilSquareIcon className="w-7 h-7" />
          <span className="text-xs mt-1">New Note</span>
        </button>
      </div>

      {/* Support popup */}
      {showSupport && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-70 flex items-center justify-center">
          <div className="bg-neutral-50 rounded-2xl shadow-xl p-6 w-80 flex flex-col items-center relative">
            <button
              className="absolute top-2 right-2 text-blue-400 hover:text-blue-300"
              onClick={() => setShowSupport(false)}
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-blue-400 mb-2" />
            <h2 className="text-blue-400 font-bold text-lg mb-2">Need Help?</h2>
            <p className="text-blue-400 text-center mb-4">
              Contact our support team if you have any questions or need assistance.
            </p>
            <a
              href="mailto:publicaffair@imfgrant.com"
              className="px-4 py-2 rounded bg-blue-400 text-black font-bold hover:bg-blue-300 transition"
            >
              Contact Support
            </a>
          </div>
        </div>
      )}
    </div>
  );
}