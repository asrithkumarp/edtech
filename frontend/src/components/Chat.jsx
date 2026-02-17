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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-96">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white text-lg">💬 Message</h3>
            <p className="text-indigo-100 text-xs">Chat with mentor/student</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white font-bold text-xl w-8 h-8 rounded-full transition flex items-center justify-center"
          >
            ✖
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No messages yet. Start the conversation! 👋</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUserId;

              return (
                <div
                  key={msg._id || msg.timestamp}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2.5 rounded-2xl ${
                      isMine
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-none shadow-md"
                        : "bg-white text-gray-800 rounded-bl-none border-2 border-gray-200 shadow-sm"
                    }`}
                  >
                    <div className="text-sm">{msg.message}</div>

                    <div className={`text-xs mt-1 ${isMine ? "text-indigo-100" : "text-gray-500"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>

                    {isMine && (
                      <div className="text-xs text-indigo-100">
                        {msg.seen ? "✓✓ Seen" : "✓ Sent"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t-2 border-gray-200 p-4 flex gap-2">
          <input
            className="flex-1 border-2 border-gray-300 rounded-full px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-full font-semibold transition transform hover:scale-105 active:scale-95 text-sm"
          >
            📤 Send
          </button>
        </div>

      </div>
    </div>
  );
}
