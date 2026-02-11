import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- BAGIAN PENTING: Import file asli, jangan bikin dummy ---
import Sidebar from './pages/Sidebar';
import Dashboard from './pages/Dashboard';
import FleetManagement from './pages/FleetManagement';
import ShipmentTool from './pages/ShipmentTool';
import DriverTool from './pages/DriverTool'; // Mengambil dari DriverTool.tsx
import FinanceTool from './pages/FinanceTool';
import SettingsPage from './pages/SettingsPage';

import LoginPage from './pages/LoginPage';

import { Menu } from 'lucide-react';

function App() {
  // Simple Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user'); // Clear user data
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900">
        <Sidebar onLogout={handleLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 md:p-8 ml-0 md:ml-64 transition-all duration-300 w-full min-h-screen">

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mb-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg text-slate-800">TMS Elite</span>
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>

          <Routes>
            {/* 1. Halaman Utama -> Buka Dashboard yang canggih */}
            <Route path="/" element={<Dashboard />} />

            {/* 2. Halaman Armada -> Buka Tabel Fleet */}
            <Route path="/fleet" element={<FleetManagement />} />

            {/* 3. Halaman Orders -> Buka ShipmentTool */}
            <Route path="/orders" element={<ShipmentTool />} />

            {/* 4. Halaman Drivers -> Buka DriverTool */}
            <Route path="/drivers" element={<DriverTool />} />

            {/* 5. Halaman Finance -> Buka FinanceTool */}
            <Route path="/finance" element={<FinanceTool />} />

            {/* 6. Halaman Settings -> Buka SettingsPage */}
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>

        </main>
      </div>
    </Router>
  );
}

export default App;