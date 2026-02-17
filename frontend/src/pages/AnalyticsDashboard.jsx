import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await axios.get("http://localhost:5000/admin/stats");

    const data = Object.entries(res.data).map(
      ([key, value]) => ({
        name: key,
        value
      })
    );

    setStats(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">📊 Platform Analytics</h1>
        <p className="text-gray-400 text-lg">Real-time platform metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Charts Section */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📈</span> Platform Statistics
          </h2>
          <div className="flex justify-center">
            <BarChart width={400} height={300} data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📋</span> Quick Summary
          </h2>
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl hover:border-white/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-semibold capitalize">{stat.name.replace('_', ' ')}</span>
                <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
