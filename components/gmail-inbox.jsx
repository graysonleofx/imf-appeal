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
              Authorization: `Bearer ${session.accessToken}`,
            },
          });
          const data = await res.json();
          setemails(data.messages || []);
        } catch(error) {
          console.error("Error fetching Gmail:", error);
        }
      }
    }
    fetchEmails();
  }, [status, session]);

  return (  
    <div>
      <h2>Gmail Inbox</h2>
      <ul >
        {emails.map(email => (
          <li key={email.id}>{email.subject}</li>
        ))}
      </ul>
    </div>
  )

}