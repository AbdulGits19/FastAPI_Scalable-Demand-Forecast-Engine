import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, LogOut, PieChart, User } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload', path: '/upload', icon: UploadCloud },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-[#2D1B69] text-white px-8 py-4 flex items-center justify-between shadow-xl sticky top-0 z-50">
      <div className="flex items-center space-x-12">
        <h1 className="text-xl font-black italic tracking-tighter">Forecastly.</h1>
        
        <div className="hidden md:flex items-center space-x-6">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'bg-white/20 text-white' 
                  : 'text-purple-300 hover:bg-white/10'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-semibold">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
          <User size={16} className="text-purple-300" />
          <span className="text-xs font-bold">Shaik Abdul Basith</span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-red-500/20 text-red-300 rounded-xl transition-all"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;