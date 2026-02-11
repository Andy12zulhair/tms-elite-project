import React, { useState, useEffect } from 'react';
import { Users, Star, Phone, MessageSquare, Award, Clock, Plus, Trash2, X } from 'lucide-react';
import { DriverStatus } from '../types';

const DriverTool: React.FC = () => {
  const [drivers, setDrivers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    sim_type: 'B1',
    status: 'Active'
  });

  const fetchDrivers = () => {
    fetch('http://localhost:5000/api/drivers')
      .then(res => res.json())
      .then(data => setDrivers(data))
      .catch(err => console.error("Error:", err));
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchDrivers();
        setFormData({ name: '', phone: '', sim_type: 'B1', status: 'Active' });
      } else {
        alert("Gagal menambah driver");
      }
    } catch (error) {
      console.error("Error adding driver:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this driver?")) return;
    try {
      await fetch(`http://localhost:5000/api/drivers/${id}`, { method: 'DELETE' });
      fetchDrivers();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Idle': return 'bg-amber-100 text-amber-700';
      case 'Off Duty': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Driver Management</h2>
          <p className="text-slate-500">Monitor driver performance and operational status</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={20} />
          Add New Driver
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver: any) => (
          <div key={driver.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden relative group hover:border-blue-300 transition-colors">
            <div className="absolute top-4 right-4 flex gap-2">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(driver.status)}`}>
                {driver.status}
              </span>
              <button onClick={() => handleDelete(driver.id)} className="text-slate-400 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${driver.name}&background=random`} alt={driver.name} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">{driver.name}</h4>
                <p className="text-sm text-slate-500 font-medium">SIM: {driver.sim_type}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-slate-700">{driver.rating || '5.0'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Phone</span>
                <span className="text-slate-700 font-semibold">{driver.phone || '-'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Total Trips</span>
                <span className="text-slate-700 font-semibold">{driver.total_trips || 0}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors">
                <Phone size={16} />
                Call
              </button>
              <button className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors">
                <MessageSquare size={16} />
                Message
              </button>
            </div>
          </div>
        ))}
        {drivers.length === 0 && (
          <div className="col-span-full text-center p-10 text-slate-400">No drivers found. Add one to get started.</div>
        )}
      </div>

      {/* MODAL ADD DRIVER */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">New Driver</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SIM Type</label>
                  <select name="sim_type" value={formData.sim_type} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2">
                    <option value="A">A</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2">
                    <option value="Active">Active</option>
                    <option value="Idle">Idle</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverTool;
