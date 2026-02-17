import { useState } from "react";
import axios from "axios";

export default function RatingModal({ mentorId, mentorName, sessionId, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/mentor/review", {
        mentorId,
        studentId: localStorage.getItem("userId"),
        rating,
        comment,
        sessionId
      });

      alert("✅ Review submitted successfully!");
      if (onSuccess) onSuccess(res.data.updatedScore);
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to submit review";
      setError(errorMsg);
      console.error("Error submitting review:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">⭐ Rate Your Experience</h2>
          <p className="text-purple-100">How was your session with {mentorName}?</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-3 uppercase font-semibold">Your Rating</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-4xl transition transform hover:scale-110"
                >
                  {star <= (hoverRating || rating) ? "⭐" : "☆"}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-white text-xl font-bold mt-3">
                {rating === 5 && "🤩 Excellent!"}
                {rating === 4 && "😊 Great!"}
                {rating === 3 && "👍 Good"}
                {rating === 2 && "😐 Average"}
                {rating === 1 && "👎 Poor"}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-gray-300 font-semibold mb-2">💬 Comments (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-slate-700 text-white border-2 border-slate-600 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none resize-none"
              placeholder="Share your thoughts about this mentoring session..."
              rows="4"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-3">
              <p className="text-red-400 text-sm">❌ {error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
