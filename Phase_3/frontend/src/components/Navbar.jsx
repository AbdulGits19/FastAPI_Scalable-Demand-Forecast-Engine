import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, BarChart3, Bell, Shield, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth(); 

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
    { name: 'Upload', path: '/upload', icon: <UploadCloud size={16} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={16} /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={16} /> },
  ];

  // 🔒 SECURE ROLE GATEWAY: Grants menu entry access if session role matches Admin or Analyst clearance strings
  const currentSessionRole = user?.role || "Viewer";
  const hasControlTowerClearance = currentSessionRole.toLowerCase().includes('admin') || 
                                   currentSessionRole.toLowerCase().includes('analyst');

  return (
    <nav className="fixed top-0 left-0 h-screen w-64 bg-[#110726] text-white flex flex-col justify-between p-4 shadow-2xl border-r border-purple-500/10 z-50 select-none">
      
      <div>
        {/* Brand Logo */}
        <div className="px-2.5 py-5 border-b border-purple-500/10 mb-6">
          <Link to="/dashboard" className="text-2xl font-black tracking-tighter italic bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity block">
            Forecastly.
          </Link>
        </div>

        {/* User Identity Profile Card */}
        <div className="bg-purple-950/20 rounded-xl p-3 mb-6 border border-purple-500/10 shadow-inner">
          <p className="text-[9px] text-purple-400 uppercase tracking-widest font-black">Active Session Identity</p>
          <p className="text-xs font-black truncate text-purple-100 mt-0.5">{user?.email || "abdul@aol.com"}</p>
          <span className={`inline-block mt-2 text-[9px] font-black px-2 py-0.5 rounded-md border tracking-wider uppercase ${
            currentSessionRole.toLowerCase().includes('admin') 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
              : currentSessionRole.toLowerCase().includes('analyst')
                ? 'bg-sky-500/10 text-sky-400 border-sky-400/20'
                : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
          }`}>
            {currentSessionRole}
          </span>
        </div>

        {/* Navigation Item Nodes */}
        <div className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/30 shadow-inner' 
                    : 'text-purple-200/60 hover:bg-purple-950/30 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* 🔒 Dynamic Administrative Control Tower Access Option */}
          {hasControlTowerClearance && (
            <Link
              to="/admin"
              className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 ${
                location.pathname.startsWith('/admin')
                  ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 border border-amber-500/30 shadow-inner' 
                  : 'text-amber-400/70 hover:bg-purple-950/30 hover:text-amber-400'
              }`}
            >
              <Shield size={16} />
              <span>Control Tower</span>
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Log Out Section */}
      <div className="border-t border-purple-500/10 pt-4 flex justify-center">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-600/90 to-pink-600/90 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-black uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-95"
        >
          <LogOut size={13} />
          <span>Log Out</span>
        </button>
      </div>

    </nav>
  );
};

export default Navbar;