import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Package, Truck, AlertTriangle, CheckCircle, Navigation, TrendingUp, Sparkles, MapPin, Calendar, ArrowUpRight
} from 'lucide-react';
import clsx from 'clsx';
import FleetMap from './FleetMap';


const getLogisticsInsights = async (prompt: string) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return "Based on current traffic patterns and fleet status, we recommend rerouting 3 vehicles in the North District to avoid potential congestion. Logistics efficiency is currently at 94%.";
};

const MOCK_STATS = {
  active_shipments: 142,
  available_fleet: 8,
  under_maintenance: 3,
  pending_orders: 24
};

const MOCK_VEHICLES = [
  { id: 1, latitude: -6.1751, longitude: 106.8650, status: 'moving', plat_no: 'Truck A-01' },
  { id: 2, latitude: -6.2088, longitude: 106.8456, status: 'idle', plat_no: 'Truck B-04' },
  { id: 3, latitude: -6.1214, longitude: 106.7741, status: 'moving', plat_no: 'Van express 12' },
  { id: 4, latitude: -6.2914, longitude: 106.8741, status: 'maintenance', plat_no: 'Truck C-09' },
  { id: 5, latitude: -6.1914, longitude: 106.9741, status: 'moving', plat_no: 'Truck D-02' },
];

function Dashboard() {
  const [aiInsight, setAiInsight] = useState<string>("Analyzing logistics data...");
  const [loadingAi, setLoadingAi] = useState(true);


  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stats, setStats] = useState({
    active_shipments: 0,
    available_fleet: 0,
    under_maintenance: 0,
    pending_orders: 0
  });


  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  useEffect(() => {

    async function loadInsights() {
      try {
        const insight = await getLogisticsInsights("High volume check");
        setAiInsight(insight);
      } catch (e) {
        setAiInsight("AI Analysis unavailable at the moment.");
      } finally {
        setLoadingAi(false);
      }
    }
    loadInsights();


    async function fetchStats() {
      try {

        const response = await fetch('http://localhost:5000/api/dashboard');
        if (!response.ok) throw new Error("Backend offline");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.warn('Backend unavailable, using MOCK DATA for Stats');
        setStats(MOCK_STATS);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();


    async function fetchVehicles() {
      try {
        const response = await fetch('http://localhost:5000/api/vehicles');
        if (!response.ok) throw new Error("Backend offline");
        const data = await response.json();
        setVehicles(data);
      } catch (error) {
        console.warn('Backend unavailable, using MOCK DATA for Vehicles');
        setVehicles(MOCK_VEHICLES);
      } finally {
        setLoadingVehicles(false);
      }
    }
    // Initial Fetch
    fetchStats();
    fetchVehicles();

    // Polling for Real-time updates (Every 3 seconds)
    const interval = setInterval(() => {
      fetchVehicles();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Fetch Performance Data
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  const PERFORMANCE_DATA_MOCK = [
    { name: 'Mon', shipments: 40, deliveryRate: 95 },
    { name: 'Tue', shipments: 55, deliveryRate: 92 },
    { name: 'Wed', shipments: 48, deliveryRate: 98 },
    { name: 'Thu', shipments: 65, deliveryRate: 94 },
    { name: 'Fri', shipments: 70, deliveryRate: 96 },
    { name: 'Sat', shipments: 35, deliveryRate: 99 },
    { name: 'Sun', shipments: 20, deliveryRate: 100 },
  ];

  useEffect(() => {
    async function fetchPerformance() {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard/performance');
        const data = await response.json();
        // Fallback if data is empty (prevents empty chart)
        if (data.length > 0) {
          setPerformanceData(data);
        } else {
          setPerformanceData(PERFORMANCE_DATA_MOCK);
        }
      } catch (error) {
        console.warn('Backend unavailable, using MOCK DATA for Chart');
        setPerformanceData(PERFORMANCE_DATA_MOCK);
      }
    }
    fetchPerformance();
  }, []);

  const STATS = [
    { label: 'Active Shipments', value: stats.active_shipments, icon: Navigation, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200' },
    { label: 'Available Fleet', value: stats.available_fleet, icon: Truck, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-200' },
    { label: 'Under Maintenance', value: stats.under_maintenance, icon: AlertTriangle, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-200' },
    { label: 'Pending Orders', value: stats.pending_orders, icon: Package, color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-200' },
  ];

  return (
    <div className="space-y-8 pb-10">

      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Control Tower</h2>
          <div className="flex items-center gap-2 mt-2 text-slate-500">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 min-w-[140px]">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span className="text-sm font-semibold text-slate-700">System Live</span>
          </div>
        </div>
      </div>


      <div className="relative group overflow-hidden rounded-3xl p-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl shadow-indigo-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/30 transition-all duration-700"></div>
        <div className="bg-slate-900/90 text-white p-6 rounded-[22px] relative z-10 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg shadow-indigo-900/50">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                Transport Logistics Analysis
                <span className="text-[10px] bg-indigo-500/30 px-2 py-0.5 rounded-full border border-indigo-400/30 text-indigo-200 font-medium">BETA</span>
              </h3>
              {loadingAi ? (
                <div className="space-y-2 mt-2 animate-pulse max-w-2xl">
                  <div className="h-4 bg-slate-700 rounded w-full"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                </div>
              ) : (
                <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
                  {aiInsight}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="animate-pulse flex items-center justify-between">
                <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
                <div className="w-16 h-6 bg-slate-200 rounded-lg"></div>
              </div>
              <div className="space-y-2 animate-pulse">
                <div className="w-12 h-8 bg-slate-200 rounded"></div>
                <div className="w-32 h-4 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          STATS.map((stat, i) => (
            <div key={i} className="group hover:-translate-y-1 transition-transform duration-300 relative bg-white p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 border border-slate-100/80">
              <div className="flex justify-between items-start mb-6">
                <div className={`bg-gradient-to-br ${stat.color} p-3.5 rounded-2xl text-white shadow-lg ${stat.shadow}`}>
                  <stat.icon size={26} />
                </div>
                <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-green-100">
                  <TrendingUp size={12} />
                  +12%
                </div>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</h4>
                <p className="text-slate-500 text-sm font-medium mt-1">{stat.label}</p>
              </div>
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight size={20} className="text-slate-300" />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative group">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center backdrop-blur-sm bg-white/80 absolute top-0 left-0 right-0 z-10 rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <MapPin size={20} />
              </div>
              <h3 className="font-bold text-slate-800">Real-time Fleet Tracking</h3>
            </div>
            {loadingVehicles ? (
              <div className="animate-pulse w-24 h-6 bg-slate-200 rounded-lg"></div>
            ) : (
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-bold shadow-sm shadow-blue-100">
                {vehicles.length} Active Vehicles
              </span>
            )}
          </div>

          <div className="h-[500px] relative z-0">
            {loadingVehicles && (
              <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-500 font-medium animate-pulse">Locating fleet...</p>
                </div>
              </div>
            )}

            <FleetMap vehicles={vehicles} />

          </div>
        </div>


        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col h-[500px]">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            Weekly Performance
          </h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorShip" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px',
                    fontFamily: 'inherit'
                  }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 600 }}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="shipments"
                  stroke="#4f46e5"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorShip)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl group hover:bg-blue-50 transition-colors">
              <p className="text-xs text-slate-400 mb-1 group-hover:text-blue-400">Total Volume</p>
              <p className="text-xl font-black text-slate-700 group-hover:text-blue-600">2.4k</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl group hover:bg-red-50 transition-colors">
              <p className="text-xs text-slate-400 mb-1 group-hover:text-red-400">Avg. Delay</p>
              <p className="text-xl font-black text-slate-700 group-hover:text-red-600">12m</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;