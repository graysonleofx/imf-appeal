"use client"

import { useState, useEffect } from "react"
import { FolderIcon, TrashIcon, PlusCircleIcon, PencilSquareIcon } from "@heroicons/react/24/solid"
import { ChatBubbleLeftRightIcon, XMarkIcon } from "@heroicons/react/24/outline"

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

export default function NotepadPage() {
  const [notes, setNotes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState("")
  const [saveStatus, setSaveStatus] = useState("All changes saved")
  const [showSupport, setShowSupport] = useState(false)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [folders] = useState([
    { label: "Notes", icon: FolderIcon, count: 10 },
    { label: "Recently Deleted", icon: TrashIcon, count: 8 },
  ])

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("notes-app-v1")
    if (saved) {
      setNotes(JSON.parse(saved))
      if (JSON.parse(saved).length > 0) setSelectedId(JSON.parse(saved)[0].id)
    }
  }, [])

  // Save notes to localStorage on change
  useEffect(() => {
    localStorage.setItem("notes-app-v1", JSON.stringify(notes))
  }, [notes])

  // Auto-save status
  useEffect(() => {
    if (saveStatus === "Saving...") {
      const t = setTimeout(() => setSaveStatus("All changes saved"), 1000)
      return () => clearTimeout(t)
    }
  }, [saveStatus])

  // Show support popup after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSupport(true), 30000)
    return () => clearTimeout(timer)
  }, [])

  // Filter notes by search
  const filteredNotes = notes.filter(
    n =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateNote = () => {
    const newNote = {
      id: generateId(),
      title: "",
      content: "",
    }
    setNotes([newNote, ...notes])
    setSelectedId(newNote.id)
    setSaveStatus("Saving...")
  }

  const handleSelectNote = (id) => setSelectedId(id)

  const handleContentChange = (val) => {
    setNotes(notes =>
      notes.map(n =>
        n.id === selectedId ? { ...n, content: val } : n
      )
    )
    setSaveStatus("Saving...")
  }

  const handleTitleChange = (val) => {
    setNotes(notes =>
      notes.map(n =>
        n.id === selectedId ? { ...n, title: val } : n
      )
    )
    setSaveStatus("Saving...")
  }

  const selectedNote = notes.find(n => n.id === selectedId)

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* iOS-style status bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 select-none">
        <span className="text-xs text-yellow-400 font-mono tracking-widest">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <div className="flex items-center gap-1">
          {/* Fake signal/wifi/battery icons */}
          {/* <span className="w-4 h-2 bg-yellow-400 rounded-sm mr-1"></span>
          <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
          <span className="w-3 h-2 bg-yellow-400 rounded-sm"></span> */}
        </div>
      </div>

      {/* Header */}
      <div className="px-4 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-yellow-400 tracking-tight">Notepad</h1>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-2">
        <input
          className="w-full rounded-full bg-neutral-900 text-yellow-100 placeholder:text-neutral-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Folders Section */}
      {/* <div className="px-4 pb-2">
        <div className="text-xs text-neutral-400 uppercase mb-1">On My iPhone</div>
        <div className="flex flex-col gap-1">
          {folders.map(({ label, icon: Icon, count }) => (
            <div
              key={label}
              className="flex items-center justify-between bg-neutral-900 rounded-lg px-4 py-3 mb-1"
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-6 h-6 ${label === "Recently Deleted" ? "text-yellow-400" : "text-yellow-400"}`} />
                <span className="text-yellow-100 font-medium">{label}</span>
              </div>
              <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-2 pb-24">
        <div className="text-xs text-neutral-400 uppercase px-2 pt-2 pb-1">Notes</div>
        {filteredNotes.length === 0 && (
          <div className="text-neutral-600 text-center mt-8">No notes yet.</div>
        )}
        <ul>
          {filteredNotes.map(note => (
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
                <div className="text-xs text-neutral-400 truncate">{note.content?.slice(0, 40)}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Editor (Drawer style for mobile) */}
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
            <span className="text-yellow-400 font-semibold text-lg">Edit Note</span>
            <span />
          </div>
          <div className="flex-1 flex flex-col p-4">
            <input
              className="w-full mb-2 px-2 py-2 border-b border-neutral-700 bg-transparent text-xl font-semibold text-yellow-100 focus:outline-none focus:border-yellow-400"
              value={selectedNote.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Title"
            />
            <textarea
              className="flex-1 w-full px-2 py-2 border border-neutral-700 rounded resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-neutral-900 text-blue-100 text-base"
              value={selectedNote.content}
              onChange={e => handleContentChange(e.target.value)}
              placeholder="Start typing your note..."
              rows={16}
              style={{ minHeight: "300px" }}
            />
            <div className="flex justify-end mt-2">
              <span className={`text-xs ${saveStatus === "Saving..." ? "text-yellow-400" : "text-green-500"}`}>
                {saveStatus}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between px-8 py-3 md:px-16">
        <button
          className="flex flex-col items-center text-yellow-400 hover:text-yellow-300"
          onClick={() => setShowNewFolder(true)}
        >
          <PlusCircleIcon className="w-7 h-7" />
          <span className="text-xs mt-1">New Folder</span>
        </button>
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
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-neutral-900 rounded-2xl shadow-xl p-6 w-80 flex flex-col items-center relative">
            <button
              className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-300"
              onClick={() => setShowSupport(false)}
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-yellow-400 mb-2" />
            <h2 className="text-yellow-400 font-bold text-lg mb-2">Need Help?</h2>
            <p className="text-yellow-100 text-center mb-4">Contact our support team if you have any questions or need assistance.</p>
            <a href="mailto:publicaffair@imfgrant.com" className="text-yellow-400 hover:text-yellow-300 mb-4">publicaffair@imfgrant.com</a>
            <a
              href="mailto:publicaffair@imfgrant.com"
              className="px-4 py-2 rounded bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition"
            >
              Contact Support
            </a>
          </div>
        </div>
      )}
    </div>

  )
}