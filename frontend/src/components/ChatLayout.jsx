import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function ChatLayout({ sessions }) {
  const currentUserId = localStorage.getItem("userId");

  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!activeUser) return;

    socket.emit("joinRoom", {
      senderId: currentUserId,
      receiverId: activeUser._id
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
  }, [activeUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("sendMessage", {
      senderId: currentUserId,
      receiverId: activeUser._id,
      message
    });

    setMessage("");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-800">

      {/* LEFT SIDEBAR */}
      <div className="w-80 bg-slate-800 border-r border-white/10 overflow-y-auto shadow-xl">
        <div className="sticky top-0 p-6 font-bold text-xl text-white border-b border-white/10 bg-slate-800/80 backdrop-blur-sm">
          <span className="text-2xl mr-3">💬</span> Conversations
        </div>

        {sessions.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <p>No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {sessions.map((session) => {
              const user =
                session.studentId?._id === currentUserId
                  ? session.mentorId
                  : session.studentId;

              return (
                <div
                  key={session._id}
                  onClick={() => setActiveUser(user)}
                  className={`p-4 rounded-lg cursor-pointer transition transform hover:scale-105 ${
                    activeUser?._id === user?._id
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
                      : "bg-slate-700/50 text-gray-200 hover:bg-slate-700"
                  }`}
                >
                  <div className="font-semibold flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    {user?.name}
                  </div>
                  <p className="text-xs opacity-70 mt-1">{session.status || 'Active'}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT CHAT AREA */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-800 to-slate-900">

        {activeUser ? (
          <>
            {/* Chat Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-600 border-b border-indigo-400/20 flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">👤</div>
                <div>
                  <div className="font-semibold text-white">{activeUser.name}</div>
                  <p className="text-indigo-100 text-sm">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-center">
                  <div>
                    <p className="text-lg">👋 Start the conversation</p>
                    <p className="text-sm mt-2">Send a message to begin chatting</p>
                  </div>
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
                        className={`max-w-xs px-4 py-3 rounded-2xl ${
                          isMine
                            ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-none shadow-md"
                            : "bg-slate-700 text-gray-100 rounded-bl-none border border-slate-600"
                        }`}
                      >
                        <div className="text-sm">{msg.message}</div>
                        <div className="text-xs mt-1 opacity-70 text-right">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-slate-800 border-t border-white/10 flex gap-3">
              <input
                className="flex-1 border-2 border-slate-600 bg-slate-700/50 text-white rounded-full px-4 py-3 focus:outline-none focus:border-indigo-500 placeholder-gray-400 text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3 rounded-full font-semibold transition transform hover:scale-105 active:scale-95 text-sm"
              >
                📤 Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-center">
            <div>
              <p className="text-4xl mb-3">💬</p>
              <p className="text-lg font-semibold">Select a conversation</p>
              <p className="text-sm mt-2">Click on a conversation on the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
