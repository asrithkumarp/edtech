import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Chat({ receiverId, onClose }) {
  const currentUserId = localStorage.getItem("userId");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.emit("joinRoom", {
      senderId: currentUserId,
      receiverId
    });

    socket.on("chatHistory", (history) => {
      setMessages(history);
    });

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chatHistory");
      socket.off("receiveMessage");
    };
  }, [receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("sendMessage", {
      senderId: currentUserId,
      receiverId,
      message
    });

    setMessage("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white w-96 p-4 rounded shadow-lg">

        {/* Header */}
        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">Private Chat</h3>
          <button
  onClick={onClose}
  className="text-red-500 font-bold text-lg"
>
  ✖
</button>

        </div>

        {/* Messages */}
        <div className="h-72 overflow-y-auto border p-3 mb-4 bg-gray-50 rounded">
          {messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;

            return (
              <div
                key={msg._id || msg.timestamp}
                className={`flex mb-2 ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg max-w-xs ${
                    isMine
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-gray-300 text-black rounded-bl-none"
                  }`}
                >
                  <div>{msg.message}</div>

                  <div className="text-xs mt-1 opacity-70 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>

                  {isMine && (
                    <div className="text-xs text-right opacity-70">
                      {msg.seen ? "Seen" : "Sent"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            className="border p-2 flex-1 rounded"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type message..."
          />
          <button
            onClick={sendMessage}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}
