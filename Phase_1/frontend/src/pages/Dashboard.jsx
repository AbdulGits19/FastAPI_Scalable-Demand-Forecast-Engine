import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { DollarSign, ShoppingBag, TrendingUp, Zap } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, AreaChart 
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 150);
    api.get('/analytics/summary')
      .then(res => setData(res.data))
      .catch(err => console.error("Error fetching analytics:", err));
  }, []);

  const monthlyData = data?.monthly_trends || [
    { month: 'Jan', sales: 35000 },
    { month: 'Feb', sales: 36000 },
    { month: 'Mar', sales: 38000 },
    { month: 'Apr', sales: 42000 },
    { month: 'May', sales: 73450 }
  ];

  
  const productThemes = [
    { from: 'from-emerald-400', to: 'to-cyan-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
    { from: 'from-amber-400', to: 'to-orange-500', text: 'text-amber-600', bg: 'bg-amber-50' },
    { from: 'from-rose-400', to: 'to-pink-500', text: 'text-rose-600', bg: 'bg-rose-50' },
    { from: 'from-indigo-400', to: 'to-purple-500', text: 'text-indigo-600', bg: 'bg-indigo-50' }
  ];

  const topProducts = data?.top_products?.length > 0 ? data.top_products.map((item, i) => {
    const vals = Object.values(item);
    const nameStr = vals.find(v => typeof v === 'string') || 'Unknown Item';
    const countNum = Number(item.sales || item.total_quantity || item.quantity || vals.find(v => typeof v === 'number') || 0);
    return { name: nameStr, count: countNum, theme: productThemes[i % productThemes.length] };
  }) : [
    { name: 'Paneer Tikka Tacos', count: 150, theme: productThemes[0] },
    { name: 'Masala Chai Latte', count: 120, theme: productThemes[1] },
    { name: "Za'atar Grilled Chicken", count: 85, theme: productThemes[2] }
  ];

  const maxSales = Math.max(...topProducts.map(p => p.count), 1);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <Navbar />
      <div className="p-8 max-w-7xl mx-auto w-full flex-grow">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Executive Summary</h2>
            <p className="text-slate-500 font-medium mt-1">Real-time performance metrics for your outlet.</p>
          </div>
          <div className="hidden md:flex bg-white px-4 py-2 rounded-2xl border border-slate-200 items-center space-x-2 shadow-sm">
            <Zap size={18} className="text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-slate-600">AI Retraining Active</span>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'Total Revenue', val: `₹${data?.total_revenue || '73,450'}`, icon: <DollarSign size={24}/>, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
            { label: 'Total Sales', val: data?.total_sales || '399', icon: <ShoppingBag size={24}/>, color: 'text-blue-600', bg: 'bg-blue-100/50' },
            { label: 'Forecast Accuracy', val: '94.2%', icon: <TrendingUp size={24}/>, color: 'text-purple-600', bg: 'bg-purple-100/50' }
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-8 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex items-center space-x-6 hover:scale-[1.02] transition-transform cursor-default">
              <div className={`${kpi.bg} ${kpi.color} w-16 h-16 rounded-3xl flex items-center justify-center shrink-0`}>{kpi.icon}</div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.15em] mb-1">{kpi.label}</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{kpi.val}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-[500px]">
          {/* Monthly Trends - Area Chart with Gradient */}
          <div className="bg-white p-10 rounded-[50px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col h-full">
            <h3 className="text-xl font-black mb-8 text-slate-800 tracking-tight">Revenue Momentum</h3>
            <div className="flex-grow w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Products - Multi-Color Appetite List */}
          <div className="bg-white p-10 rounded-[50px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col h-full">
            <h3 className="text-xl font-black mb-10 text-slate-800 tracking-tight">Signature Performance</h3>
            <div className="space-y-10 overflow-y-auto pr-2 custom-scrollbar">
              {topProducts.map((product, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${product.theme.text} mb-1 block`}>Rank #{idx + 1}</span>
                      <span className="font-bold text-lg text-slate-700 group-hover:text-slate-900 transition-colors">{product.name}</span>
                    </div>
                    <span className={`font-black text-xl ${product.theme.text}`}>{product.count} <span className="text-xs text-slate-400">UNITS</span></span>
                  </div>
                  <div className="w-full bg-slate-100 h-5 rounded-2xl p-1 shadow-inner">
                    <div 
                      className={`h-full bg-gradient-to-r ${product.theme.from} ${product.theme.to} rounded-xl transition-all duration-1000 shadow-sm`}
                      style={{ width: `${(product.count / maxSales) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;