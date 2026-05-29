import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Mail, Lock, ArrowRight, ShieldAlert, Sun, Moon, Database } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Local UI theme toggle state controller
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode for immediate testing
  
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    api.get('/datasets/list')
      .then(() => setIsBackendLive(true))
      .catch((err) => {
        if (err.response) setIsBackendLive(true);
        else setIsBackendLive(false);
      });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    
    const result = await login(email.trim(), password);

    if (result.success) {
      try {
        navigate('/dashboard');
      } catch (routeErr) {
        setErrorMessage("Navigation Failure: Ensure path '/dashboard' is mapped in App.jsx");
        setIsSubmitting(false);
      }
    } else {
      setErrorMessage(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`h-screen w-screen flex items-center justify-center p-4 transition-colors duration-300 font-sans select-none ${
      darkMode ? 'bg-[#090414]' : 'bg-[#DFE9F7]'
    }`}>
      
      {/* Main Structural Frame - Dynamic Viewport Locks preventing vertical scrolling templates */}
      <div className={`w-full max-w-[85vw] md:max-w-4xl h-[75vh] min-h-[480px] rounded-[32px] shadow-2xl flex flex-col md:flex-row border transition-all duration-300 overflow-hidden ${
        darkMode ? 'bg-[#160E2E] border-purple-500/30 shadow-purple-950/50' : 'bg-[#EEF4FC] border-white/80'
      }`}>
        
        {/* 🎬 Left Branding & Graphic Vector Space */}
        <div className={`hidden md:flex md:w-7/12 p-10 flex-col justify-between relative overflow-hidden border-r transition-all duration-300 ${
          darkMode ? 'from-[#1F1240] to-[#120826] bg-gradient-to-b border-purple-500/20' : 'from-[#E3EDF9] via-[#DCEAF8] to-[#CCE0F8] bg-gradient-to-b border-white/40'
        }`}>
          
          {/* Decorative architectural background hill curves */}
          <div className={`absolute bottom-0 left-0 right-0 h-1/4 rounded-t-[120px] blur-xs pointer-events-none transition-colors duration-300 ${darkMode ? 'bg-purple-950/20' : 'bg-[#B9D3F4]/50'}`} />
          <div className={`absolute bottom-0 left-[-20%] w-3/4 h-1/5 rounded-t-[100px] pointer-events-none transition-colors duration-300 ${darkMode ? 'bg-purple-900/20' : 'bg-[#AECDF2]/40'}`} />

          {/* Core Brand Header */}
          <div className="flex items-center space-x-2 z-10">
            <Database size={16} className={darkMode ? 'text-purple-400' : 'text-[#3A2D80]'} />
            <h1 className={`text-base font-black tracking-tighter italic transition-colors ${darkMode ? 'text-white' : 'text-[#2D1B69]'}`}>
              Forecastly.
            </h1>
          </div>

          {/* 🌿 Vector Workspace Scene (Grid Device Setup) */}
          <div className="relative w-full h-44 my-auto flex items-center justify-center z-10">
            
            {/* Flat Corporate Analytics Device Frame */}
            <div className={`w-64 h-40 rounded-2xl shadow-xl border p-4 flex flex-col justify-between transition-all relative z-10 ${
              darkMode ? 'bg-[#251A41]/90 border-purple-500/20' : 'bg-white/90 border-[#D5DFED]'
            }`}>
              {/* Window dots header bar */}
              <div className={`flex items-center space-x-1 border-b pb-2 ${darkMode ? 'border-purple-500/10' : 'border-gray-100'}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              
              {/* Clean abstract data line tracks */}
              <div className="space-y-2.5 my-auto py-2">
                <div className={`h-2.5 w-5/6 rounded-sm ${darkMode ? 'bg-purple-500/20' : 'bg-[#E3EDF9]'}`} />
                <div className={`h-2.5 w-2/3 rounded-sm ${darkMode ? 'bg-purple-500/40' : 'bg-[#34A4DC]'}`} />
                <div className={`h-2.5 w-3/4 rounded-sm ${darkMode ? 'bg-purple-600' : 'bg-[#2D1B69]'}`} />
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold tracking-wide">
                <span className={darkMode ? 'text-purple-400/60' : 'text-[#7A869A]'}>ANALYTICS CORE</span>
                <span className={darkMode ? 'text-purple-400' : 'text-[#34A4DC]'}>100% SECURE</span>
              </div>
            </div>

            {/* 🪴 Perfected Minimalist Geometric Plant Setup (High Contrast Core Pots) */}
            <div className="absolute bottom-[-15px] left-6 flex flex-col items-center z-20">
              
              {/* Clean structured line leaves */}
              <div className="flex space-x-[-2px] items-end mb-[-1px] relative">
                <div className="w-3.5 h-9 bg-[#4FA89B] dark:bg-[#34746B] rounded-tl-full rounded-br-full transform -rotate-12 origin-bottom shadow-sm" />
                <div className="w-3 h-11 bg-[#69C4B6] dark:bg-[#43968A] rounded-t-full origin-bottom shadow-sm" />
                <div className="w-3.5 h-8 bg-[#4FA89B] dark:bg-[#2B635B] rounded-tr-full rounded-bl-full transform rotate-12 origin-bottom shadow-sm" />

                {/* 🦋 Pure Vector Minimalist Golden Butterfly */}
                <div className="absolute top-1 right-[-15px] pointer-events-none transform rotate-[15deg]">
                  <svg 
                    width="22" 
                    height="18" 
                    viewBox="0 0 22 18" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-sm"
                  >
                    <path d="M10 9C7 5 3 2 1 4C-1 6 1 10 5 11C8 11.5 9.5 10 10 9Z" fill="#FFC72C" stroke="#E5B220" strokeWidth="0.5" />
                    <path d="M10 9C8 11 5 13 3.5 12.5C2 12 3 9.5 5 9C7 8.5 9 8.8 10 9Z" fill="#FFD15C" opacity="0.9" />
                    <path d="M12 9C15 5 19 2 21 4C23 6 21 10 17 11C14 11.5 12.5 10 12 9Z" fill="#FFC72C" stroke="#E5B220" strokeWidth="0.5" />
                    <path d="M12 9C14 11 17 13 18.5 12.5C20 12 19 9.5 17 9C15 8.5 13 8.8 12 9Z" fill="#FFD15C" opacity="0.9" />
                    <path d="M10.5 3C10.5 2.5 11.5 2.5 11.5 3V15C11.5 15.5 10.5 15.5 10.5 15V3Z" fill="#000000" />
                    <circle cx="11" cy="2.5" r="0.75" fill="#000000" />
                  </svg>
                </div>
              </div>

              {/* 🪴 Fixed Pot Visibility: Conditional rendering color ensures pot stands out distinctively in both variants */}
              <div className={`w-7 h-7 rounded-b-md shadow-md border-t-2 ${
                darkMode ? 'bg-[#5540A5] border-purple-400/40' : 'bg-[#2D1B69] border-[#3A2D80]'
              }`} style={{ clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)' }} />
            </div>

          </div>

          {/* Infrastructure Health Ticker */}
          <div className={`z-10 flex items-center space-x-2 backdrop-blur-md px-3.5 py-1.5 rounded-xl border w-fit shadow-sm ${
            darkMode ? 'bg-white/[0.02] border-white/5' : 'bg-white/50 border-white/60'
          }`}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className={`text-[9px] font-extrabold tracking-wider uppercase ${darkMode ? 'text-purple-300/60' : 'text-[#4A3E8A]'}`}>
              {isBackendLive ? 'GATEWAY ACTIVE' : 'CONNECTING...'}
            </p>
          </div>
        </div>

        {/* 📋 Right Form Presentation Card Side */}
        <div className={`w-full md:w-5/12 flex flex-col items-center justify-center p-8 transition-colors duration-300 relative ${
          darkMode ? 'bg-[#0E0720]' : 'bg-white'
        }`}>
          
          {/* ☀️/🌙 Theme Switch Control */}
          <button 
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`absolute top-6 right-6 p-2.5 rounded-xl border transition-all cursor-pointer ${
              darkMode 
                ? 'bg-purple-950/40 border-purple-500/30 text-amber-400 hover:bg-purple-900/30' 
                : 'bg-[#F4F7FB] border-[#D5DFED] text-[#2D1B69] hover:bg-[#E3EDF9]'
            }`}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <div className="w-full max-w-sm">
            
            {/* Header Typography Elements - Contrast Tweaked */}
            <h3 className={`text-3xl font-extrabold tracking-tight mb-2 transition-colors ${darkMode ? 'text-white' : 'text-[#1A1145]'}`}>
              Welcome To Family
            </h3>
            <p className={`text-xs font-semibold mb-8 leading-relaxed transition-colors ${darkMode ? 'text-purple-300/90' : 'text-[#7A869A]'}`}>
              A community of elite analysts sharing intelligent AI-driven insights and optimization ideas.
            </p>

            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 rounded-xl flex items-start gap-2 text-[11px] font-semibold">
                <ShieldAlert size={14} className="shrink-0 mt-0.5 text-rose-500" />
                <span className="break-all">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Username Input Ingestion */}
              <div className="relative group">
                <input 
                  type="email" 
                  value={email}
                  placeholder="Username/email"
                  className={`w-full border rounded-xl py-3.5 pl-11 pr-4 outline-none text-xs font-bold transition-all ${
                    darkMode 
                      ? 'bg-purple-950/20 border-purple-500/30 text-purple-100 placeholder-purple-400/60 focus:border-purple-400 focus:bg-purple-950/40' 
                      : 'bg-[#F4F7FB] border-[#D5DFED] text-[#1A1145] placeholder-[#90A0B7] focus:border-[#2D1B69] focus:bg-white'
                  }`}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className={`absolute left-4 top-3.5 transition-colors ${darkMode ? 'text-purple-400/60 group-focus-within:text-purple-400' : 'text-[#90A0B7] group-focus-within:text-[#2D1B69]'}`} size={15} />
              </div>

              {/* Password Input Ingestion */}
              <div className="relative group">
                <input 
                  type="password" 
                  value={password}
                  placeholder="Password"
                  className={`w-full border rounded-xl py-3.5 pl-11 pr-4 outline-none text-xs font-bold transition-all ${
                    darkMode 
                      ? 'bg-purple-950/20 border-purple-500/30 text-purple-100 placeholder-purple-400/60 focus:border-purple-400 focus:bg-purple-950/40' 
                      : 'bg-[#F4F7FB] border-[#D5DFED] text-[#1A1145] placeholder-[#90A0B7] focus:border-[#2D1B69] focus:bg-white'
                  }`}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock className={`absolute left-4 top-3.5 transition-colors ${darkMode ? 'text-purple-400/60 group-focus-within:text-purple-400' : 'text-[#90A0B7] group-focus-within:text-[#2D1B69]'}`} size={15} />
              </div>

              {/* Form Utility Controls - Contrast Boosted for easy reading */}
              <div className={`flex items-center justify-between text-[11px] font-bold pt-1 ${darkMode ? 'text-purple-300' : 'text-[#7A869A]'}`}>
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input type="checkbox" className={`rounded ${darkMode ? 'accent-purple-500 border-purple-400/40' : 'accent-[#2D1B69]'}`} />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" className={`transition-colors ${darkMode ? 'hover:text-purple-400 text-purple-400' : 'hover:text-[#2D1B69] text-[#4A3E8A]'}`}>Forgot password?</a>
              </div>

              {/* Form Submission Button */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full mt-4 text-white rounded-xl py-3.5 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all duration-150 cursor-pointer shadow-md disabled:opacity-50 ${
                  darkMode ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-950/50' : 'bg-[#2D1B69] hover:bg-[#20134C]'
                }`}
              >
                <span>{isSubmitting ? 'Verifying...' : 'Login'}</span>
                <ArrowRight size={13} />
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;