import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Mail, Lock, ArrowRight } from 'lucide-react';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBackendLive, setIsBackendLive] = useState(false); // New state for the badge
  const navigate = useNavigate();

  // New Effect: Check if your FastAPI server is running
  useEffect(() => {
    api.get('/') 
      .then(() => setIsBackendLive(true))
      .catch(() => setIsBackendLive(false));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // FastAPI OAuth2 expects Form Data
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-6">
      {/* Container: Dark Purple Rounded Box */}
      <div className="bg-[#2D1B69] w-full max-w-6xl rounded-[50px] shadow-2xl flex flex-col md:flex-row overflow-visible min-h-[650px] relative">
        
        {/* Left Side: Branding & Info */}
        <div className="md:w-3/5 p-16 flex flex-col justify-between text-white">
          <h1 className="text-2xl font-black tracking-tighter italic">Forecastly.</h1>
          
          <div>
            <h2 className="text-5xl font-bold leading-tight mb-4">Precision <br/> in Every Byte.</h2>
            <p className="text-purple-200 text-lg max-w-md">Redefining AI-driven demand forecasting.</p>
          </div>

          <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-lg p-4 rounded-3xl border border-white/10 w-fit">
            <div className="w-12 h-12 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-2xl rotate-12"></div>
            <div>
              <p className="font-bold text-sm">System Active</p>
              <p className="text-xs text-purple-300">Ready for data ingestion</p>
            </div>
          </div>
        </div>

        {/* Right Side: The Floating Login Card */}
        <div className="md:w-2/5 relative flex items-center justify-center pr-0 md:pr-12">
          <div className="bg-white w-full rounded-[40px] p-12 shadow-2xl md:translate-x-[-60px] transform transition-all">
            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back...</h3>
            <p className="text-gray-400 mb-10">Please enter your credentials</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="user@gmail.com"
                  className="w-full bg-gray-100 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-purple-600"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="absolute right-5 top-4 text-gray-300" size={22} />
              </div>

              <div className="relative">
                <input 
                  type="password" 
                  placeholder="Password"
                  className="w-full bg-gray-100 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-purple-600"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock className="absolute right-5 top-4 text-gray-300" size={22} />
              </div>

              <div className="flex justify-between text-[11px] font-bold text-purple-600 px-1">
                <span className="cursor-pointer">Terms & Conditions</span>
                <span className="text-gray-400 cursor-pointer">Forgot Password?</span>
              </div>

              <button className="w-full bg-purple-600 text-white rounded-2xl py-4 font-bold flex items-center justify-center space-x-3 hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all">
                <span>login...</span>
                <ArrowRight size={20} />
              </button>
            </form>

            <div className="mt-10 text-center text-sm text-gray-400">
              New here? <span className="text-purple-600 font-bold cursor-pointer">Create Account</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


