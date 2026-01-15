import { useState } from "react";
import { Toaster } from "react-hot-toast";
import UploadView from "./components/UploadView";
import ChatView from "./components/ChatView";

export default function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [summary, setSummary] = useState("");

  const handleSessionCreated = (sessionId: string, summary: string) => {
    setSessionId(sessionId);
    setSummary(summary);
  };

  const handleNewSession = () => {
    setSessionId(null);
    setSummary("");
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

      {sessionId ? (
        <ChatView
          sessionId={sessionId}
          summary={summary}
          onNewSession={handleNewSession}
        />
      ) : (
        <UploadView onSessionCreated={handleSessionCreated} />
      )}
    </>
  );
}
