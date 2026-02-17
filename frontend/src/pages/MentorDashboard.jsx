import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Chat from "../components/Chat";
import ChatLayout from "../components/ChatLayout";

export default function MentorDashboard() {
  
const [chatUser, setChatUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);

  const navigate = useNavigate();
  const mentorId = localStorage.getItem("userId");

  useEffect(() => {
    fetchRequests();
    fetchSessions();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/mentor-requests/${mentorId}`
      );
      setRequests(res.data);
    } catch (err) {
      console.log("Error fetching requests");
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/sessions/${mentorId}`
      );
      setSessions(res.data);
    } catch (err) {
      console.log("Error fetching sessions");
    }
  };

  const handleUpdate = async (requestId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/update-request/${requestId}`,
        { status }
      );
      fetchRequests();
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const pendingCount = requests.filter(
    (r) => r.status === "Pending"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-10">

      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white">
            👨‍🏫 Mentor Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Manage requests and sessions</p>
        </div>

        <div className="flex items-center gap-4">
          {pendingCount > 0 && (
            <div className="bg-red-600 text-white px-4 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg">
              🔔 {pendingCount} New Request{pendingCount !== 1 ? 's' : ''}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold transition transform hover:scale-105"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Requests */}
      <div className="mb-14">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span>📬</span> Incoming Mentorship Requests
        </h2>

        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white/10 rounded-xl border border-white/20">
            <p className="text-gray-300 text-lg">No requests yet. Wait for students to request mentorship! 🎯</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req._id} className={`bg-white/10 backdrop-blur-sm border p-6 rounded-xl hover:border-white/40 transition ${
                req.status === 'Pending' ? 'border-yellow-400/50 shadow-lg shadow-yellow-500/10' : 'border-white/20'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  {/* Student Info */}
                  <div>
                    <p className="text-gray-400 text-sm font-semibold">Student</p>
                    <p className="text-white font-bold text-lg">👤 {req.studentId?.name}</p>
                    <p className="text-gray-400 text-xs mt-1">📧 {req.studentId?.email}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-gray-400 text-sm font-semibold mb-1">Status</p>
                    <span className={`inline-block px-3 py-2 rounded-lg text-xs font-bold ${
                      req.status === 'Pending' ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-400/50' :
                      req.status === 'Accepted' ? 'bg-green-500/30 text-green-200 border border-green-400/50' :
                      'bg-red-500/30 text-red-200 border border-red-400/50'
                    }`}>
                      {req.status === 'Pending' ? '⏳' : req.status === 'Accepted' ? '✅' : '❌'} {req.status}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  {req.status === 'Pending' && (
                    <div className="flex gap-3 md:col-span-2 md:justify-end mt-4 md:mt-0">
                      <button
                        onClick={() => handleUpdate(req._id, 'Accepted')}
                        className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold transition transform hover:scale-105 text-sm"
                      >
                        ✅ Accept
                      </button>
                      <button
                        onClick={() => handleUpdate(req._id, 'Rejected')}
                        className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold transition transform hover:scale-105 text-sm"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sessions */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span>📅</span> Scheduled Sessions
        </h2>

        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-white/10 rounded-xl border border-white/20">
            <p className="text-gray-300 text-lg">No sessions scheduled yet. Accept requests to create sessions! ✨</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session._id} className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl hover:border-white/40 hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  {/* Session Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                    <div>
                      <p className="text-gray-400 text-sm font-semibold">Student</p>
                      <p className="text-white font-bold">👤 {session.studentId?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-semibold">Date & Time</p>
                      <p className="text-white font-bold">📅 {session.date}</p>
                      <p className="text-white font-bold">⏰ {session.time}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-semibold">Status</p>
                      <span className={`inline-block px-3 py-2 rounded-lg text-xs font-bold ${
                        session.status === 'Confirmed' ? 'bg-green-500/30 text-green-200 border border-green-400/50' :
                        session.status === 'Pending' ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-400/50' :
                        'bg-red-500/30 text-red-200 border border-red-400/50'
                      }`}>
                        {session.status === 'Confirmed' ? '✅' : session.status === 'Pending' ? '⏳' : '❌'} {session.status}
                      </span>
                    </div>
                  </div>

                  {/* Chat Button */}
                  <button
                    onClick={() => setChatUser(session.studentId?._id)}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition transform hover:scale-105"
                  >
                    💬 Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {chatUser && (
        <Chat
          receiverId={chatUser}
          onClose={() => setChatUser(null)}
        />
      )}

    </div>
  );
}
