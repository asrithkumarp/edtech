import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");

  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:5000/signup", {
        name,
        email,
        password,
        role,
      });

      alert("Signup successful!");
      navigate("/");
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-pink-400">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 border border-purple-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚀</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Join Us</h1>
          <p className="text-gray-500 text-sm mt-1">Start your mentoring journey</p>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
          <div className="flex items-center border-2 border-gray-200 rounded-lg px-4 py-2.5 focus-within:border-purple-500 transition">
            <span className="text-xl mr-3">👤</span>
            <input
              className="w-full outline-none bg-transparent text-gray-700"
              placeholder="John Doe"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <div className="flex items-center border-2 border-gray-200 rounded-lg px-4 py-2.5 focus-within:border-purple-500 transition">
            <span className="text-xl mr-3">📧</span>
            <input
              className="w-full outline-none bg-transparent text-gray-700"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <div className="flex items-center border-2 border-gray-200 rounded-lg px-4 py-2.5 focus-within:border-purple-500 transition">
            <span className="text-xl mr-3">🔒</span>
            <input
              className="w-full outline-none bg-transparent text-gray-700"
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Role Select */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">I am a</label>
          <div className="flex items-center border-2 border-gray-200 rounded-lg px-4 py-2.5 focus-within:border-purple-500 transition">
            <span className="text-xl mr-3">🎯</span>
            <select
              className="w-full outline-none bg-transparent text-gray-700 cursor-pointer"
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Student">Student</option>
              <option value="Mentor">Mentor</option>
            </select>
          </div>
        </div>

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white p-3 rounded-lg hover:from-purple-700 hover:to-pink-600 font-semibold transition transform hover:scale-105 active:scale-95 shadow-lg"
        >
          🎉 Create Account
        </button>
      </div>
    </div>
  );
}
