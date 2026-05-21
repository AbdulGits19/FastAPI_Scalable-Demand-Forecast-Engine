import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Info, Loader2, Download } from 'lucide-react'; // Added Download icon here

const Analytics = () => {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('Paneer Tikka Tacos');
  const [daysToPredict, setDaysToPredict] = useState(10); 

  useEffect(() => {
    setLoading(true);
    api.get(`/forecast/${selectedProduct}?days=${daysToPredict}`)
      .then(res => {
        console.log("Forecast Data Received:", res.data);
        
        // FIX 1: The Safety Net. Checks for whichever key FastAPI is sending
        const rawForecastArray = res.data.next_forecast || res.data.next_7_days_forecast;

        // If it's still undefined, stop here so React doesn't crash the page
        if (!rawForecastArray) {
          console.error("Backend sent undefined. Check your FastAPI return dictionary.");
          setForecastData([]);
          setLoading(false);
          return;
        }

        const formatted = rawForecastArray.map((val, index) => ({
          day: `Day ${index + 1}`,
          predicted_units: parseFloat(val).toFixed(2)
        }));

        setForecastData(formatted); 
        setLoading(false);
      })
      .catch(err => {
        console.error("Forecast fetch failed:", err);
        setLoading(false);
      });
  }, [selectedProduct, daysToPredict]); // FIX 2: Added daysToPredict so the graph re-renders when you change the number

const downloadReport = async () => {
  try {
    const response = await api.get('/reports/export/excel', {
      responseType: 'blob', // Critical for downloading binary files like Excel
    });

    // Create a download link for the actual Excel file from the backend
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedProduct.replace(/\s+/g, '_')}_Report.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error("Excel export failed:", err);
  }
};

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Demand Intelligence</h2>
            <p className="text-gray-500 font-medium italic">Linear Regression Forecast</p>
          </div>
          
          {/* FIX 3 & 4: The Control Panel (Days Input + Dropdown + Download Button) */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            
            {/* Days Input */}
            <div className="bg-white border-2 border-purple-100 rounded-2xl px-4 py-2 flex items-center shadow-sm">
              <label className="text-sm font-bold text-gray-500 mr-2">Days:</label>
              <input 
                type="number" 
                value={daysToPredict} 
                onChange={(e) => setDaysToPredict(e.target.value)}
                className="w-16 outline-none font-bold text-purple-600 bg-transparent"
                min="1"
                max="30"
              />
            </div>

            {/* Product Dropdown */}
            <select 
              className="bg-white border-2 border-purple-100 rounded-2xl px-6 py-3 font-bold text-purple-600 outline-none focus:border-purple-600 shadow-sm cursor-pointer"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="Paneer Tikka Tacos">Paneer Tikka Tacos</option>
              <option value="Masala Chai Latte">Masala Chai Latte</option>
              <option value="Za'atar Grilled Chicken">Za'atar Grilled Chicken</option>
              <option value="Baklava Cheesecake">Baklava Cheesecake</option>
            </select>

            {/* Download Button */}
            <button 
              onClick={downloadReport}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-2xl shadow-sm transition-colors flex items-center justify-center"
              title="Download CSV Report"
            >
              <Download size={20} />
            </button>

          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
          <div className="flex items-center space-x-3 mb-8 text-purple-600">
            <Info size={20} />
            <span className="font-bold text-sm uppercase tracking-widest">Predicted Units to Prepare</span>
          </div>
          
          <div className="flex-grow flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="animate-spin text-purple-600" size={40} />
                <p className="text-gray-400 font-bold">Crunching the numbers...</p>
              </div>
            ) : forecastData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted_units" 
                    stroke="#8b5cf6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorUnits)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 font-medium">No forecast data available for this item.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;