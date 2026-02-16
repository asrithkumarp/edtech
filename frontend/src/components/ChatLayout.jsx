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
    <div className="flex h-screen bg-gray-100">

      {/* LEFT SIDEBAR */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <div className="p-4 font-bold text-lg border-b">
          Conversations
        </div>

        {sessions.map((session) => {
          const user =
            session.studentId?._id === currentUserId
              ? session.mentorId
              : session.studentId;

          return (
            <div
              key={session._id}
              onClick={() => setActiveUser(user)}
              className={`p-4 cursor-pointer hover:bg-gray-100 ${
                activeUser?._id === user?._id
                  ? "bg-gray-200"
                  : ""
              }`}
            >
              <div className="font-semibold">
                {user?.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT CHAT AREA */}
      <div className="flex-1 flex flex-col">

        {activeUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b font-semibold">
              {activeUser.name}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((msg) => {
                const isMine =
                  msg.senderId === currentUserId;

                return (
                  <div
                    key={msg._id || msg.timestamp}
                    className={`flex mb-2 ${
                      isMine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg max-w-xs ${
                        isMine
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-300 text-black"
                      }`}
                    >
                      <div>{msg.message}</div>
                      <div className="text-xs mt-1 opacity-70 text-right">
                        {new Date(
                          msg.timestamp
                        ).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t flex gap-2">
              <input
                className="border p-2 flex-1 rounded"
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                placeholder="Type message..."
              />
              <button
                onClick={sendMessage}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
