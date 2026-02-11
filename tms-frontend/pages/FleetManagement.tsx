import React, { useState, useEffect } from 'react';
import { API_URL } from '../src/config';
import { Truck, Plus, Search, Filter, Edit, Trash2, X } from 'lucide-react';

const FleetManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // ID item yang sedang diedit (null = mode tambah)

  const [formData, setFormData] = useState({
    plat_no: '',
    type: 'Truck',
    capacity_kg: '',
    status: 'available',
    latitude: '-6.200000',
    longitude: '106.816666'
  });

  // Ambil data kendaraan dari Backend
  const fetchVehicles = () => {
    fetch(`${API_URL}/api/vehicles`)
      .then(res => res.json())
      .then(data => setVehicles(data))
      .catch(err => console.error("Error:", err));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- HANDLE EDIT ---
  const handleEdit = (vehicle: any) => {
    setEditingId(vehicle.id);
    setFormData({
      plat_no: vehicle.plat_no,
      type: vehicle.type,
      capacity_kg: vehicle.capacity_kg,
      status: vehicle.status,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude
    });
    setIsModalOpen(true);
  };

  // --- HANDLE DELETE ---
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      const response = await fetch(`${API_URL}/api/vehicles/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchVehicles();
      } else {
        alert("Gagal menghapus kendaraan");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  // --- HANDLE SUBMIT (ADD / UPDATE) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Tentukan URL & Method berdasarkan mode (Edit vs Add)
    const url = editingId
      ? `${API_URL}/api/vehicles/${editingId}`
      : `${API_URL}/api/vehicles`;

    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        closeModal();
        fetchVehicles();
      } else {
        alert(`Gagal ${editingId ? 'mengupdate' : 'menambah'} kendaraan`);
      }
    } catch (error) {
      console.error("Error saving vehicle:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null); // Reset mode edit
    setFormData({
      plat_no: '',
      type: 'Truck',
      capacity_kg: '',
      status: 'available',
      latitude: '-6.200000',
      longitude: '106.816666'
    });
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Halaman */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fleet Management</h2>
          <p className="text-slate-500">Manage your trucks and logistics assets</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add New Vehicle
        </button>
      </div>

      {/* Tabel Kendaraan */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Plat Nomor</th>
              <th className="p-4 font-semibold text-slate-600">Tipe</th>
              <th className="p-4 font-semibold text-slate-600">Kapasitas</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
              <th className="p-4 font-semibold text-slate-600">Lokasi</th>
              <th className="p-4 font-semibold text-slate-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length > 0 ? (
              vehicles.map((v: any, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{v.plat_no}</td>
                  <td className="p-4 text-slate-600">{v.type}</td>
                  <td className="p-4 text-slate-600">{v.capacity_kg} kg</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${v.status === 'available' ? 'bg-green-100 text-green-700' :
                      v.status === 'maintenance' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-sm">
                    {v.latitude}, {v.longitude}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(v)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Vehicle"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Vehicle"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  Belum ada data kendaraan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM (ADD / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plat Nomor</label>
                <input
                  type="text"
                  name="plat_no"
                  value={formData.plat_no}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="B 1234 XYZ"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Pickup">Pickup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kapasitas (kg)</label>
                  <input
                    type="number"
                    name="capacity_kg"
                    value={formData.capacity_kg}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="1000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="available">Available</option>
                  <option value="moving">Moving</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-200 transition-colors"
                >
                  {editingId ? 'Update Vehicle' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetManagement;