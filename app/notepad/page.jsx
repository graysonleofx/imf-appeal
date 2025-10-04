"use client"

import {useSession} from "next-auth/react"
import { useState, useEffect } from "react"

export default function NotepadPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState("")
  const [showSupport, setShowSupport] = useState(false)
  const [noteTitle, setNoteTitle] = useState("")
  const [saveStatus, setSaveStatus] = useState("All changes saved")
  
  const handleSubmit = async () => {
    if (!note.trim()) {
      alert("Please enter a note before submitting.")
      return
    }

    setSaveStatus("Saving...")

    const payload = {
      email: session.user.email,
      title: noteTitle,
      content: note,
    }

    try {
      const response = await fetch('/api/submit-appeal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSaveStatus("All changes saved")
        alert("Appeal submitted successfully!")
        setNote("")
        setNoteTitle("")
        localStorage.removeItem(`note-${session.user.email}`)
      } else {
        throw new Error("Failed to submit appeal.")
      }
    } catch (error) {
      console.error("Error submitting appeal:", error)
      setSaveStatus("Error saving changes")
      alert("There was an error submitting your appeal. Please try again later.")
    } finally {
      setTimeout(() => setSaveStatus("All changes saved"), 3000)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(false)
      const savedNote = localStorage.getItem(`note-${session.user.email}`)
      if (savedNote) {
        setNote(savedNote)
      }
    }
    if (status === "unauthenticated") {
      setLoading(false)
    }

    const timer = setTimeout(() => {
      setShowSupport(true)
      setLoading(false)
    }, 15000) // 15 seconds timeout

    return () => clearTimeout(timer)
  }, [status])

  const handleSave = () => {
    if (session?.user?.email) {
      localStorage.setItem(`note-${session.user.email}`, note)  

      alert("Note saved!")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }
  if (!session) {
    return <div>Please sign in to access your notepad.</div>
  }

  return (
    <>
      {!showSupport && (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">IMF Access Grant Notepad</h1>
              <p className="text-sm text-gray-500">Write and save your notes or Grant access securely.</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 font-medium">{session.user.name || session.user.email}</span>
              <img
                src={session.user.image || "/user.png"}
                alt="User"
                className="w-8 h-8 rounded-full border"
              />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center px-2 py-6">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6">
              {/* Title Input */}
              <input
                type="text"
                className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg font-semibold"
                placeholder="Title (optional)"
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
              />

              {/* Textarea */}
              <textarea
                className="w-full h-56 md:h-72 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-base"
                placeholder="Write your note or appeal here..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={12}
              />

              {/* Status & Actions */}
              <div className="flex items-center justify-between mt-4">
                <span className={`text-sm ${saveStatus === "Saving..." ? "text-yellow-600" : "text-green-600"}`}>
                  {saveStatus}
                </span>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded transition"
                  disabled={saveStatus === "Saving..."}
                >
                  Submit Appeal
                </button>
              </div>
            </div>
          </main>
        </div>
      )}

      {showSupport && (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-6">
          <div className="bg-white rounded-lg shadow p-6 max-w-md text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Need Help?</h2>
            <p className="text-gray-600 mb-6">If you're experiencing issues or need assistance, please reach out to our support team.</p>
            <a
              href="mailto:support@example.com"
              className="text-blue-600 hover:underline"
            >
              publicaffair@imfgrant.org
            </a>
          </div>
        </div>
      )}
    </>
  )
}