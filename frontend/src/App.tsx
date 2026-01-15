import { useState } from "react";
import { UploadView } from "./components/UploadView";
import { ChatView } from "./components/ChatView";

export default function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  if (!sessionId) {
    return <UploadView onSessionCreated={setSessionId} />;
  }

  return <ChatView sessionId={sessionId} />;
}
