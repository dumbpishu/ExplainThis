import { useState, useRef } from "react";
import { uploadPDF, uploadText } from "../api/ingest";
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";

interface UploadViewProps {
  onSessionCreated: (sessionId: string, summary: string) => void;
}

export default function UploadView({ onSessionCreated }: UploadViewProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePDFUpload = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    // Show parsing toast that will stay visible
    const parsingToast = toast.loading("Parsing PDF...", {
      duration: Infinity,
    });

    try {
      const res = await uploadPDF(file);

      // Update toast to indicate processing is complete but wait before switching
      toast.success("PDF processed successfully! Loading chat...", {
        id: parsingToast,
        duration: 2000,
      });

      // Wait a moment to ensure toast is visible before switching
      setTimeout(() => {
        onSessionCreated(res.sessionId, res.summary);
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to upload PDF", {
        id: parsingToast,
        duration: 3000,
      });
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleTextUpload = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text");
      return;
    }

    setIsLoading(true);
    // Show parsing toast that will stay visible
    const parsingToast = toast.loading("Parsing text...", {
      duration: Infinity,
    });

    try {
      const res = await uploadText(text);

      // Update toast to indicate processing is complete but wait before switching
      toast.success("Text processed successfully! Loading chat...", {
        id: parsingToast,
        duration: 2000,
      });

      // Wait a moment to ensure toast is visible before switching
      setTimeout(() => {
        onSessionCreated(res.sessionId, res.summary);
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to process text", {
        id: parsingToast,
        duration: 3000,
      });
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      handlePDFUpload(file);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Chat
          </h1>
          <p className="text-gray-600">
            Upload a PDF or paste text to start chatting
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* PDF Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer m-2"
              >
                {isLoading ? <LoadingSpinner /> : "Select PDF File"}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste Text
            </label>
            <textarea
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
            <button
              onClick={handleTextUpload}
              disabled={isLoading || !text.trim()}
              className="w-full mt-4 py-3 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? <LoadingSpinner /> : "Process Text"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
