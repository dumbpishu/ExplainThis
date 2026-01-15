import { useState, useRef, useEffect } from "react";
import { askQuestion } from "../api/chat";
import { deleteSession } from "../api/session";
import MessageBubble from "./MessageBubble";
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";
import { cleanText } from "../utils/textUtils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatViewProps {
  sessionId: string;
  summary: string;
  onNewSession: () => void;
}

export default function ChatView({
  sessionId,
  summary,
  onNewSession,
}: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm ready to answer questions about your document. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formattedSummary = cleanText(summary);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewSession = async () => {
    try {
      await deleteSession(sessionId);
      toast.success("Session cleared");
    } catch (error: any) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to clear session");
    } finally {
      onNewSession();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const question = input.trim();
    setInput("");
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await askQuestion(sessionId, question);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: cleanText(res.answer),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error.message || "Failed to get response");

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div>
            <h1 className="text-xl font-bold text-blue-900">ExplainThis</h1>
            <div className="mt-1 text-sm text-gray-600">
              Session: {sessionId.substring(0, 8)}...
            </div>
          </div>
          <button
            onClick={handleNewSession}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gra-900 hover:bg-blue-100 rounded-lg transition-colors bg-blue-50 cursor-pointer"
          >
            New Session
          </button>
        </div>
      </div>

      {/* Summary */}
      {formattedSummary && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {formattedSummary}
            </p>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {/* Messages */}
          <div className="h-125 overflow-y-auto p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={formatTime(message.timestamp)}
                />
              ))}

              {isLoading && (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner />
                  <span className="text-gray-600">Thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <textarea
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="Type your question..."
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
