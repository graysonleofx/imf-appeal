"use client"

import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import {getUserFromSupabase} from  "./helpers/getUsers"

async function syncUserEmails(profileId) {
  if(!profileId){
    console.error("❌ No profile ID provided");
    return;
  }
  // Step 1: Fetch user from Supabase
  const { data: user, error } = await supabase
    .from('gmail_users')
    .select('*')
    .eq('id', profileId.toString()) // This ID should come from your auth/session
    .maybeSingle();

  
  console.log("Looking up user with ID:", profileId);
  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }

  if (!user) {
    console.log("❌ User not found in Supabase.");
    return null;
  }

  console.log("✅ User exists:", user);
  setUser(user);
  return {
    email: user.email,
    accessToken: user.accessToken, // make sure this column exists
  };
}


export default function GmailInbox() {
  const [message, setMessages] = useState([]);
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true);
  const  [user, setUser] = useState(null); 

  const syncGmailMessages = async () => {
  try {
    const res = await fetch("/api/gmail/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        accessToken: user.accessToken,
        userEmail: user.email
      })
    }) 
    
    const result = await res.json();
    if (!res.ok) {
      console.error('❌ API Error:', result.error);
    } else {
      console.log('✅ Synced emails:', result);
      fetchGmailMessages({userEmail: user.email});
    }
  } catch (err) {
    console.error("Failed to sync messages:", err);
  }
  };

  const fetchGmailMessages = async ({userEmail}) => {
    try {
      const {data, error} = await supabase
        .from('gmail_messages')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false })
        .limit(50); // Fetch latest 50 messages

      if (error) {
        console.error("Supabase fetch error:", error);
        return;
      }

      setMessages(data || []);
      console.log("Fetched messages:", data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }

  useEffect(() => {
    const fetchUser = async() => {
      const sess = await getSession();
      setSession(sess)
      const userId = sess?.user?.id;
      const userEmail = sess?.user?.email
      const userAccessToken = sess?.accessToken

      console.log("Session userId:", userId, userEmail);

      if(!userId) return

      // Set the user state correctly
      setUser({
        id: userId,
        email: userEmail,
        accessToken: userAccessToken
      });
      
      await syncUserEmails(userId);

      setLoading(false);
    }

    // syncUserEmails(userId)
    fetchUser();
    // console.log(user);
  }, []);

  useEffect(() => {
    console.log('👤 User:', user);
  }, [user]);

  useEffect(() => {
    if(user?.accessToken && user?.email){
      syncGmailMessages(user.accessToken, user.email)
    }
  }, [user?.accessToken, user?.email])

  return (  
    <div className="p-4 border rounded shadow-md bg-white">
      <h2 className="text-lg font-semibold">Gmail Inbox</h2>
      {loading && <p className="text-gray-500">Loading emails...</p>}

      {!loading && (
        <ul className="mt-4 space-y-4 max-h-[550px] overflow-y-auto">
          {Array.isArray(message) && message.length > 0 ? (
            message.map((email) => (
              <li key={email.id} className="p-4 border rounded bg-gray-50">
                <p className="text-gray-600 "><strong className="w-1/4 ">From:</strong> {email.from}</p>
                <hr />
                <hr />
                <p className="text-gray-600"><strong className="w-1/4 ">Subject:</strong> {email.subject}</p>
                <hr />
                <p className="text-gray-600"><strong className="w-1/4 ">Message:</strong> {email.snippet}</p>
                <hr />
                <p className="text-gray-500 text-sm mt-2"><em>Received: {new Date(email.internal_date).toLocaleString()}</em></p>
                <p className="text-gray-600"><strong className="w-1/4 ">Body:</strong> {email.body}</p>
              </li>
            ))
          ) : (
            <li>No emails found.</li>
          )}
        </ul>
      )}
    </div>
  )

}