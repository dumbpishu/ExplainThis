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
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePDFUpload = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    const parsingToast = toast.loading("Processing PDF...", {
      duration: Infinity,
    });

    try {
      const res = await uploadPDF(file);

      toast.success("Document ready! Loading chat...", {
        id: parsingToast,
        duration: 2000,
      });

      setTimeout(() => {
        onSessionCreated(res.sessionId, res.summary);
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to process PDF", {
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
    const parsingToast = toast.loading("Processing text...", {
      duration: Infinity,
    });

    try {
      const res = await uploadText(text);

      toast.success("Text processed! Loading chat...", {
        id: parsingToast,
        duration: 2000,
      });

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      handlePDFUpload(file);
    } else {
      toast.error("Please drop a PDF file");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-blue-50 p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-4">
            <span className="text-2xl font-bold">ET</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ExplainThis AI
          </h1>
          <p className="text-gray-600 text-lg">
            Upload a document to start chatting
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* PDF Upload Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Upload PDF Document
            </h2>

            <div
              className={`border-3 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }`}
              onClick={() => !isLoading && fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />

              <div className="text-5xl mb-3">📄</div>
              <h3 className="text-gray-700 font-medium mb-2">
                Drop PDF here or click to browse
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Supports PDF files only
              </p>

              <button
                className={`px-5 py-2 rounded-lg font-medium ${
                  isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Select PDF"}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-gray-500 font-medium">
                OR
              </span>
            </div>
          </div>

          {/* Text Input Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Paste Text Content
            </h2>

            <div className="mb-4">
              <textarea
                className="w-full h-40 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-700 placeholder:text-gray-400"
                placeholder="Paste your text content here... You can paste articles, documents, or any text you want to analyze."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
              />
              <div className="flex justify-end mt-2">
                <span className="text-sm text-gray-500">
                  {text.length} characters
                </span>
              </div>
            </div>

            <button
              onClick={handleTextUpload}
              disabled={isLoading || !text.trim()}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all cursor-pointer ${
                isLoading || !text.trim()
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-800 text-white hover:bg-gray-900"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  Processing...
                </span>
              ) : (
                "Process Text"
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-lg">💡</span>
              <p className="text-sm">
                <span className="font-medium">Tip:</span> You can ask questions
                about your document after uploading.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
