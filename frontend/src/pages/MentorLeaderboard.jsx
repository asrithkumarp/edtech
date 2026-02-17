import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MentorLeaderboard() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingHover, setRatingHover] = useState({});
  const [ratingSubmitted, setRatingSubmitted] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/mentors/leaderboard");
        setError("");
        setMentors(res.data.leaderboard);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setError(err.response?.data?.error || "Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handleRatingSubmit = async (mentorId, rating) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      // The API for submitting ratings/reviews is `/mentor/review`.
      // Previously the code attempted to call `/mentor/${mentorId}/rate` and
      // update `res.data.newRating`, which doesn't exist; that would cause a
      // runtime error when the request failed or the response shape was wrong.
      // We now post to the correct endpoint and use the returned `updatedScore`
      // object to refresh the mentor's data locally.
      const res = await axios.post(
        "http://localhost:5000/mentor/review",
        { mentorId, studentId: userId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.updatedScore || {};

      // Update the mentor's data in the local state with the fresh scores.
      setMentors(
        mentors.map((m) =>
          m._id === mentorId
            ? {
                ...m,
                rating: updated.rating ?? m.rating,
                totalReviews: updated.totalReviews ?? m.totalReviews,
                performanceScore: updated.performanceScore ?? m.performanceScore,
                sessionsCompleted: updated.sessionsCompleted ?? m.sessionsCompleted
              }
            : m
        )
      );

      // Show confirmation badge briefly.
      setRatingSubmitted({ ...ratingSubmitted, [mentorId]: true });
      setTimeout(() => {
        setRatingSubmitted({ ...ratingSubmitted, [mentorId]: false });
      }, 2000);
    } catch (err) {
      console.error("Failed to submit rating:", err);
      alert("Failed to submit rating. Please try again.");
    }
  };

  const StarRating = ({ mentorId, currentRating }) => {
    const hoverRating = ratingHover[mentorId] || 0;
    const displayRating = hoverRating || currentRating || 0;

    return (
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingSubmit(mentorId, star)}
              onMouseEnter={() => setRatingHover({ ...ratingHover, [mentorId]: star })}
              onMouseLeave={() => setRatingHover({ ...ratingHover, [mentorId]: 0 })}
              className="text-2xl transition-transform hover:scale-110"
            >
              {star <= displayRating ? (
                <span className="text-yellow-400">★</span>
              ) : (
                <span className="text-gray-500">☆</span>
              )}
            </button>
          ))}
        </div>
        {ratingSubmitted[mentorId] && (
          <span className="text-green-400 text-sm font-semibold">✓ Rated!</span>
        )}
      </div>
    );
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return "🥇 Gold";
    if (rank === 2) return "🥈 Silver";
    if (rank === 3) return "🥉 Bronze";
    return `🌟 #${rank}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "from-green-600 to-emerald-600";
    if (score >= 60) return "from-blue-600 to-cyan-600";
    if (score >= 40) return "from-yellow-600 to-amber-600";
    return "from-red-600 to-orange-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/student")}
            className="mb-6 flex items-center text-cyan-400 hover:text-cyan-300 font-semibold transition"
          >
            ← Back
          </button>
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">🏆 Mentor Leaderboard</h1>
                <p className="text-purple-100">Top mentors by performance score</p>
              </div>
              <div className="text-6xl">🏆</div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-white text-xl">⏳ Loading leaderboard...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border-2 border-red-600 rounded-xl p-6 mb-8">
            <p className="text-red-400 font-semibold">❌ Error: {error}</p>
          </div>
        )}

        {/* Leaderboard Table */}
        {!loading && mentors.length > 0 && (
          <div className="space-y-4">
            {mentors.map((mentor, idx) => (
              <div
                key={mentor._id}
                className={`bg-gradient-to-r ${getScoreColor(
                  mentor.performanceScore
                )} p-0.5 rounded-xl`}
              >
                <div className="bg-slate-800 rounded-lg p-6">
                  <div className="flex items-center justify-between gap-6">
                    {/* Rank */}
                    <div className="text-center min-w-[80px]">
                      <div className="text-2xl mb-1">{getRankBadge(idx + 1)}</div>
                      <div className="text-gray-400 text-sm">Rank #{idx + 1}</div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{mentor.name}</h3>
                      <p className="text-gray-400 mb-2">{mentor.company || "Company not specified"}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-300">
                          💼 {mentor.experience || "Experience not specified"}
                        </span>
                        <span className="text-gray-300">🎯 {mentor.skills?.length || 0} skills</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 min-w-[200px]">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs uppercase mb-1">Rating</p>
                        <p className="text-lg font-bold text-yellow-400">
                          {mentor.rating || "0"}/5
                        </p>
                        <p className="text-gray-500 text-xs">({mentor.totalReviews || 0} reviews)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs uppercase mb-1">Sessions</p>
                        <p className="text-lg font-bold text-cyan-400">{mentor.sessionsCompleted || 0}</p>
                      </div>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex flex-col items-center gap-2 min-w-[150px]">
                      <p className="text-gray-400 text-xs uppercase">Rate This Mentor</p>
                      <StarRating mentorId={mentor._id} currentRating={mentor.rating} />
                    </div>

                    {/* Performance Score */}
                    <div className="text-center min-w-[120px]">
                      <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-2">
                        {mentor.performanceScore || 0}
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all"
                          style={{ width: `${(mentor.performanceScore || 0)}%` }}
                        ></div>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">Score</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && mentors.length === 0 && (
          <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-gray-400 text-lg">No mentors found</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-900/30 border-2 border-blue-600 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-400 mb-3">📊 How Scores Are Calculated</h3>
          <ul className="text-gray-300 space-y-2">
            <li>✅ <strong>Profile Completeness</strong> - Company, experience, bio, skills (20%)</li>
            <li>✅ <strong>Sessions Completed</strong> - Number of mentoring sessions (30%)</li>
            <li>✅ <strong>Skills Expertise</strong> - Number of skills listed (15%)</li>
            <li>✅ <strong>Request Acceptance Rate</strong> - How often they accept requests (20%)</li>
            <li>✅ <strong>Student Reviews</strong> - Average rating from students (15%)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
