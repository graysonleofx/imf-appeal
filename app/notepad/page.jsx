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
  const [sendingStatus, setSendingStatus] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [accessToken, setAccessToken] = useState("");

  // Load Supabase session to get Google user & token
  useEffect(() => {
    const getUserSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email);
        // Supabase Google provider stores access_token in session
        setAccessToken(session.provider_token);
      }
    };
    getUserSession();
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

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem("notes-app-v1", JSON.stringify(notes));
  }, [notes]);

  // Auto-save indicator
  useEffect(() => {
    if (saveStatus === "Saving...") {
      const t = setTimeout(() => setSaveStatus("All changes saved"), 1000);
      return () => clearTimeout(t);
    }
  }, [saveStatus]);

  // Show support popup
  useEffect(() => {
    const timer = setTimeout(() => setShowSupport(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  // Filter notes by search
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateNote = () => {
    const newNote = {
      id: generateId(),
      title: "",
      content: "",
    };
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

  // --- Gmail Send Function ---
  const sendNoteToGmail = async () => {
    if (!accessToken) {
      alert("Please sign in with Google to send notes.");
      return;
    }
    if (!selectedNote) {
      alert("No note selected.");
      return;
    }

    setSendingStatus("Sending...");

    try {
      const email = [
        `To: ${userEmail}`,
        "Subject: " + (selectedNote.title || "Untitled Note"),
        "Content-Type: text/plain; charset=UTF-8",
        "",
        selectedNote.content || "(No content)",
      ].join("\n");

      const encodedMessage = btoa(unescape(encodeURIComponent(email)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const response = await fetch(
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

      if (response.ok) {
        setSendingStatus("Sent!");
        setTimeout(() => setSendingStatus(""), 3000);
      } else {
        const error = await response.json();
        console.error("Gmail Send Error:", error);
        setSendingStatus("Error sending note.");
      }
    } catch (err) {
      console.error("Send error:", err);
      setSendingStatus("Error sending note.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 select-none">
        <span className="text-xs text-yellow-400 font-mono tracking-widest">
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {userEmail && (
          <span className="text-xs text-yellow-500 truncate max-w-[150px]">
            {userEmail}
          </span>
        )}
      </div>

      {/* Header */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-yellow-400 tracking-tight">
          Notepad
        </h1>
      </div>

      {/* Search Bar */}
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
        <div className="text-xs text-neutral-400 uppercase px-2 pt-2 pb-1">
          Notes
        </div>
        {filteredNotes.length === 0 && (
          <div className="text-neutral-600 text-center mt-8">
            No notes yet.
          </div>
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

      {/* Main Editor */}
      {selectedNote && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-95 flex flex-col md:static md:bg-transparent md:p-0 transition-all">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <button
              className="md:hidden text-yellow-400 font-bold text-lg"
              onClick={() => setSelectedId(null)}
              aria-label="Back"
            >
              ←
            </button>
            <span className="text-yellow-400 font-semibold text-lg">
              Edit Note
            </span>
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
              style={{ minHeight: "300px" }}
            />
            <div className="flex justify-between items-center mt-3">
              <div>
                <span
                  className={`text-xs ${
                    saveStatus === "Saving..."
                      ? "text-yellow-400"
                      : "text-green-500"
                  }`}
                >
                  {saveStatus}
                </span>
              </div>

              {/* Send to Gmail Button */}
              {userEmail && (
                <button
                  onClick={sendNoteToGmail}
                  className="flex items-center gap-1 bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-300 transition"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  Send to Gmail
                </button>
              )}
            </div>

            {sendingStatus && (
              <div className="text-xs text-yellow-400 mt-2">{sendingStatus}</div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between px-8 py-3 md:px-16">
        <button
          className="flex flex-col items-center text-yellow-400 hover:text-yellow-300"
          onClick={handleCreateNote}
        >
          <PencilSquareIcon className="w-7 h-7" />
          <span className="text-xs mt-1">New Note</span>
        </button>
      </div>

      {/* Support Popup */}
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
              Contact our support team if you have any questions or need
              assistance.
            </p>
            <a
              href="mailto:support@imfgrant.com"
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
