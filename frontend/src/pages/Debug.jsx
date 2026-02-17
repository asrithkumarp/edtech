import { useState, useEffect } from "react";
import axios from "axios";

export default function Debug() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [storageInfo, setStorageInfo] = useState({});

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    setStorageInfo({
      userId: userId || "NOT SET",
      role: role || "NOT SET",
      tokenExists: !!token
    });
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/debug/users");
      setUsers(res.data.users);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const checkCurrentUser = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("No user ID in localStorage");
        setLoading(false);
        return;
      }

      const res = await axios.get(`http://localhost:5000/user/${userId}`);
      setUsers([res.data]);
      setSuccess("✅ User found in database!");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  const createTestStudent = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post("http://localhost:5000/debug/create-test-user");
      setSuccess(`✅ Test Student Created!\n\nEmail: ${res.data.email}\nPassword: ${res.data.password}\nID: ${res.data.userId}`);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("role", "Student");
      setStorageInfo({
        userId: res.data.userId,
        role: "Student",
        tokenExists: false
      });
      fetchAllUsers();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  const createTestMentor = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post("http://localhost:5000/debug/create-test-mentor");
      setSuccess(`✅ Test Mentor Created!\n\nEmail: ${res.data.email}\nPassword: ${res.data.password}\nID: ${res.data.userId}`);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("role", "Mentor");
      setStorageInfo({
        userId: res.data.userId,
        role: "Mentor",
        tokenExists: false
      });
      fetchAllUsers();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  const clearAllData = async () => {
    if (!confirm("⚠️ This will delete ALL users and data! Are you sure?")) {
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.delete("http://localhost:5000/debug/clear-all-users");
      setSuccess("✅ All data cleared successfully!");
      setUsers([]);
      localStorage.clear();
      setStorageInfo({});
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🔧 Debug Information</h1>

        {/* Local Storage Info */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">📦 localStorage</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">User ID:</span>
              <p className="text-white font-mono bg-slate-700 p-2 rounded mt-1 break-all">
                {storageInfo.userId}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Role:</span>
              <p className="text-white font-mono bg-slate-700 p-2 rounded mt-1">{storageInfo.role}</p>
            </div>
            <div>
              <span className="text-gray-400">Token:</span>
              <p className="text-white font-mono bg-slate-700 p-2 rounded mt-1">
                {storageInfo.tokenExists ? "✅ EXISTS" : "❌ NOT EXISTS"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={checkCurrentUser}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            🔍 Check Current User
          </button>
          <button
            onClick={fetchAllUsers}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            📋 List All Users
          </button>
          <button
            onClick={createTestStudent}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            ✨ Create Test Student
          </button>
          <button
            onClick={createTestMentor}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            ✨ Create Test Mentor
          </button>
          <button
            onClick={clearAllData}
            className="col-span-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            🗑️ Clear All Data
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-900/30 border-2 border-green-600 rounded-xl p-6 mb-8">
            <p className="text-green-400 font-semibold whitespace-pre-line">{success}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border-2 border-red-600 rounded-xl p-6 mb-8">
            <p className="text-red-400 font-semibold">❌ Error: {error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-white text-xl">⏳ Loading...</p>
          </div>
        )}

        {/* Users Table */}
        {!loading && users.length > 0 && (
          <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700 border-b border-slate-600">
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">User ID</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-gray-300 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="px-6 py-4 text-white font-mono text-sm break-all">{user._id}</td>
                      <td className="px-6 py-4 text-white">{user.name}</td>
                      <td className="px-6 py-4 text-white">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && users.length === 0 && !error && (
          <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-gray-400">Click a button above to fetch user data</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-900/30 border-2 border-blue-600 rounded-xl p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-3">💡 Quick Start:</h3>
          <ol className="text-gray-300 space-y-2 list-decimal list-inside">
            <li>Click <strong>"Create Test Student"</strong> or <strong>"Create Test Mentor"</strong> - this creates a working test account</li>
            <li>The email, password, and user ID will be shown</li>
            <li>Your localStorage will be automatically filled with the user ID</li>
            <li>Now go to your profile page and the data should load!</li>
            <li>You can also manually verify by clicking "Check Current User" or "List All Users"</li>
            <li>If something goes wrong, use "Clear All Data" to reset and start fresh</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
