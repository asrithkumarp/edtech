import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const navigate = useNavigate();
  const studentId = localStorage.getItem("userId");

  useEffect(() => {
    fetchMentors();
    fetchSessions();
  }, []);

  const fetchMentors = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/mentor-profiles/${studentId}`
      );
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
    <div className="min-h-screen bg-gray-50 p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Mentor List */}
      <h2 className="text-xl font-semibold mb-4">Browse Mentors</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {mentors.map((mentor) => (
          <div key={mentor._id} className="bg-white p-6 rounded shadow">

            <h3 className="font-semibold text-lg">
              {mentor.name}
            </h3>

            <p className="text-green-600 font-semibold mb-2">
              Match Score: {mentor.matchScore}
            </p>

            <p>{mentor.company}</p>
            <p className="text-sm text-gray-600 mb-3">
              Experience: {mentor.experience}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {mentor.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleRequest(mentor.userId)}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Request
              </button>

              <button
                onClick={() => setSelectedMentor(mentor.userId)}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Book Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Section */}
      {selectedMentor && (
        <div className="bg-white p-6 rounded shadow mb-10">
          <h3 className="font-semibold mb-4">Schedule Session</h3>

          <input
            type="date"
            className="border p-2 mr-3"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            type="time"
            className="border p-2 mr-3"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <button
            onClick={handleBookSession}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Confirm
          </button>
        </div>
      )}

      {/* Sessions */}
      <h2 className="text-xl font-semibold mb-4">
        My Scheduled Sessions
      </h2>

      {sessions.length === 0 ? (
        <p>No sessions booked yet.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session._id} className="bg-white p-6 rounded shadow">
              <p>Mentor: {session.mentorId?.name}</p>
              <p>Date: {session.date}</p>
              <p>Time: {session.time}</p>
              <p>Status: {session.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
