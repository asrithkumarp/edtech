import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StudentProfile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentSkills: []
  });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        
        console.log("Fetching user with ID:", userId);
        
        if (!userId) {
          setError("No user ID found. Please log in again.");
          setLoading(false);
          return;
        }
        
        const res = await axios.get(`http://localhost:5000/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("User data fetched:", res.data);
        
        setUser(res.data);
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          studentSkills: res.data.studentSkills || []
        });
        setError("");
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        const errorMsg = err.response?.data?.message || err.message || "Failed to fetch profile data";
        setError(errorMsg);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.studentSkills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        studentSkills: [...formData.studentSkills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      studentSkills: formData.studentSkills.filter(s => s !== skill)
    });
  };

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/user/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(formData);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="text-white text-2xl mb-4">⏳ Loading Profile...</div>
          <div className="text-gray-400">Please wait while we fetch your details</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/student")}
            className="mb-6 flex items-center text-cyan-400 hover:text-cyan-300 font-semibold transition"
          >
            ← Back to Dashboard
          </button>
          <div className="bg-red-900/30 border-2 border-red-600 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Profile</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/student")}
          className="mb-6 flex items-center text-cyan-400 hover:text-cyan-300 font-semibold transition"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-2xl p-8 text-white mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">👤 Your Profile</h1>
              <p className="text-indigo-100">Manage your personal information and skills</p>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              {editing ? "Cancel" : "✏️ Edit"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Profile Summary (Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                📋 Current Details
              </h3>

              {/* Name */}
              <div className="mb-5 pb-5 border-b border-slate-600">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Name</p>
                <p className="text-white text-lg font-semibold break-words">{user?.name || "—"}</p>
              </div>

              {/* Email */}
              <div className="mb-5 pb-5 border-b border-slate-600">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Email</p>
                <p className="text-white text-sm break-all">{user?.email || "—"}</p>
              </div>

              {/* Role */}
              <div className="mb-5 pb-5 border-b border-slate-600">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Role</p>
                <div className="flex items-center gap-2">
                  <span className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    🎓 {user?.role}
                  </span>
                </div>
              </div>

              {/* Skills Count */}
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Skills</p>
                <p className="text-white font-semibold">
                  {user?.studentSkills?.length || 0} skill{user?.studentSkills?.length !== 1 ? 's' : ''}
                </p>
                {user?.studentSkills && user.studentSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {user.studentSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          {editing ? (
            // Edit Form
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">📝 Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none transition"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">📧 Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none transition"
                  placeholder="Enter your email"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2">🎯 Skills</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                    className="flex-1 bg-slate-700 text-white border-2 border-slate-600 rounded-lg px-4 py-2 focus:border-indigo-500 focus:outline-none transition"
                    placeholder="Enter a skill and press Enter or Add"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Add
                  </button>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2">
                  {formData.studentSkills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-indigo-700 transition"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-white hover:text-red-200 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105"
                >
                  💾 Save Changes
                </button>
              </div>
            </div>
          ) : (
            // View Profile
            <div className="space-y-6">
              {/* Name */}
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm font-semibold mb-1">📝 Full Name</p>
                <p className="text-white text-lg font-semibold">{user?.name}</p>
              </div>

              {/* Email */}
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm font-semibold mb-1">📧 Email Address</p>
                <p className="text-white text-lg break-all">{user?.email}</p>
              </div>

              {/* Role */}
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm font-semibold mb-1">👥 Role</p>
                <div className="flex items-center gap-2">
                  <span className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    🎓 {user?.role}
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm font-semibold mb-3">🎯 Skills</p>
                {user?.studentSkills && user.studentSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.studentSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No skills added yet</p>
                )}
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
