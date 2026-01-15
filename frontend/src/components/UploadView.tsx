import { uploadPDF, uploadText } from "../api/ingest";
import { useState } from "react";

export function UploadView({
  onSessionCreated,
}: {
  onSessionCreated: (sessionId: string) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePDF = async (file: File) => {
    setLoading(true);
    const res = await uploadPDF(file);
    onSessionCreated(res.sessionId);
  };

  const handleText = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const res = await uploadText(text);
    onSessionCreated(res.sessionId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-center">ExplainThis</h1>

        <label className="block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer">
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => e.target.files && handlePDF(e.target.files[0])}
          />
          <span className="text-gray-600">Upload PDF</span>
        </label>

        <textarea
          className="w-full border rounded-lg p-3"
          rows={4}
          placeholder="Or paste text here"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={handleText}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          {loading ? "Processing..." : "Submit Text"}
        </button>
      </div>
    </div>
  );
}
