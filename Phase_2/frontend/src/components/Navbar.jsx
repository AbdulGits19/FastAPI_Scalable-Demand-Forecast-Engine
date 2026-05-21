import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, BarChart3, Bell, Shield, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={15} /> },
    { name: 'Upload', path: '/upload', icon: <UploadCloud size={15} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={15} /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={15} /> },
    { name: 'Admin Panel', path: '/admin', icon: <Shield size={15} /> },
  ];

  return (
    <nav className="bg-[#2D1B69] text-white px-6 py-3.5 shadow-md sticky top-0 z-50 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo Identity */}
        <Link to="/dashboard" className="text-xl font-black tracking-tighter italic hover:opacity-90 transition-opacity">
          Forecastly.
        </Link>

        {/* Dynamic Nav Link Nodes */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                  isActive 
                    ? 'bg-white/15 text-purple-200 border border-white/5 shadow-inner' 
                    : 'text-purple-100 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Operational Sign Out Trigger Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1.5 bg-rose-600/90 hover:bg-rose-600 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-rose-950/20"
        >
          <LogOut size={13} />
          <span>Exit</span>
        </button>

      </div>
    </nav>
  );
};

export default Navbar;