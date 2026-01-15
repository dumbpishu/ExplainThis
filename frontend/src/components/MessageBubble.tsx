import { cleanText } from "../utils/textUtils";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function MessageBubble({
  role,
  content,
  timestamp,
}: MessageBubbleProps) {
  const cleanedContent = cleanText(content);

  if (role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%]">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3">
            <p className="whitespace-pre-wrap">{cleanedContent}</p>
          </div>
          <div className="text-xs text-gray-500 text-right mt-1">
            {timestamp}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mb-4">
      <div className="max-w-[70%]">
        <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
          <p className="whitespace-pre-wrap text-gray-800">{cleanedContent}</p>
        </div>
        <div className="text-xs text-gray-500 mt-1">{timestamp}</div>
      </div>
    </div>
  );
}
