import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MentorDashboard() {
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
    <div className="min-h-screen bg-gray-50 p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Mentor Dashboard
          {pendingCount > 0 && (
            <span className="ml-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
              {pendingCount} New
            </span>
          )}
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Requests */}
      <h2 className="text-xl font-semibold mb-4">
        Incoming Mentorship Requests
      </h2>

      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-white p-6 rounded shadow flex justify-between">
              <div>
                <p className="font-semibold">
                  Student: {req.studentId?.name}
                </p>
                <p className="text-sm text-gray-500">
                  Email: {req.studentId?.email}
                </p>
                <p>Status: {req.status}</p>
              </div>

              {req.status === "Pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdate(req._id, "Accepted")}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => handleUpdate(req._id, "Rejected")}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sessions */}
      <h2 className="text-xl font-semibold mt-10 mb-4">
        Scheduled Sessions
      </h2>

      {sessions.length === 0 ? (
        <p>No sessions scheduled yet.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session._id} className="bg-white p-6 rounded shadow">
              <p>Student: {session.studentId?.name}</p>
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
