import { useState } from "react";
import { Toaster } from "react-hot-toast";
import UploadView from "./components/UploadView";
import ChatView from "./components/ChatView";

export default function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [chunkCount, setChunkCount] = useState(0);

  const handleSessionCreated = (
    sessionId: string,
    summary: string,
    chunkCount: number
  ) => {
    setSessionId(sessionId);
    setSummary(summary);
    setChunkCount(chunkCount);
  };

  const handleNewSession = () => {
    setSessionId(null);
    setSummary("");
    setChunkCount(0);
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
          chunkCount={chunkCount}
          onNewSession={handleNewSession}
        />
      ) : (
        <UploadView onSessionCreated={handleSessionCreated} />
      )}
    </>
  );
}
