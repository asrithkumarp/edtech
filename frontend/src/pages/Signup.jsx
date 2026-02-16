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
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-500 to-pink-400">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Signup</h2>

        <input
          className="w-full p-2 mb-3 border rounded"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-2 mb-3 border rounded"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 mb-3 border rounded"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Student">Student</option>
          <option value="Mentor">Mentor</option>
        </select>

        <button
          onClick={handleSignup}
          className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
