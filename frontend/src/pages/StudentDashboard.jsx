import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Chat from "../components/Chat";


export default function StudentDashboard() {
  const [chatUser, setChatUser] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const studentId = localStorage.getItem("userId");

  useEffect(() => {
    fetchMentors();
    fetchSessions();
  }, []);

  const fetchMentors = async (term = "") => {
    try {
      const url = new URL(`http://localhost:5000/mentor-profiles/${studentId}`);
      if (term) url.searchParams.append("q", term);
      const res = await axios.get(url.toString());
      setMentors(res.data);
    } catch (err) {
      console.log("Error fetching mentors");
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/sessions/${studentId}`
      );
      setSessions(res.data);
    } catch (err) {
      console.log("Error fetching sessions");
    }
  };

  const handleRequest = async (mentorId) => {
    try {
      await axios.post("http://localhost:5000/request-mentorship", {
        studentId,
        mentorId
      });
      alert("Mentorship request sent!");
    } catch (err) {
      alert("Failed to send request");
    }
  };

  const handleBookSession = async () => {
    if (!selectedMentor || !date || !time) {
      alert("Please select mentor, date and time");
      return;
    }

    try {
      await axios.post("http://localhost:5000/book-session", {
        studentId,
        mentorId: selectedMentor,
        date,
        time
      });

      alert("Session booked successfully!");
      setSelectedMentor(null);
      setDate("");
      setTime("");
      fetchSessions();
    } catch (err) {
      alert("Booking failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-10">

      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white">👨‍🎓 Student Dashboard</h1>
          <p className="text-gray-400 mt-2">Find and connect with mentors</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/mentors/leaderboard")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold transition transform hover:scale-105"
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={() => navigate("/student/profile")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition transform hover:scale-105"
          >
            👤 Profile
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold transition transform hover:scale-105"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Mentor List */}
      <div className="mb-14">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🌟</span> Browse Mentors
          </h2>
          <input
            type="text"
            placeholder="Search by name or skill"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchMentors(searchTerm);
            }}
            className="ml-auto px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none"
          />
          <button
            onClick={() => fetchMentors(searchTerm)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            🔍
          </button>
        </div>

        {mentors.length === 0 ? (
          <div className="text-center py-12 bg-white/10 rounded-xl border border-white/20">
            <p className="text-gray-300 text-lg">No mentors available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor._id} className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:border-white/40 transition duration-300 transform hover:scale-105">
                {/* Mentor Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-white">
                      👤 {mentor.name}
                    </h3>
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      ⭐ {mentor.matchScore}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm font-semibold">{mentor.company}</p>
                  <p className="text-gray-400 text-xs mt-1">📅 {mentor.experience} experience</p>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {mentor.skills?.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-400/50"
                    >
                      {skill}
                    </span>
                  ))}
                  {mentor.skills?.length > 3 && (
                    <span className="bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-xs font-semibold">
                      +{mentor.skills.length - 3} more
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequest(mentor.userId)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-semibold transition transform hover:scale-105 text-sm"
                  >
                    ✉️ Request
                  </button>
                  <button
                    onClick={() => setSelectedMentor(mentor.userId)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold transition transform hover:scale-105 text-sm"
                  >
                    📅 Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Section */}
      {selectedMentor && (
        <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 p-8 rounded-2xl mb-12 backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-6 text-white">📆 Schedule Your Session</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Date</label>
              <input
                type="date"
                className="w-full border-2 border-emerald-500/50 p-3 rounded-lg bg-white/10 text-white focus:outline-none focus:border-emerald-400"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Time</label>
              <input
                type="time"
                className="w-full border-2 border-emerald-500/50 p-3 rounded-lg bg-white/10 text-white focus:outline-none focus:border-emerald-400"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleBookSession}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-bold transition transform hover:scale-105 text-base"
              >
                ✅ Confirm Booking
              </button>
            </div>
          </div>

          <button
            onClick={() => setSelectedMentor(null)}
            className="text-gray-300 hover:text-white text-sm font-semibold"
          >
            ✕ Cancel
          </button>
        </div>
      )}

      {/* Sessions */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span>📅</span> My Scheduled Sessions
        </h2>

        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-white/10 rounded-xl border border-white/20">
            <p className="text-gray-300 text-lg">No sessions booked yet. Start by booking a session above! 🚀</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session._id} className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl hover:border-white/40 transition">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm font-semibold">Mentor</p>
                    <p className="text-white font-bold">👨‍💼 {session.mentorId?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-semibold">Date</p>
                    <p className="text-white font-bold">📅 {session.date}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-semibold">Time</p>
                    <p className="text-white font-bold">⏰ {session.time}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-semibold">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      session.status === 'Confirmed' ? 'bg-green-500/30 text-green-200 border border-green-400/50' :
                      session.status === 'Pending' ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-400/50' :
                      'bg-red-500/30 text-red-200 border border-red-400/50'
                    }`}>
                      {session.status === 'Confirmed' ? '✅' : session.status === 'Pending' ? '⏳' : '❌'} {session.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setChatUser(session.mentorId?._id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                >
                  💬 Open Chat
                </button>
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
