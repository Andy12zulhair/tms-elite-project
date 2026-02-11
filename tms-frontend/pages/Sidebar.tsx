import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Truck, ShoppingCart, Users, CreditCard, LogOut, Settings, X } from 'lucide-react';

interface SidebarProps {
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isOpen, onClose }) => {
  const location = useLocation();

  const menus = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Fleet Management', path: '/fleet', icon: Truck },
    { name: 'Orders & Shipments', path: '/orders', icon: ShoppingCart },
    { name: 'Driver Management', path: '/drivers', icon: Users },
    { name: 'Finance & Invoicing', path: '/finance', icon: CreditCard },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col h-screen border-r border-slate-800 shadow-2xl skew-x-0
        transform transition-transform duration-300 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/20">
              <Truck size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">TMS Elite</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Logistics Control</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-2 overflow-y-auto">
          {menus.map((menu) => {
            const isActive = location.pathname === menu.path;
            return (
              <Link
                key={menu.name}
                to={menu.path}
                onClick={onClose} // Close sidebar on mobile when link clicked
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20"></div>
                )}
                <menu.icon size={20} className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                <span className="font-medium tracking-wide text-sm">{menu.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl mb-4 border border-slate-700/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-200">Admin User</p>
              <p className="text-xs text-slate-500 truncate">Dispatch Central</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 w-full hover:bg-red-500/10 rounded-xl transition-all duration-200 text-sm font-medium group"
          >
            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;