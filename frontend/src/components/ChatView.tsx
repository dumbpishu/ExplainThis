import { useState } from "react";
import { askQuestion } from "../api/chat";
import { MessageBubble } from "./MessageBubble";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatView({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;

    const question = input;
    setInput("");

    setMessages((m) => [...m, { role: "user", content: question }]);
    setLoading(true);

    const res = await askQuestion(sessionId, question);

    setMessages((m) => [...m, { role: "assistant", content: res.answer }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white px-6 py-4 shadow font-semibold">
        ExplainThis — Chat
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} {...m} />
        ))}
      </main>

      <footer className="bg-white p-4 border-t flex gap-2">
        <input
          className="flex-1 border rounded-lg px-4 py-2"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </footer>
    </div>
  );
}
