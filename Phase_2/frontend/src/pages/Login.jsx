import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

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
    
    try {
      const formData = new FormData();
      formData.append('username', email.trim());
      formData.append('password', password);

      console.log("Attempting authentication handshake request...");
      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log("Response received safely:", res.data);

      if (res.data && res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        console.value = "Token stored safely. Forcing route transition down to /dashboard...";
        
        // Safety wrap to prevent route state failures from killing the app instance
        try {
          navigate('/dashboard');
        } catch (routeErr) {
          console.error("Router navigation fail:", routeErr);
          setErrorMessage(`Navigation Error: Check if path '/dashboard' is correctly configured in App.jsx`);
        }
      } else {
        setErrorMessage("Backend authenticated successfully but didn't return an 'access_token' string key.");
      }
    } catch (err) {
      console.error("Login call failed:", err);
      if (err.response) {
        setErrorMessage(`Server rejected request with status code ${err.response.status}: ${JSON.stringify(err.response.data.detail || err.response.data)}`);
      } else {
        setErrorMessage(`Network error connection failed: Check if your Uvicorn port 8000 is running.`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-6">
      <div className="bg-[#2D1B69] w-full max-w-6xl rounded-[50px] shadow-2xl flex flex-col md:flex-row min-h-[650px] relative">
        
        {/* Left Branding Side */}
        <div className="md:w-3/5 p-16 flex flex-col justify-between text-white">
          <h1 className="text-2xl font-black tracking-tighter italic">Forecastly.</h1>
          <div>
            <h2 className="text-5xl font-bold leading-tight mb-4">Precision <br/> in Every Byte.</h2>
            <p className="text-purple-200 text-lg max-w-md">Redefining AI-driven demand forecasting.</p>
          </div>
          <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-lg p-4 rounded-3xl border border-white/10 w-fit">
            <div className={`w-3 h-3 rounded-full ${isBackendLive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <div>
              <p className="font-bold text-sm">Server Status</p>
              <p className="text-xs text-purple-300">{isBackendLive ? 'API Engine Listening' : 'Connecting to port 8000...'}</p>
            </div>
          </div>
        </div>

        {/* Right Form Card Side */}
        <div className="md:w-2/5 relative flex items-center justify-center pr-0 md:pr-12">
          <div className="bg-white w-full rounded-[40px] p-12 shadow-2xl md:translate-x-[-60px] transform transition-all duration-300">
            <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back...</h3>
            <p className="text-gray-400 mb-6">Please enter your credentials</p>

            {errorMessage && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-start gap-2 text-xs font-semibold">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span className="break-all">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  placeholder="user@gmail.com"
                  className="w-full bg-gray-100 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-purple-600 text-sm font-medium text-gray-700"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="absolute right-5 top-4 text-gray-300" size={20} />
              </div>

              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  placeholder="Password"
                  className="w-full bg-gray-100 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-purple-600 text-sm font-medium text-gray-700"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock className="absolute right-5 top-4 text-gray-300" size={20} />
              </div>

              <button type="submit" className="w-full bg-purple-600 text-white rounded-2xl py-4 font-bold flex items-center justify-center space-x-3 hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all cursor-pointer">
                <span>Authorize Session...</span>
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;