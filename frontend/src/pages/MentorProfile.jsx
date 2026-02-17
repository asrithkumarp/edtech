import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MentorProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    experience: "",
    skills: [],
    bio: ""
  });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        console.log("Fetching mentor profile with ID:", userId);

        if (!userId) {
          setError("No user ID found. Please log in again.");
          setLoading(false);
          return;
        }

        // Fetch user details
        const userRes = await axios.get(`http://localhost:5000/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("User data fetched:", userRes.data);
        setUser(userRes.data);

        // Fetch mentor profile
        const profileRes = await axios.get(`http://localhost:5000/mentor-profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Mentor profile fetched:", profileRes.data);
        setProfile(profileRes.data);
        setFormData({
          name: profileRes.data.name || "",
          company: profileRes.data.company || "",
          experience: profileRes.data.experience || "",
          skills: profileRes.data.skills || [],
          bio: profileRes.data.bio || ""
        });

        setError("");
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        const errorMsg = err.response?.data?.message || err.message || "Failed to fetch profile data";
        setError(errorMsg);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      const res = await axios.put(`http://localhost:5000/mentor-profile/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.profile);
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
            onClick={() => navigate("/mentor")}
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
          onClick={() => navigate("/mentor")}
          className="mb-6 flex items-center text-cyan-400 hover:text-cyan-300 font-semibold transition"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-2xl p-8 text-white mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">👨‍🏫 Mentor Profile</h1>
              <p className="text-indigo-100">Showcase your expertise and professional background</p>
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

              {/* Performance Score */}
              <div className="mb-5 pb-5 border-b border-slate-600 bg-gradient-to-r from-orange-600/20 to-amber-600/20 rounded-lg p-3">
                <p className="text-gray-300 text-xs font-semibold uppercase mb-2">⭐ Performance Score</p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-amber-400">{profile?.performanceScore || 0}</div>
                  <div className="flex-1">
                    <div className="bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all"
                        style={{ width: `${(profile?.performanceScore || 0)}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">of 100</p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-5 pb-5 border-b border-slate-600">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-2">⭐ Average Rating</p>
                <p className="text-white text-lg font-semibold">
                  {profile?.rating ? `${profile.rating}/5` : "No ratings yet"}
                </p>
                <p className="text-gray-400 text-xs">({profile?.totalReviews || 0} reviews)</p>
              </div>

              {/* Sessions & Acceptance */}
              <div className="mb-5 pb-5 border-b border-slate-600 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Sessions</p>
                  <p className="text-white text-lg font-semibold">{profile?.sessionsCompleted || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Accepted</p>
                  <p className="text-white text-lg font-semibold">{profile?.requestsAccepted || 0}</p>
                </div>
              </div>

              {/* Name */}
              <div className="mb-5 pb-5 border-b border-slate-600">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Name</p>
                <p className="text-white text-lg font-semibold break-words">{profile?.name || user?.name || "—"}</p>
              </div>

              {/* Email */}
              <div className="mb-5 pb-5 border-b border-slate-600">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Email</p>
                <p className="text-white text-sm break-all">{user?.email || "—"}</p>
              </div>

              {/* Company */}
              <div className="mb-5 pb-5 border-b border-slate-600">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Company</p>
                <p className="text-white font-semibold">{profile?.company || "—"}</p>
              </div>

              {/* Experience */}
              <div className="mb-5 pb-5 border-b border-slate-600">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Experience</p>
                <p className="text-white font-semibold">{profile?.experience || "—"}</p>
              </div>

              {/* Skills Count */}
              <div className="mb-5 pb-5 border-b border-slate-600">
                <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Skills</p>
                <p className="text-white font-semibold">
                  {profile?.skills?.length || 0} skill{profile?.skills?.length !== 1 ? 's' : ''}
                </p>
                {profile?.skills && profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.skills.map((skill, idx) => (
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

              {/* Role */}
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Role</p>
                <div className="flex items-center gap-2">
                  <span className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    👨‍🏫 {user?.role}
                  </span>
                </div>
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
                      placeholder="Your name"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">🏢 Current Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none transition"
                      placeholder="e.g., Google, Microsoft"
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">⏰ Years of Experience</label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none transition"
                      placeholder="e.g., 5+ years"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">📄 Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg px-4 py-3 focus:border-indigo-500 focus:outline-none transition resize-none"
                      placeholder="Tell us about yourself..."
                      rows="4"
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
                      {formData.skills.map((skill, idx) => (
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
                  {/* Welcome Message for New Mentors */}
                  {!profile?.company && !profile?.experience && !profile?.bio && (
                    <div className="bg-indigo-900/30 border-2 border-indigo-600 rounded-lg p-6 mb-6">
                      <h3 className="text-xl font-bold text-indigo-400 mb-2">👋 Welcome to Your Mentor Profile!</h3>
                      <p className="text-gray-300">Let's get you started! Click the <strong>✏️ Edit</strong> button to fill in your details.</p>
                      <ul className="list-disc list-inside text-gray-300 mt-3 space-y-1">
                        <li>Add your company and experience</li>
                        <li>Write a bio about yourself</li>
                        <li>Add your skills to attract students</li>
                      </ul>
                    </div>
                  )}

                  {/* Name */}
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm font-semibold mb-1">📝 Full Name</p>
                    <p className="text-white text-lg font-semibold break-words">{profile?.name || user?.name || "N/A"}</p>
                  </div>

                  {/* Email */}
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm font-semibold mb-1">📧 Email Address</p>
                    <p className="text-white text-lg break-all">{user?.email || "—"}</p>
                  </div>

                  {/* Company */}
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm font-semibold mb-1">🏢 Current Company</p>
                    <p className="text-white text-lg">{profile?.company || "Not specified"}</p>
                  </div>

                  {/* Experience */}
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm font-semibold mb-1">⏰ Years of Experience</p>
                    <p className="text-white text-lg">{profile?.experience || "Not specified"}</p>
                  </div>

                  {/* Bio */}
                  {profile?.bio && (
                    <div className="bg-slate-700 rounded-lg p-4">
                      <p className="text-gray-400 text-sm font-semibold mb-1">📄 Bio</p>
                      <p className="text-gray-300">{profile.bio}</p>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm font-semibold mb-3">🎯 Skills</p>
                    {profile?.skills && profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, idx) => (
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

                  {/* Role */}
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm font-semibold mb-1">👥 Role</p>
                    <div className="flex items-center gap-2">
                      <span className="bg-cyan-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        👨‍🏫 {user?.role}
                      </span>
                    </div>
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
