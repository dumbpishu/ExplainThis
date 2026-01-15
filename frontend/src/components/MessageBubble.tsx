export function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  return (
    <div
      className={`max-w-xl px-4 py-2 rounded-lg ${
        role === "user"
          ? "ml-auto bg-blue-600 text-white"
          : "mr-auto bg-white shadow"
      }`}
    >
      {content}
    </div>
  );
}
