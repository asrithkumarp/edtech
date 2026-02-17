import { useEffect, useState } from "react";
import axios from "axios";


export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    const res = await axios.get("http://localhost:5000/admin/stats");
    setStats(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/admin/users");
    setUsers(res.data);
  };

  const deleteUser = async (id) => {
    await axios.delete(`http://localhost:5000/admin/user/${id}`);
    fetchUsers();
    fetchStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-10">

      <h1 className="text-4xl font-bold mb-10 text-white">⚙️ Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {Object.entries(stats).map(([key, value], idx) => {
          const colors = [
            'from-blue-600 to-cyan-500',
            'from-purple-600 to-pink-500',
            'from-emerald-600 to-teal-500',
            'from-yellow-600 to-orange-500'
          ];
          const icons = ['👥', '🎓', '👨‍🏫', '📅'];
          const colorClass = colors[idx % colors.length];
          const icon = icons[idx % icons.length];

          return (
            <div key={key} className={`bg-gradient-to-br ${colorClass} p-6 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-semibold capitalize">{key.replace('_', ' ')}</p>
                  <p className="text-4xl font-bold text-white mt-2">{value}</p>
                </div>
                <div className="text-5xl">{icon}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <span>👥</span> All Users
      </h2>

      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 text-lg">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/20">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">Role</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">Email</th>
                  <th className="px-6 py-4 text-center text-gray-300 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-white font-semibold">👤 {user.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === 'Admin' ? 'bg-red-500/30 text-red-200 border border-red-400/50' :
                        user.role === 'Mentor' ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/50' :
                        'bg-blue-500/30 text-blue-200 border border-blue-400/50'
                      }`}>
                        {user.role === 'Admin' ? '🔐' : user.role === 'Mentor' ? '👨‍🏫' : '👨‍🎓'} {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">📧 {user.email}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
