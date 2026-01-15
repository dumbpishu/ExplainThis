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
  if (role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%]">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3">
            <p className="whitespace-pre-wrap">{content}</p>
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
          <p className="whitespace-pre-wrap text-gray-800">{content}</p>
        </div>
        <div className="text-xs text-gray-500 mt-1">{timestamp}</div>
      </div>
    </div>
  );
}
