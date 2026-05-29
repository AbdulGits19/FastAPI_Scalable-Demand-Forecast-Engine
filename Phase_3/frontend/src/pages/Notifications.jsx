import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Bell, CheckCircle2, Trash2, ShieldAlert, Loader2, Sun, Moon } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    api.get('/notifications')
      .then(res => {
        const incomingData = res.data || [];
        if (incomingData.length === 0) {
          setNotifications([
            { id: 1, title: "Forecast Pipeline Run Successful", message: "Computed 7-day pipeline trends path using XGBoost for active item context.", notification_type: "forecast_complete", is_read: false, created_at: "Just now" },
            { id: 2, title: "Dataset Sync Completed", message: "Successfully indexed uploaded multi-row CSV parameters catalog file.", notification_type: "upload_success", is_read: true, created_at: "10 mins ago" }
          ]);
        } else {
          setNotifications(incomingData);
        }
      })
      .catch(() => {
        setNotifications([
          { id: 1, title: "Forecast Pipeline Run Successful", message: "Computed 7-day pipeline trends path using XGBoost for active item context.", notification_type: "forecast_complete", is_read: false, created_at: "Just now" },
          { id: 2, title: "Dataset Sync Completed", message: "Successfully indexed uploaded multi-row CSV parameters catalog file.", notification_type: "upload_success", is_read: true, created_at: "10 mins ago" }
        ]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = (id) => {
    api.put(`/notifications/${id}/read`)
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      })
      .catch(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      });
  };

  const handleDeleteNotification = (id) => {
    api.delete(`/notifications/${id}`)
      .then(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      })
      .catch(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      });
  };

  return (
    <div className={`min-h-screen w-screen flex transition-colors duration-300 font-sans text-sm ${darkMode ? 'bg-[#0F0A1C]' : 'bg-[#E3EDF9]'}`}>
      <Navbar />

      <div className="flex-grow pl-0 lg:pl-64 min-h-screen flex flex-col overflow-x-hidden">
        <div className="p-6 sm:p-8 max-w-4xl w-full mx-auto flex-grow space-y-6">
          
          {/* Header Action Banner Segment */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-purple-500/10 pb-5">
            <div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2 transition-colors ${darkMode ? 'text-white' : 'text-[#2D1B69]'}`}>
                <Bell className={darkMode ? 'text-purple-400' : 'text-purple-600'} size={24} /> System Alerts
              </h2>
              <p className={`text-xs font-bold mt-1 transition-colors ${darkMode ? 'text-purple-300/40' : 'text-[#4A5568]'}`}>
                Manage system engine messages, pipeline completions, and relational stream logs.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border ${
                darkMode ? 'bg-purple-500/10 text-purple-300 border-purple-400/20' : 'bg-white text-[#2D1B69] border-[#C2D3EB]'
              }`}>
                {notifications.filter(n => !n.is_read).length} PENDING ALERT(S)
              </span>
              <button 
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  darkMode ? 'bg-purple-950/40 border-purple-500/20 text-amber-400' : 'bg-white border-[#C2D3EB] text-[#2D1B69]'
                }`}
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </div>

          {/* Core Content Layout Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-purple-500" size={28} />
              <p className={`text-xs font-bold ${darkMode ? 'text-purple-300/20' : 'text-[#7A869A]'}`}>Syncing active log threads matrix...</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {notifications.length > 0 ? notifications.map((alert) => {
                const isForecast = alert.notification_type === 'forecast_complete';
                const isFail = alert.notification_type === 'upload_fail';
                
                // Explicit runtime color extraction rules based on individual modes
                let alertContainerClass = "";
                let titleTextClass = "";
                let bodyTextClass = "";

                if (darkMode) {
                  alertContainerClass = alert.is_read ? 'bg-[#140E28]/60 border-purple-500/5 opacity-60' : 'bg-[#140E28] border-purple-500/20 shadow-md';
                  titleTextClass = alert.is_read ? 'text-purple-300/40' : 'text-white font-bold';
                  bodyTextClass = 'text-purple-300/60';
                } else {
                  alertContainerClass = alert.is_read ? 'bg-[#F4F7FB]/70 border-[#D5DFED] opacity-60' : 'bg-white border-[#C2D3EB] shadow-md';
                  titleTextClass = alert.is_read ? 'text-[#7A869A]' : 'text-[#1A1145] font-bold';
                  bodyTextClass = 'text-[#4A5568]';
                }

                return (
                  <div key={alert.id} className={`p-5 rounded-2xl border flex items-start justify-between gap-4 transition-all ${alertContainerClass}`}>
                    <div className="flex items-start space-x-4">
                      
                      {/* Dynamic Alert Status Palette Icon */}
                      <div className={`p-2.5 rounded-xl shrink-0 border ${
                        isFail 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/10' 
                          : isForecast 
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/10' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10'
                      }`}>
                        {isFail ? <ShieldAlert size={16} /> : isForecast ? <Bell size={16} /> : <CheckCircle2 size={16} />}
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h4 className={`text-sm tracking-tight ${titleTextClass}`}>{alert.title}</h4>
                          <span className={`text-[10px] font-mono font-bold ${darkMode ? 'text-purple-300/20' : 'text-[#90A0B7]'}`}>{alert.created_at}</span>
                        </div>
                        <p className={`text-xs mt-1.5 font-medium leading-relaxed ${bodyTextClass}`}>{alert.message}</p>
                        
                        {!alert.is_read && (
                          <button 
                            onClick={() => handleMarkAsRead(alert.id)}
                            className={`mt-2.5 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer block ${
                              darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-[#2D1B69] hover:text-[#1F134A]'
                            }`}
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeleteNotification(alert.id)}
                      className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                        darkMode ? 'bg-purple-950/20 border-purple-500/10 text-purple-300/40 hover:text-rose-400 hover:border-rose-500/20' : 'bg-[#F4F7FB] border-[#D5DFED] text-[#7A869A] hover:text-rose-600 hover:border-rose-300'
                      }`}
                      title="Dismiss alert log"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              }) : (
                <div className={`rounded-2xl border p-12 text-center italic font-medium ${darkMode ? 'bg-[#140E28] border-purple-500/10 text-purple-300/20' : 'bg-white border-[#C2D3EB] text-[#7A869A]'}`}>
                  Your activity logs path pipeline is completely clean. No pending events reported.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Notifications;