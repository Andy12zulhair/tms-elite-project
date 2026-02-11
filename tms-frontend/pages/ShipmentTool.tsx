import React, { useState, useEffect } from 'react';
import { Package, MapPin, ArrowRight, Clock, User, Filter, Download, Plus, Trash2, X } from 'lucide-react';
import { ShipmentStatus } from '../types';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ShipmentTool: React.FC = () => {
  const [shipments, setShipments] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_detail: '',
    description: '',
    origin: '',
    destination: '',
    status: 'Pending',
    customer_name: ''
  });

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Shipment Report", 14, 10);

    const tableColumn = ["ID", "Item", "Status", "Origin", "Destination", "Customer"];
    const tableRows: any[] = [];

    shipments.forEach((shipment: any) => {
      const shipmentData = [
        shipment.id,
        shipment.item_detail,
        shipment.status,
        shipment.origin,
        shipment.destination,
        shipment.customer_name,
      ];
      tableRows.push(shipmentData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("shipments_report.pdf");
  };

  // Fetch Shipments
  const fetchShipments = () => {
    fetch('http://localhost:5000/api/shipments')
      .then(res => res.json())
      .then(data => setShipments(data))
      .catch(err => console.error("Error:", err));
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchShipments();
        setFormData({
          item_detail: '',
          description: '',
          origin: '',
          destination: '',
          status: 'Pending',
          customer_name: ''
        });
      } else {
        alert("Gagal menambah shipment");
      }
    } catch (error) {
      console.error("Error adding shipment:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this shipment?")) return;
    try {
      await fetch(`http://localhost:5000/api/shipments/${id}`, { method: 'DELETE' });
      fetchShipments();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-slate-500 bg-slate-100';
      case 'Assigned': return 'text-purple-500 bg-purple-100';
      case 'In Transit': return 'text-blue-500 bg-blue-100';
      case 'Delivered': return 'text-green-500 bg-green-100';
      case 'Failed': return 'text-red-500 bg-red-100';
      default: return 'text-slate-500 bg-slate-100';
    }
  };

  const filteredShipments = filter === 'All'
    ? shipments
    : shipments.filter((s: any) => s.status === filter);

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Orders & Shipments</h2>
          <p className="text-slate-500">Track shipment progress and manage new orders</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportPDF}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Download size={20} />
            Export PDF
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
          >
            <Plus size={20} />
            New Shipment
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {['All', 'Pending', 'In Transit', 'Delivered', 'Failed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredShipments.map((order: any) => (
          <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-blue-300 transition-colors group">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1 flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <Package className="text-blue-600" size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">#{order.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm font-medium">{order.item_detail}</p>
                  {order.description && <p className="text-slate-400 text-xs italic">{order.description}</p>}
                </div>
              </div>

              <div className="flex-1 flex items-center gap-4">
                <div className="text-right flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Origin</p>
                  <p className="text-sm text-slate-700 font-semibold">{order.origin}</p>
                </div>
                <div className="flex-none p-2 bg-slate-50 rounded-full border border-slate-100">
                  <ArrowRight size={16} className="text-slate-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Destination</p>
                  <p className="text-sm text-slate-700 font-semibold">{order.destination}</p>
                </div>
              </div>

              <div className="flex-1 flex items-center gap-8 justify-end">
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <User size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-600 font-medium">{order.customer_name}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="bg-slate-50 hover:bg-red-50 hover:text-red-600 p-3 rounded-xl transition-all border border-slate-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredShipments.length === 0 && (
          <div className="text-center p-10 text-slate-400">No shipments found for status "{filter}".</div>
        )}
      </div>

      {/* MODAL ADD SHIPMENT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">New Shipment</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Detail</label>
                <input type="text" name="item_detail" value={formData.item_detail} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2" placeholder="e.g. Selamat Menikmati Hidangan Kami" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Origin</label>
                  <input type="text" name="origin" value={formData.origin} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                  <input type="text" name="destination" value={formData.destination} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                <input type="text" name="customer_name" value={formData.customer_name} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2">
                  <option value="Pending">Pending</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentTool;
