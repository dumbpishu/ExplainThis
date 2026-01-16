import { useState, useRef, useEffect } from "react";
import { askQuestion } from "../api/chat";
import { deleteSession } from "../api/session";
import MessageBubble from "./MessageBubble";
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";
import { extractCleanSummary, formatSummary } from "../utils/formatText";
import { formatTime } from "../utils/dateTime";

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
  const [isSummaryVisible, setIsSummaryVisible] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Extract and format the summary
  const formattedSummary = formatSummary(extractCleanSummary(summary));

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewSession = async () => {
    setShowConfirmModal(true);
  };

  const confirmNewSession = async () => {
    try {
      await deleteSession(sessionId);
      toast.success("Session cleared successfully");
      onNewSession();
    } catch (error: any) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to clear session. Please try again.");
    } finally {
      setShowConfirmModal(false);
    }
  };

  const cancelNewSession = () => {
    setShowConfirmModal(false);
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const question = trimmedInput;
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
        content: res.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to get response. Please try again.");

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error while processing your request. Please try again.",
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

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    toast.success("Session ID copied!");
  };

  return (
    <>
      <div
        className={`min-h-screen bg-linear-to-br from-gray-50 to-blue-50 ${
          showConfirmModal ? "blur-sm" : ""
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-2 rounded-lg cursor-default">
                  <span className="text-lg font-bold">ET</span>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                    ExplainThis AI
                  </h1>
                  <button
                    onClick={copySessionId}
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer hover:underline"
                    title="Click to copy session ID"
                  >
                    Session: {sessionId.substring(0, 10)}...
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* New Session Button */}
                <button
                  onClick={handleNewSession}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>+ New Session</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Summary Section - Collapsible */}
          {sessionId && isSummaryVisible && (
            <div className="mb-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div
                  onClick={() => setIsSummaryVisible(false)}
                  className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                      <span className="font-semibold text-lg">📄</span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-800 text-base sm:text-lg">
                        Document Summary
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Key insights from your document (click to collapse)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSummaryVisible(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
                    title="Hide summary"
                  >
                    <span className="text-xl">×</span>
                  </button>
                </div>
                <div className="p-4 sm:p-5">
                  {formattedSummary ? (
                    <div className="text-gray-700 leading-relaxed">
                      <div className="prose prose-sm sm:prose max-w-none">
                        {formattedSummary.split("\n").map(
                          (paragraph, index) =>
                            paragraph.trim() && (
                              <div key={index} className="mb-4 last:mb-0">
                                <p className="text-gray-800 leading-relaxed text-sm sm:text-base">
                                  {paragraph}
                                </p>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-gray-500 text-base mb-2">
                        📝 No summary available yet
                      </p>
                      <p className="text-sm text-gray-400">
                        Upload a document or ask questions to generate a summary
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Show Summary Button (when hidden) */}
          {sessionId && !isSummaryVisible && (
            <div className="mb-4">
              <button
                onClick={() => setIsSummaryVisible(true)}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer shadow-sm hover:shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                    <span className="font-semibold text-lg">📄</span>
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-gray-700 text-sm sm:text-base">
                      Show Document Summary
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Click to view document insights
                    </p>
                  </div>
                </div>
                <span className="text-gray-400 text-xl">▶</span>
              </button>
            </div>
          )}

          {/* Chat Area */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Messages Container */}
            <div className="h-[calc(100vh-220px)] sm:h-[calc(100vh-280px)] min-h-75 max-h-150 overflow-y-auto p-3 sm:p-4">
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
                  <div className="flex items-center gap-3 pl-4">
                    <div className="p-2">
                      <LoadingSpinner />
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-600 text-sm sm:text-base">
                        Thinking...
                      </div>
                      <div className="text-xs text-gray-400">
                        Analyzing your question
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
              <div className="flex items-end gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base resize-none placeholder:text-gray-400 overflow-y-auto hide-scrollbar"
                    placeholder="Type your question here..."
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                    maxLength={500}
                  />
                  {input.length > 0 && (
                    <div className="absolute right-2 top-2">
                      <span className="text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-200">
                        {input.length}/500
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="px-4 sm:px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-sm sm:text-base whitespace-nowrap h-10.5 sm:h-12 flex items-center justify-center relative bottom-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner />
                      <span>Sending...</span>
                    </span>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
              <div className="mt-2 flex flex-col sm:flex-row sm:justify-between text-xs text-gray-500">
                <span className="mb-1 sm:mb-0 flex items-center gap-1">
                  <span className="hidden sm:inline">📝</span>
                  Press{" "}
                  <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                    Enter
                  </kbd>{" "}
                  to send
                </span>
                <span className="flex items-center gap-1">
                  Hold{" "}
                  <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                    Shift
                  </kbd>{" "}
                  +{" "}
                  <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                    Enter
                  </kbd>{" "}
                  for new line
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* Add custom CSS for scrollbar */}
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          .hide-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .hide-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 2px;
          }
          .hide-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-blur-sm bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <span className="text-lg">⚠️</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Start New Session?
                </h3>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 mb-6">
              <p className="text-yellow-800 text-sm">
                <span className="font-semibold">Note:</span> Your current chat
                messages will be lost.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelNewSession}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmNewSession}
                className="flex-1 px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors cursor-pointer font-medium"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
