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

// Function to extract and clean the summary from the API response
const extractCleanSummary = (rawSummary: string): string => {
  if (!rawSummary) return "";

  // Check if it's already a clean summary (no ### Response: markers)
  if (!rawSummary.includes("### Response:")) {
    return cleanText(rawSummary);
  }

  // Try to find the final summary by looking for "### Response:" patterns
  const responseSections = rawSummary.split("### Response:");

  if (responseSections.length > 0) {
    // Get the last response section (which should be the final summary)
    const lastResponse = responseSections[responseSections.length - 1];

    // Remove any remaining markers, tags, and extra whitespace
    const cleaned = lastResponse
      .replace(/\[\/s\]/g, "")
      .replace(/<s>/g, "")
      .replace(/<\/INST>/g, "")
      .replace(/---/g, "")
      .replace(
        /Create a concise final summary from the following summaries:/g,
        ""
      )
      .replace(/### Response:/g, "")
      .replace(/\n{3,}/g, "\n\n") // Replace 3+ newlines with double newlines
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();

    console.log("Extracted summary:", cleaned);
    return cleaned;
  }

  // If no response sections found, clean the whole text
  return cleanText(rawSummary);
};

// Function to format summary for better readability
const formatSummary = (text: string): string => {
  if (!text) return "";

  // Split into paragraphs
  const paragraphs = text.split("\n").filter((p) => p.trim().length > 0);

  if (paragraphs.length === 0) return "";

  // Format each paragraph
  const formatted = paragraphs
    .map((paragraph) => {
      // Clean the paragraph
      let cleaned = paragraph.trim();

      // Remove any remaining markers
      cleaned = cleaned
        .replace(/\[\/s\]/g, "")
        .replace(/<s>/g, "")
        .replace(/<\/INST>/g, "")
        .replace(/---/g, "");

      // Capitalize first letter of paragraph
      if (cleaned.length > 0) {
        const firstChar = cleaned.charAt(0).toUpperCase();
        const rest = cleaned.slice(1);
        cleaned = firstChar + rest;
      }

      // Ensure paragraph ends with a period if it doesn't have proper punctuation
      if (cleaned.length > 0 && !/[.!?]$/.test(cleaned.trim())) {
        cleaned = cleaned.trim() + ".";
      }

      return cleaned.trim();
    })
    .filter((p) => p.length > 0) // Remove empty paragraphs
    .join("\n\n");

  return formatted;
};

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

  // Extract and format the summary
  const formattedSummary = formatSummary(extractCleanSummary(summary));

  // Log for debugging
  useEffect(() => {
    console.log("Original summary:", summary);
    console.log("Formatted summary:", formattedSummary);
  }, [summary, formattedSummary]);

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
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-blue-100 rounded-lg transition-colors bg-blue-50 cursor-pointer"
          >
            New Session
          </button>
        </div>
      </div>

      {/* Summary Section - Always show if we have a session */}
      {sessionId && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                Document Summary
              </h2>
            </div>

            {formattedSummary ? (
              <div className="prose prose-blue max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {formattedSummary.split("\n").map((paragraph, index) => (
                    <p key={index} className="mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-600 italic py-2">
                No summary available. Ask questions about your document to get
                started.
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-blue-100">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Tip:</span> Ask questions about
                this document to learn more.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl shadow border border-gray-200">
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
