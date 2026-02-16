import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Chat({ receiverId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const senderId = localStorage.getItem("userId");

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (
        (msg.senderId === senderId && msg.receiverId === receiverId) ||
        (msg.senderId === receiverId && msg.receiverId === senderId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [receiverId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("sendMessage", {
      senderId,
      receiverId,
      message
    });

    setMessage("");
  };

  return (
    <div className="border p-4 rounded bg-white shadow mt-4">
      <div className="h-64 overflow-y-auto mb-4 border p-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.senderId === senderId
                ? "text-right text-blue-600"
                : "text-left text-gray-700"
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="border p-2 flex-1"
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
  );
}
