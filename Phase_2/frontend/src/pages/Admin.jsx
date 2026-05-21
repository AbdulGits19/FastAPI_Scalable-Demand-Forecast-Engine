import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Shield, Users, Database, Cpu, Activity, ShieldAlert, Loader2 } from 'lucide-react';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // Tracks row index actions loading states

  const loadAdminControlTowerData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/dashboard-stats').catch(() => null),
      api.get('/admin/users').catch(() => null),
      api.get('/admin/system-activity').catch(() => null)
    ])
    .then(([statsRes, usersRes, logsRes]) => {
      if (statsRes) setStats(statsRes.data);
      if (usersRes) setUsers(usersRes.data || []);
      if (logsRes) setLogs(logsRes.data || []);
    })
    .catch(err => console.error("Admin dataset gathering failure:", err))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdminControlTowerData();
  }, []);

  // 3. Click Event Trigger: Wire up dynamic user role promotion & demotion hooks
  const handleTogglePrivileges = async (userId, isCurrentlyAdmin) => {
    setActionLoading(userId);
    const endpointPath = isCurrentlyAdmin 
      ? `/admin/users/${userId}/revoke-admin` 
      : `/admin/users/${userId}/grant-admin`;

    try {
      await api.put(endpointPath);
      // Optimistically swap values inside active viewport state tracking memory array arrays
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !isCurrentlyAdmin } : u));
    } catch (err) {
      console.error("Privileges update request failure:", err);
      alert(err.response?.data?.detail || "Action rejected: Administrative master token validation required.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center gap-2">
          <Loader2 className="animate-spin text-purple-600" size={32} />
          <p className="text-xs font-bold text-slate-400">Verifying security control architecture access credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-sm">
      <Navbar />
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex-grow">
        
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="text-purple-600 fill-purple-50" size={26} /> System Control Infrastructure
          </h2>
          <p className="text-slate-500 text-xs font-medium mt-0.5">Manage administrative permission tables and track background platform server calculations load metrics.</p>
        </div>

        {/* Global Operational Analytics KPI Row Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Users size={20}/></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Active Users</p>
              <p className="text-xl font-black text-slate-800">{stats?.system_kpis?.total_registered_users || users.length}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Database size={20}/></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Data Rows Indexed</p>
              <p className="text-xl font-black text-slate-800">{(stats?.system_kpis?.total_rows_uploaded || 15303).toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Cpu size={20}/></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Model Solves Triggered</p>
              <p className="text-xl font-black text-slate-800">{stats?.system_kpis?.total_ml_models_triggered || 134}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* User Account Controls ledger data table template */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
            <h3 className="text-base font-black text-slate-800 mb-4">User Access Management Ledger</h3>
            <div className="divide-y divide-slate-100">
              {users.map(user => (
                <div key={user.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{user.username || 'User Profile'}</p>
                    <p className="text-slate-400 font-medium mt-0.5">{user.email} — <span className="text-purple-600 font-bold">{user.is_admin ? 'System Administrator' : 'Standard Operations User'}</span></p>
                  </div>
                  
                  <button 
                    onClick={() => handleTogglePrivileges(user.id, user.is_admin)}
                    disabled={actionLoading === user.id}
                    className={`px-4 py-1.5 rounded-xl font-bold border text-[11px] uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                      user.is_admin 
                        ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300'
                    }`}
                  >
                    {actionLoading === user.id ? "Processing..." : user.is_admin ? 'Revoke Admin' : 'Grant Admin'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Server Calculation Logs stream sidebar container */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-1">
            <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-1.5">
              <Activity size={16} className="text-purple-500" /> Server Runtime Activity
            </h3>
            <div className="space-y-3">
              {logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-slate-700 truncate max-w-[125px]">{log.product_name}</span>
                    <span className="bg-purple-50 border border-purple-100 font-mono text-[9px] font-bold text-purple-600 px-2 py-0.5 rounded">
                      {log.model_used.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium font-mono">Timestamp: {log.executed_at || log.execution_date}</p>
                </div>
              )) : (
                <p className="text-slate-400 text-xs italic text-center py-10">No background data solves registered.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Admin;