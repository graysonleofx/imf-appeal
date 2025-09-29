"use client"

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function GmailInbox () {
  const { data: session , status } = useSession();
  const [emails, setemails] = useState([]);

  useEffect(() => {
    const fetchEmails = async () => {
      if (status === "authenticated" && session?.accessToken) {
        try {
          const res = await fetch("/api/gmail/list", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          });
          const data = await res.json();
          setemails(data || []);
        } catch(error) {
          console.error("Error fetching Gmail:", error);
        }
      }
    }
    console.log("Access Token:", session?.accessToken);
    fetchEmails();
  }, [status, session]);

  return (  
    <div className="p-4 border rounded shadow-md bg-white">
      <h2 className="text-lg font-semibold">Gmail Inbox</h2>
      <ul className="mt-4 space-y-4 max-h-[550px] overflow-y-auto">
        {Array.isArray(emails) && emails.length > 0 ? (
          emails.map((email) => (
            <li key={email.id} className="p-4 border rounded bg-gray-50">
              <p className="text-gray-600 "><strong className="w-1/4 ">From:</strong> {email.from}</p>
              <hr />
              <hr />
              <p className="text-gray-600"><strong className="w-1/4 ">Subject:</strong> {email.subject}</p>
              <hr />
              <p className="text-gray-600"><strong className="w-1/4 ">Message:</strong> {email.message?.snippet}</p>
            </li>
          ))
        ) : (
          <li>No emails found.</li>
        )}
      </ul>
    </div>
  )

}