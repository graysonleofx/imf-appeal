"use client"

import {useSession} from "next-auth/react"
import { useState, useEffect } from "react"

export default function NotepadPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState("")
  const [showSupport, setShowSupport] = useState(false)

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
    showSupport ? (
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="mt-4 p-4 border border-gray-300 rounded bg-white shadow-md flex flex-col justify-center align-center" style={{ padding: "20px", maxWidth: "600px", margin: "20px auto" }}>
          <h2 className="text-lg font-bold">Contact Support</h2>
          {/* Added content after h2 */}
          <p className="mt-2 text-gray-700">Our support team is available 24/7 to assist you with any issues or questions you may have.</p>
          <p className="mt-2 text-gray-700">You can reach us via email or phone:</p>
          <p className="mt-2 text-gray-700">Email: support@example.com</p>
          <p className="mt-2 text-gray-700">Phone: +1-234-567-890</p>
          <button onClick={() => { setShowSupport(false); window.location.href = '/'; }} className="mt-2 bg-blue-500 text-white py-1 px-3 rounded">Go Back</button>
        </div>
      </div>
    ) : (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "20px auto" }}>
        <h1 className="text-2xl font-bold text-gray-800 center">Welcome to the Notepad {session.user.name} </h1>
        <p className="mt-2 text-gray-600">You can write your notes below:</p>
        <textarea
          style={{ width: "100%", height: "300px", marginTop: "20px", border: "1px solid #ccc", borderRadius: "4px", padding: "10px" }}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={10}
          cols={30}
        />
        <button onClick={handleSave} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">Save Note</button>
      </div>
    )
  )
}