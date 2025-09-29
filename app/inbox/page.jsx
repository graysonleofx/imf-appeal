import GmailInbox from "../../components/gmail-inbox";

export default function InboxPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold"> User Inbox</h1>
      <GmailInbox />
    </div>
  );
}