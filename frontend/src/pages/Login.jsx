import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
localStorage.setItem("role", res.data.role);
localStorage.setItem("userId", res.data.userId);


      if (res.data.role === "Mentor") {
        navigate("/mentor");
      } else {
        navigate("/student");
      }

    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-400">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-96 border border-indigo-100">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎓</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">AlumniSphere</h1>
          <p className="text-gray-500 text-sm mt-1">Connect, Learn, Grow</p>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</h2>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <div className="flex items-center border-2 border-gray-200 rounded-lg px-4 py-2.5 focus-within:border-indigo-500 transition">
            <span className="text-xl mr-3">📧</span>
            <input
              className="w-full outline-none bg-transparent text-gray-700"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <div className="flex items-center border-2 border-gray-200 rounded-lg px-4 py-2.5 focus-within:border-indigo-500 transition">
            <span className="text-xl mr-3">🔒</span>
            <input
              className="w-full outline-none bg-transparent text-gray-700"
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 font-semibold transition transform hover:scale-105 active:scale-95 shadow-lg"
        >
          ✨ Sign In
        </button>

        {/* Signup Link */}
        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-indigo-600 font-bold hover:text-indigo-700 transition">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
