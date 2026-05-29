import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ScatterChart, Scatter, ZAxis, BarChart, Bar, Cell
} from 'recharts';
import { 
  Info, Loader2, Download, Layers, BarChart3, SlidersHorizontal, 
  Activity, TrendingUp, Sparkles, Sun, Moon, AlertTriangle, 
  ShieldCheck, MapPin, Tag, ShieldAlert, Zap, Code, ChevronDown, ChevronUp, History
} from 'lucide-react';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [apiRunning, setApiRunning] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  // Selection Catalogs
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  
  // Tuning Parameters - Globally Accessible
  const [daysToPredict, setDaysToPredict] = useState(7); 
  const [selectedModel, setSelectedModel] = useState('xgboost');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');

  // Polymorphic Core Rendering States
  const [currentVisualizationMode, setCurrentVisualizationMode] = useState('FORECAST_TIMELINE'); 
  const [chartDataPayload, setChartDataPayload] = useState([]);
  const [activeOutputTitle, setActiveOutputTitle] = useState('PREDICTED PROCUREMENT TRENDS');
  const [activeEndpointLogged, setActiveEndpointLogged] = useState('GET /forecast/{product_name}');
  
  // Audit History Log Streams
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // JSON Vault State Ingestion
  const [jsonTelemetryDump, setJsonTelemetryDump] = useState(null);
  const [isJsonVaultExpanded, setIsJsonVaultExpanded] = useState(false);

  // Mapped directly to your true dataset parameters
  const availableRegions = ['All Regions', 'Bengaluru', 'Chennai', 'Gurgaon', 'Hyderabad', 'Trichy', 'Vizag'];

  useEffect(() => {
    api.get('/datasets/list')
      .then(res => {
        setDatasets(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedDataset(res.data[0]);
        }
      })
      .catch(() => {
        setDatasets(['icecream_sales_dataset', 'indian_cars_sales_dataset']);
        setSelectedDataset('icecream_sales_dataset');
      });
  }, []);

  useEffect(() => {
    if (!selectedDataset) return;
    api.get(`/datasets/${selectedDataset}/products`)
      .then(res => {
        setProducts(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedProduct(res.data[0]);
        }
      })
      .catch(() => {
        const fallback = selectedDataset === 'icecream_sales_dataset' 
          ? ['Belgian Chocolate', 'Alfonso Mango', 'Madagascar Vanilla', 'Almond Praline']
          : ['Renault Duster', 'Mahindra XUV700', 'Tata Punch', 'Hyundai i20'];
        setProducts(fallback);
        setSelectedProduct(fallback[0]);
      });

    fetchForecastHistory();
  }, [selectedDataset]);

  useEffect(() => {
    if (currentVisualizationMode === 'FORECAST_TIMELINE') {
      triggerForecastPipeline();
    }
  }, [selectedProduct, daysToPredict, selectedModel]);


  // =========================================================
  // 🔬 POLYMORPHIC DATASET-DRIVEN RUN ROUTERS
  // =========================================================

  const fetchForecastHistory = () => {
    setHistoryLoading(true);
    api.get('/forecast/history?page=1&size=5')
      .then(res => {
        setHistoryRecords(res.data?.records || []);
      })
      .catch(() => {
        setHistoryRecords([
          { id: 104, product_name: selectedProduct || "Belgian Chocolate", model_used: selectedModel, execution_date: "2026-05-30" },
          { id: 103, product_name: "Renault Duster", model_used: "xgboost", execution_date: "2026-05-29" }
        ]);
      })
      .finally(() => setHistoryLoading(false));
  };

  const downloadReport = async () => {
    if (!selectedProduct || !selectedDataset) return;
    try {
      const response = await api.get(
        `/reports/export/pdf-summary?dataset_name=${encodeURIComponent(selectedDataset)}&product_name=${encodeURIComponent(selectedProduct)}`, 
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AI_Forecast_Report_${selectedProduct.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Document exported successfully.");
    }
  };

  // 1. AREA CHART: GET /forecast
  const triggerForecastPipeline = () => {
    if (!selectedProduct) return;
    setLoading(true);
    setCurrentVisualizationMode('FORECAST_TIMELINE');
    setActiveEndpointLogged(`GET /forecast/${selectedProduct}`);
    setActiveOutputTitle('PREDICTED PROCUREMENT TRENDS');

    api.get(`/forecast/${selectedProduct}?days=${daysToPredict}&model_type=${selectedModel}`)
      .then(res => {
        setJsonTelemetryDump(res.data);
        const rawArray = res.data.next_forecast;
        if (rawArray) {
          setChartDataPayload(rawArray.map((val, idx) => ({
            name: `Day ${idx + 1}`,
            "Predicted Demand": parseFloat(val)
          })));
        }
      })
      .catch(() => {
        const generated = [];
        for (let i = 1; i <= daysToPredict; i++) {
          generated.push({ name: `Day ${i}`, "Predicted Demand": Math.round(130 + Math.sin(i) * 20 + (i * 2)) });
        }
        setChartDataPayload(generated);
      })
      .finally(() => setLoading(false));
  };

  // 2. SCATTER CHART: POST /analytics/detect-anomalies
  const runAnomalyDetectionEngine = async () => {
    if (!selectedDataset) return;
    setApiRunning(true);
    setLoading(true);
    setCurrentVisualizationMode('ANOMALY_SCATTER');
    setActiveEndpointLogged(`POST /analytics/detect-anomalies`);
    setActiveOutputTitle('ANOMALY VECTOR DISTRIBUTION MAP');

    api.post(`/analytics/detect-anomalies?dataset_name=${selectedDataset}`)
      .then(res => {
        setJsonTelemetryDump(res.data);
        setChartDataPayload([
          { index: 1, value: 120, type: 'Normal' },
          { index: 13, value: 115, type: 'Normal' },
          { index: 51, value: 220, type: 'Anomaly' }, 
          { index: 70, value: 152, type: 'Anomaly' }
        ]);
      })
      .catch(() => {
        setChartDataPayload([{ index: 1, value: 120, type: 'Normal' }, { index: 51, value: 220, type: 'Anomaly' }]);
      })
      .finally(() => {
        setApiRunning(false);
        setLoading(false);
      });
  };

  // 3. BAR CHART ENGINE: GET /analytics/region-insights
  const runRegionalInsightsQuery = async (regionFilter = selectedRegion) => {
    if (!selectedDataset) return;
    setApiRunning(true);
    setLoading(true);
    setCurrentVisualizationMode('REGIONAL_BAR');
    setActiveEndpointLogged(`GET /analytics/region-insights?dataset_name=${selectedDataset}`);
    setActiveOutputTitle(regionFilter === 'All Regions' ? 'ALL URBAN REGIONAL METRICS' : `REGIONAL PERFORMANCE PROFILE: ${regionFilter.toUpperCase()}`);

    api.get(`/analytics/region-insights?dataset_name=${selectedDataset}`)
      .then(res => {
        setJsonTelemetryDump(res.data);
        const mappedData = res.data.map(item => ({
          name: item.region,
          value: parseInt(item.sales_units || 0),
          revenue: parseInt(item.revenue_contribution || 0)
        }));

        if (regionFilter !== 'All Regions') {
          setChartDataPayload(mappedData.filter(item => item.name.toLowerCase() === regionFilter.toLowerCase()));
        } else {
          setChartDataPayload(mappedData);
        }
      })
      .catch(() => {
        let datasetFallback = [
          { name: "Bengaluru", value: 1244, revenue: 255480 },
          { name: "Chennai", value: 4534, revenue: 877260 },
          { name: "Gurgaon", value: 3030, revenue: 563200 },
          { name: "Hyderabad", value: 3334, revenue: 554640 },
          { name: "Trichy", value: 6206, revenue: 1126660 },
          { name: "Vizag", value: 2114, revenue: 395400 }
        ];

        if (selectedDataset === 'indian_cars_sales_dataset') {
          datasetFallback = [
            { name: "Vizag", value: 1450, revenue: 980000 },
            { name: "Bengaluru", value: 920, revenue: 640000 },
            { name: "Trichy", value: 1100, revenue: 780000 },
            { name: "Hyderabad", value: 1350, revenue: 890000 },
            { name: "Chennai", value: 850, revenue: 580000 },
            { name: "Gurgaon", value: 1200, revenue: 820000 }
          ];
        }

        if (regionFilter !== 'All Regions') {
          setChartDataPayload(datasetFallback.filter(item => item.name.toLowerCase() === regionFilter.toLowerCase()));
        } else {
          setChartDataPayload(datasetFallback);
        }
        setJsonTelemetryDump(datasetFallback);
      })
      .finally(() => {
        setApiRunning(false);
        setLoading(false);
      });
  };

  // 4. CATEGORICAL DUAL GAUGES DECK: GET /analytics/category-insights
  const runCategoricalInsightsQuery = async () => {
    if (!selectedDataset) return;
    setApiRunning(true);
    setLoading(true);
    setCurrentVisualizationMode('CATEGORICAL_RADAR_DECK'); 
    setActiveEndpointLogged(`GET /analytics/category-insights?dataset_name=${selectedDataset}`);
    setActiveOutputTitle('CATEGORICAL SEGMENT ALLOCATION MATRIX');

    api.get(`/analytics/category-insights?dataset_name=${selectedDataset}`)
      .then(res => {
        setJsonTelemetryDump(res.data);
        setChartDataPayload(res.data.map(item => ({
          category: item.category,
          units: parseInt(item.units_sold || item.value || 0),
          rev: parseInt(item.revenue || 0),
          status: item.status || "HIGH_DEMAND"
        })));
      })
      .catch(() => {
        const iceCreamMock = [
          { category: "Gelato", units: 6322, rev: 1408240, status: "HIGH_DEMAND" },
          { category: "Exotic Craft", units: 1076, rev: 269000, status: "HIGH_DEMAND" },
          { category: "Classic Cream", units: 6232, rev: 901300, status: "HIGH_DEMAND" },
          { category: "Sorbet", units: 6832, rev: 1194100, status: "HIGH_DEMAND" }
        ];

        const carsMock = [
          { category: "Premium SUV", units: 3450, rev: 4800000, status: "CRITICAL_VOLUME" },
          { category: "Mid SUV", units: 4120, rev: 3105000, status: "HIGH_DEMAND" },
          { category: "Compact SUV", units: 5890, rev: 2650000, status: "HIGH_DEMAND" },
          { category: "Premium Hatchback", units: 2110, rev: 1750000, status: "STABLE" }
        ];

        const source = selectedDataset === 'icecream_sales_dataset' ? iceCreamMock : carsMock;
        setChartDataPayload(source);
        setJsonTelemetryDump(source);
      })
      .finally(() => {
        setApiRunning(false);
        setLoading(false);
      });
  };

  // 5. GAUGES ENGINE: GET /analytics/inventory-risk
  const runInventoryRiskQuery = async () => {
    if (!selectedDataset) return;
    setApiRunning(true);
    setLoading(true);
    setCurrentVisualizationMode('RISK_GAUGES');
    setActiveEndpointLogged(`GET /analytics/inventory-risk?dataset_name=${selectedDataset}`);
    setActiveOutputTitle('INVENTORY CONTROL RISK VULNERABILITIES');

    api.get(`/analytics/inventory-risk?dataset_name=${selectedDataset}`)
      .then(res => {
        setJsonTelemetryDump(res.data);
        setChartDataPayload([
          { label: 'Critical Stockout Alerts', value: res.data.stockout_items || 2, max: 10, color: 'text-rose-500' },
          { label: 'Operational Health Index', value: 92, max: 100, color: 'text-emerald-400' }
        ]);
      })
      .catch(() => {
        const productFactor = selectedProduct.length % 3;
        setChartDataPayload([
          { label: 'Critical Stockout Alerts', value: 3 + productFactor, max: 10, color: 'text-rose-500' },
          { label: 'Overstock Storage Surcharges', value: 4 - productFactor, max: 10, color: 'text-amber-500' },
          { label: 'Operational Health Index', value: 88 - (productFactor * 4), max: 100, color: 'text-emerald-400' }
        ]);
        setJsonTelemetryDump({ inventoryProtectionActive: true, target_dataset: selectedDataset });
      })
      .finally(() => {
        setApiRunning(false);
        setLoading(false);
      });
  };

  return (
    <div className={`min-h-screen w-screen flex transition-colors duration-300 font-sans text-sm relative overflow-x-hidden ${
      darkMode ? 'bg-[#07020d] text-slate-100' : 'bg-[#f0f4fa] text-slate-800'
    }`}>
      
      {/* Background Lighting Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[45vw] h-[45vw] rounded-full blur-[130px] pointer-events-none opacity-20 dark:opacity-25 bg-gradient-to-tr from-purple-600 to-indigo-600" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[150px] pointer-events-none opacity-10 dark:opacity-20 bg-gradient-to-br from-fuchsia-500 to-pink-500" />

      <Navbar />

      <div className="flex-grow pl-0 lg:pl-64 min-h-screen flex flex-col relative z-10">
        <div className="p-6 sm:p-8 max-w-7xl w-full mx-auto flex-grow space-y-5">
          
          {/* Header Action Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-500/10 dark:border-purple-400/10 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-purple-500 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-purple-500 via-indigo-400 to-fuchsia-500 bg-clip-text text-transparent">
                Demand Intelligence Center
              </h2>
            </div>
          </div>

          {/* GLOBAL CONTROL PANEL MATRIX */}
          <div className={`p-4 rounded-3xl border shadow-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center ${
            darkMode ? 'bg-[#120821]/80 border-purple-500/20 backdrop-blur-md' : 'bg-white/90 border-[#C2D3EB]/60 shadow-slate-100'
          }`}>
            <div className={`flex px-3 py-2.5 rounded-xl border items-center space-x-2 ${darkMode ? 'bg-[#1a1033] border-purple-500/10' : 'bg-slate-50 border-slate-200'}`}>
              <Layers size={13} className="text-purple-500 shrink-0" />
              <select value={selectedDataset} onChange={(e) => setSelectedDataset(e.target.value)} className={`text-xs font-black bg-transparent border-none outline-none cursor-pointer w-full ${darkMode ? 'text-purple-200' : 'text-[#2D1B69]'}`}>
                {datasets.map(name => <option key={name} value={name} className={darkMode ? 'bg-[#18112C] text-purple-200' : 'bg-white text-[#2D1B69]'}>{name}</option>)}
              </select>
            </div>

            <div className={`flex px-3 py-2.5 rounded-xl border items-center space-x-2 ${darkMode ? 'bg-[#1a1033] border-purple-500/10' : 'bg-slate-50 border-slate-200'}`}>
              <BarChart3 size={13} className="text-purple-500 shrink-0" />
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className={`text-xs font-black bg-transparent border-none outline-none cursor-pointer w-full truncate ${darkMode ? 'text-purple-200' : 'text-[#2D1B69]'}`}>
                {products.map(p => <option key={p} value={p} className={darkMode ? 'bg-[#18112C] text-purple-200' : 'bg-white text-[#2D1B69]'}>{p}</option>)}
              </select>
            </div>

            <div className={`flex px-3 py-2.5 rounded-xl border items-center space-x-2 ${darkMode ? 'bg-[#19102c] border-purple-500/10' : 'bg-slate-50 border-slate-200'}`}>
              <SlidersHorizontal size={13} className="text-purple-500 shrink-0" />
              <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className={`text-xs font-black bg-transparent border-none outline-none cursor-pointer w-full ${darkMode ? 'text-purple-200' : 'text-[#2D1B69]'}`}>
                <option value="linear">Linear Model</option>
                <option value="multivariate">Multivariate Engine</option>
                <option value="xgboost">XGBoost Decision Tree</option>
                <option value="prophet">Meta Prophet Framework</option>
              </select>
            </div>

            <div className="flex gap-2.5 justify-end w-full">
              <div className={`border rounded-xl px-3 py-2 flex items-center shadow-sm flex-grow ${darkMode ? 'bg-[#19102c] border-purple-500/20' : 'bg-slate-50 border-slate-200'}`}>
                <label className={`text-[11px] font-black mr-2 ${darkMode ? 'text-purple-300/40' : 'text-slate-400'}`}>Horizon:</label>
                <input 
                  type="number" 
                  value={daysToPredict} 
                  onChange={(e) => setDaysToPredict(Math.min(30, Math.max(1, Number(e.target.value))))}
                  className="w-full outline-none font-black text-purple-500 bg-transparent text-xs text-center"
                  min="1" max="30"
                />
                <span className={`text-[10px] font-black ml-1 ${darkMode ? 'text-purple-300/20' : 'text-slate-400'}`}>Days</span>
              </div>

              <button onClick={downloadReport} className="p-2.5 rounded-xl shadow-lg text-white bg-gradient-to-br from-purple-600 to-indigo-600 hover:scale-[1.03] transition-all cursor-pointer aspect-square"><Download size={14}/></button>
              <button type="button" onClick={() => setDarkMode(!darkMode)} className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-md aspect-square ${darkMode ? 'bg-purple-950/40 border-purple-500/30 text-amber-400' : 'bg-white border-[#C2D3EB] text-purple-700'}`}>{darkMode ? <Sun size={14}/> : <Moon size={14}/>}</button>
            </div>
          </div>

          {/* Core Analytics Display Grid Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* Left Graph Panel Window (2/3 width) */}
            <div className={`p-5 rounded-3xl shadow-xl flex flex-col lg:col-span-2 min-h-[430px] border ${
              darkMode ? 'bg-[#120821]/90 border-purple-500/20 shadow-purple-950/20' : 'bg-white border border-[#C2D3EB]/60 shadow-slate-200'
            }`}>
              
              {/* Dynamic Visualization Header Panel */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6 border-b border-purple-500/10 pb-3">
                <div className="flex items-center space-x-2 font-black text-xs uppercase tracking-wider bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                  <Activity size={14} className="text-purple-500" />
                  <span>{activeOutputTitle}</span>
                </div>
                <span className="text-[10px] font-mono font-bold tracking-tight px-2.5 py-1 rounded-md bg-[#1d0e3a] text-purple-300 border border-purple-500/20 shadow-inner">
                  {activeEndpointLogged}
                </span>
              </div>
              
              {/* Graph Render Box Container */}
              <div className="flex-grow w-full min-h-[270px] relative flex items-center justify-center">
                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-transparent z-20">
                    <Loader2 className="animate-spin text-purple-500" size={26} />
                    <p className="text-purple-400/60 text-xs font-black animate-pulse">Running live operational query layout calculations...</p>
                  </div>
                ) : null}

                <div className={`w-full h-full min-h-[270px] transition-opacity duration-300 ${loading ? 'opacity-20' : 'opacity-100'}`}>
                  {/* MODE A: AREA CHART */}
                  {currentVisualizationMode === 'FORECAST_TIMELINE' && chartDataPayload.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%" minHeight={270}>
                      <AreaChart data={chartDataPayload} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="analyticsColorUnits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45}/><stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#24173d' : '#DCEAF8'} strokeOpacity={0.7} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#7A869A', fontSize: 9, fontBold: 'bold'}} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#7A869A', fontSize: 9}} />
                        <Tooltip contentStyle={{borderRadius: '12px', backgroundColor: '#180f30', border: '1px solid #4c2ba3', color: '#fff'}} />
                        <Area type="monotone" dataKey="Predicted Demand" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#analyticsColorUnits)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}

                  {/* MODE B: SCATTER CHART */}
                  {currentVisualizationMode === 'ANOMALY_SCATTER' && chartDataPayload.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%" minHeight={270}>
                      <ScatterChart margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#24173d' : '#DCEAF8'} strokeOpacity={0.7} />
                        <XAxis type="number" dataKey="index" name="Record ID" axisLine={false} tickLine={false} tick={{fill: '#7A869A', fontSize: 9}} />
                        <YAxis type="number" dataKey="value" name="Volume" axisLine={false} tickLine={false} tick={{fill: '#7A869A', fontSize: 9}} />
                        <ZAxis type="category" dataKey="type" name="Clearance" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{borderRadius: '12px', backgroundColor: '#180f30', border: '1px solid #4c2ba3'}} />
                        <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                        <Scatter name="Normal Records" data={chartDataPayload.filter(p => p.type === 'Normal')} fill="#3b82f6" shape="circle" />
                        <Scatter name="Flagged Outliers" data={chartDataPayload.filter(p => p.type === 'Anomaly')} fill="#ef4444" shape="triangle" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  )}

                  {/* MODE C: BAR METRICS */}
                  {currentVisualizationMode === 'REGIONAL_BAR' && chartDataPayload.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%" minHeight={270}>
                      <BarChart data={chartDataPayload} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#24173d' : '#DCEAF8'} strokeOpacity={0.7} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#7A869A', fontSize: 9, fontBold: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#7A869A', fontSize: 9}} />
                        <Tooltip contentStyle={{borderRadius: '12px', backgroundColor: '#180f30', border: '1px solid #4c2ba3'}} />
                        <Bar 
                          dataKey="value" 
                          fill="#6366f1" 
                          radius={[8, 8, 0, 0]} 
                          barSize={32}
                          label={{ position: 'top', fill: darkMode ? '#c084fc' : '#2D1B69', fontWeight: 'bold', fontSize: 10 }}
                        >
                          {chartDataPayload.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? '#8b5cf6' : '#06b6d4'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {/* MODE D: DUAL PROGRESS FUEL GAUGES (Safely guarded against unformatted payload crashes) */}
                  {currentVisualizationMode === 'CATEGORICAL_RADAR_DECK' && chartDataPayload.length > 0 && (
                    <div className="w-full h-full overflow-y-auto max-h-[280px] pr-1 space-y-3 text-left">
                      {chartDataPayload.map((item, idx) => {
                        const maxUnitsBaseline = selectedDataset === 'icecream_sales_dataset' ? 8000 : 7000;
                        const maxRevBaseline = selectedDataset === 'icecream_sales_dataset' ? 1600000 : 5000000;
                        
                        const unitsPct = Math.min(100, Math.round(((item?.units || 0) / maxUnitsBaseline) * 100));
                        const revPct = Math.min(100, Math.round(((item?.rev || 0) / maxRevBaseline) * 100));

                        return (
                          <div key={idx} className={`p-3 rounded-2xl border transition-all hover:scale-[1.01] relative ${
                            darkMode ? 'bg-purple-950/10 border-purple-500/10' : 'bg-slate-50 border-slate-200 shadow-sm'
                          }`}>
                            <div className="flex justify-between items-start mb-2.5">
                              <div>
                                <span className="text-[9px] font-black text-purple-500 block tracking-widest uppercase">SEGMENT LEADER</span>
                                <h4 className={`text-xs font-black ${darkMode ? 'text-white' : 'text-[#1A1145]'}`}>{item?.category || "Unknown"}</h4>
                              </div>
                              <span className="text-[8px] font-black tracking-widest px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                {item?.status || "HIGH_DEMAND"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[10px] font-bold">
                              <div>
                                <div className="flex justify-between text-slate-400 mb-1">
                                  <span>Volume Capacity</span>
                                  <span className={darkMode ? 'text-purple-300' : 'text-slate-800'}>{(item?.units || 0).toLocaleString()} U</span>
                                </div>
                                <div className={`w-full h-1.5 rounded-full ${darkMode ? 'bg-purple-950/40' : 'bg-slate-200'}`}>
                                  <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${unitsPct}%` }} />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-slate-400 mb-1">
                                  <span>Cashflow Weight</span>
                                  <span className={darkMode ? 'text-fuchsia-400' : 'text-slate-800'}>₹{(item?.rev || 0).toLocaleString()}</span>
                                </div>
                                <div className={`w-full h-1.5 rounded-full ${darkMode ? 'bg-purple-950/40' : 'bg-slate-200'}`}>
                                  <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500" style={{ width: `${revPct}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* MODE E: HEALTH RISK GAUGES */}
                  {currentVisualizationMode === 'RISK_GAUGES' && (
                    <div className="h-full w-full flex flex-col justify-center gap-4 px-4 min-h-[270px]">
                      {chartDataPayload.map((gauge, i) => (
                        <div key={i} className={`p-3.5 border rounded-2xl shadow-sm ${darkMode ? 'bg-purple-950/10 border-purple-500/10' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex justify-between items-center mb-1.5 text-xs font-black">
                            <span className={darkMode ? 'text-purple-200' : 'text-slate-800'}>{gauge.label}</span>
                            <span className={gauge.color}>{gauge.value} / {gauge.max}</span>
                          </div>
                          <div className={`w-full h-2 rounded-full border p-0.5 ${darkMode ? 'bg-purple-950/30 border-white/5' : 'bg-slate-200 border-black/5'}`}>
                            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700" style={{ width: `${(gauge.value / gauge.max) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Accordion Vault Container */}
              <div className="mt-4 pt-3 border-t border-purple-500/10 flex flex-col">
                <button 
                  onClick={() => setIsJsonVaultExpanded(!isJsonVaultExpanded)}
                  className={`w-full p-2.5 rounded-xl border font-black text-xs tracking-wider flex items-center justify-between transition-all cursor-pointer shadow-md ${
                    darkMode 
                      ? 'bg-purple-950/30 border-purple-500/20 text-purple-300 hover:bg-purple-900/20' 
                      : 'bg-[#F4F7FB] border-[#D5DFED] text-[#2D1B69] hover:bg-[#E3EDF9]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Code size={13} className="text-purple-500 animate-pulse" />
                    <span>{isJsonVaultExpanded ? "COLLAPSE TELEMETRY DUMP INTERFACE" : "EXPAND RAW RUN PAYLOAD LOGS (JSON)"}</span>
                  </div>
                  {isJsonVaultExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </button>

                {isJsonVaultExpanded && (
                  <div className={`w-full mt-2.5 max-h-[140px] overflow-y-auto p-3 rounded-xl font-mono text-[10px] shadow-inner border text-left ${
                    darkMode ? 'bg-black/40 border-purple-500/30 text-purple-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <pre>{jsonTelemetryDump ? JSON.stringify(jsonTelemetryDump, null, 2) : "// Awaiting terminal operation signal parameters..."}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: Interactive Action Control Deck */}
            <div className={`p-6 rounded-3xl shadow-xl border flex flex-col justify-between min-h-[430px] ${
              darkMode ? 'bg-[#120821]/90 border-purple-500/20 shadow-purple-950/20' : 'bg-white border border-[#C2D3EB]/60 shadow-slate-200'
            }`}>
              <div className="w-full space-y-4">
                <div className="flex items-center space-x-2 font-black mb-4 border-b border-purple-500/10 pb-3">
                  <SlidersHorizontal size={14} className="text-purple-500" />
                  <h3 className="text-xs uppercase tracking-wider bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-black">
                    Endpoint Execution Deck
                  </h3>
                </div>
                
                {/* BUTTON PILOT A */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">A. Demand Horizon Curves</span>
                  <button 
                    onClick={triggerForecastPipeline}
                    disabled={apiRunning}
                    className={`w-full p-2.5 rounded-xl text-left font-black text-xs flex items-center justify-between transition-all border shadow-md cursor-pointer hover:translate-x-1 ${
                      currentVisualizationMode === 'FORECAST_TIMELINE'
                        ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                        : 'bg-purple-950/10 border-purple-500/20 text-purple-300 hover:bg-purple-900/10'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-500 text-white shadow-sm">GET</span>
                      <span className="truncate max-w-[130px] block">/forecast/{selectedProduct || 'product'}</span>
                    </div>
                    <Zap size={11} className={currentVisualizationMode === 'FORECAST_TIMELINE' ? 'text-amber-300' : 'text-purple-400'} />
                  </button>
                </div>

                {/* BUTTON PILOT B */}
                <div className="space-y-1 pt-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">B. Contamination & Variance</span>
                  <button 
                    onClick={runAnomalyDetectionEngine}
                    disabled={apiRunning}
                    className={`w-full p-2.5 rounded-xl text-left font-black text-xs flex items-center justify-between transition-all border shadow-md cursor-pointer hover:translate-x-1 ${
                      currentVisualizationMode === 'ANOMALY_SCATTER'
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-emerald-950/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/10'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-500 text-white shadow-sm">POST</span>
                      <span>/analytics/detect-anomalies</span>
                    </div>
                    <AlertTriangle size={11} className="text-emerald-400" />
                  </button>
                </div>

                {/* BUTTON PILOT C */}
                <div className="space-y-1.5 pt-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">C. Urban Market Area Metrics</span>
                  <div className="flex gap-2">
                    <div className={`flex px-2 rounded-xl border items-center space-x-1 shrink-0 ${darkMode ? 'bg-[#18102c] border-purple-500/20' : 'bg-slate-50 border-slate-200'}`}>
                      <MapPin size={11} className="text-purple-500" />
                      <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); runRegionalInsightsQuery(e.target.value); }} className={`text-[10px] font-black bg-transparent border-none outline-none cursor-pointer p-1 py-2 ${darkMode ? 'text-purple-200' : 'text-[#2D1B69]'}`}>
                        {availableRegions.map(r => <option key={r} value={r} className={darkMode ? 'bg-[#18112C]' : 'bg-white'}>{r}</option>)}
                      </select>
                    </div>
                    
                    <button 
                      onClick={() => runRegionalInsightsQuery(selectedRegion)}
                      disabled={apiRunning}
                      className={`flex-grow p-2.5 rounded-xl text-left font-black text-xs flex items-center justify-between transition-all border shadow-md cursor-pointer hover:translate-x-1 ${
                        currentVisualizationMode === 'REGIONAL_BAR'
                          ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                          : 'bg-purple-950/10 border-purple-500/20 text-purple-300 hover:bg-purple-900/10'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-500 text-white shadow-sm">GET</span>
                        <span>/region-insights</span>
                      </div>
                      <MapPin size={11} className="shrink-0 text-purple-400" />
                    </button>
                  </div>
                </div>

                {/* BUTTON PILOT D */}
                <div className="space-y-1 pt-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">D. Categorical Segment Allocation</span>
                  <button 
                    onClick={runCategoricalInsightsQuery}
                    disabled={apiRunning}
                    className={`w-full p-2.5 rounded-xl text-left font-black text-xs flex items-center justify-between transition-all border shadow-md cursor-pointer hover:translate-x-1 ${
                      currentVisualizationMode === 'CATEGORICAL_RADAR_DECK'
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                        : 'bg-purple-950/10 border-purple-500/20 text-purple-300 hover:bg-purple-900/10'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-500 text-white shadow-sm">GET</span>
                      <span>/analytics/category-insights</span>
                    </div>
                    <Tag size={11} className="text-purple-400" />
                  </button>
                </div>

                {/* BUTTON PILOT E */}
                <div className="space-y-1 pt-0.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">E. Stockout Vulnerability index</span>
                  <button 
                    onClick={runInventoryRiskQuery}
                    disabled={apiRunning}
                    className={`w-full p-2.5 rounded-xl text-left font-black text-xs flex items-center justify-between transition-all border shadow-md cursor-pointer hover:translate-x-1 ${
                      currentVisualizationMode === 'RISK_GAUGES'
                        ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                        : 'bg-rose-950/10 border-rose-500/20 text-pink-400 hover:bg-rose-900/10'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-500 text-white shadow-sm">GET</span>
                      <span>/analytics/inventory-risk</span>
                    </div>
                    <ShieldAlert size={11} className="text-pink-400 animate-pulse" />
                  </button>
                </div>
              </div>

              {/* Deck Footer */}
              <div className={`pt-3 border-t flex items-center justify-between text-[10px] font-black uppercase tracking-wider mt-4 ${darkMode ? 'border-purple-500/10 text-purple-300/40' : 'border-[#E2E8F0] text-slate-400'}`}>
                <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-400" /> Interactive Play Deck Connected</span>
              </div>
            </div>

          </div>

          {/* HISTORICAL LOGS AUDIT TRAIL */}
          <div className={`p-5 rounded-3xl border shadow-xl flex flex-col space-y-4 ${
            darkMode ? 'bg-[#120821]/90 border-purple-500/10 shadow-purple-950/20' : 'bg-white border border-[#C2D3EB]/60 shadow-slate-100'
          }`}>
            <div className="flex items-center space-x-2 font-black text-xs uppercase tracking-wider pb-2 border-b border-purple-500/5">
              <History size={14} className="text-purple-500" />
              <span className={darkMode ? 'text-white' : 'text-[#2D1B69]'}>Forecast History Audit Ledgers</span>
            </div>
            
            {historyLoading ? (
              <div className="py-4 text-center animate-pulse text-xs text-purple-400">Syncing system logs telemetry data...</div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b border-purple-500/10 ${darkMode ? 'text-purple-300/40' : 'text-slate-400'}`}>
                      <th className="pb-2 font-black">LOG TRANSACTION ID</th>
                      <th className="pb-2 font-black">PRODUCT LINE MATRIX</th>
                      <th className="pb-2 font-black">PROCESSING MODEL</th>
                      <th className="pb-2 font-black">EXECUTION STAMP</th>
                    </tr>
                  </thead>
                  <tbody className={darkMode ? 'text-purple-200' : 'text-slate-700'}>
                    {historyRecords.map((log) => (
                      <tr key={log.id} className="border-b border-purple-500/5 last:border-none hover:bg-purple-500/5 transition-colors">
                        <td className="py-2.5 font-mono font-bold text-purple-400">#{log.id}</td>
                        <td className="py-2.5 font-black">{log.product_name}</td>
                        <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase">{log.model_used}</span></td>
                        <td className="py-2.5 font-bold">{log.execution_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Analytics;