import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Wallet, DollarSign, FileText, TrendingUp, PieChart as PieChartIcon, Plus, Trash2, X, Download } from 'lucide-react';
import { ResponsiveContainer, Tooltip, Cell, PieChart, Pie } from 'recharts';

const FinanceTool: React.FC = () => {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'Expense',
    category: 'Fuel',
    status: 'Paid'
  });

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Finance Report", 14, 10);

    const tableColumn = ["Date", "Description", "Type", "Category", "Amount", "Status"];
    const tableRows: any[] = [];

    transactions.forEach((t: any) => {
      const transactionData = [
        new Date(t.date).toLocaleDateString(),
        t.description,
        t.type,
        t.category,
        `Rp ${Number(t.amount).toLocaleString('id-ID')}`,
        t.status,
      ];
      tableRows.push(transactionData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("finance_report.pdf");
  };

  const fetchTransactions = () => {
    fetch('http://localhost:5000/api/finance')
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error("Error:", err));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Calculate Totals
  const totalIncome = transactions
    .filter((t: any) => t.type === 'Income')
    .reduce((acc, t: any) => acc + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t: any) => t.type === 'Expense')
    .reduce((acc, t: any) => acc + Number(t.amount), 0);

  // Prepare Chart Data
  const expenseCategories = ['Fuel', 'Toll', 'Maintenance', 'Logistics', 'Parking', 'Other'];
  const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#64748b'];

  const expenseData = expenseCategories.map((cat, index) => ({
    name: cat,
    value: transactions
      .filter((t: any) => t.type === 'Expense' && t.category === cat)
      .reduce((acc, t: any) => acc + Number(t.amount), 0),
    color: CHART_COLORS[index]
  })).filter(d => d.value > 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchTransactions();
        setFormData({ description: '', amount: '', type: 'Expense', category: 'Fuel', status: 'Paid' });
      } else {
        alert("Gagal menambah transaksi");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await fetch(`http://localhost:5000/api/finance/${id}`, { method: 'DELETE' });
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Finance & Invoicing</h2>
          <p className="text-slate-500">Track operational costs and manage client billing</p>
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
            Add Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                  <DollarSign size={20} />
                </div>
                <h4 className="font-semibold text-slate-700">Total Revenue</h4>
              </div>
              <p className="text-3xl font-bold text-slate-900">Rp {totalIncome.toLocaleString('id-ID')}</p>
              <p className="text-xs text-green-500 mt-2 flex items-center gap-1 font-bold">
                <TrendingUp size={12} />
                Generated Income
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                  <Wallet size={20} />
                </div>
                <h4 className="font-semibold text-slate-700">Total Expenses</h4>
              </div>
              <p className="text-3xl font-bold text-slate-900">Rp {totalExpense.toLocaleString('id-ID')}</p>
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1 font-bold">
                <TrendingUp size={12} />
                Operational Costs
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Recent Transactions</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {transactions.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${t.type === 'Income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{t.category}</span>
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">{new Date(t.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-sm font-bold ${t.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'Income' ? '+' : '-'} Rp {Number(t.amount).toLocaleString('id-ID')}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${t.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {t.status}
                      </span>
                    </div>
                    <button onClick={() => handleDelete(t.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-center text-slate-400 py-10">No transactions yet.</p>}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Expense Breakdown</h3>
            <PieChartIcon size={20} className="text-slate-400" />
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {expenseData.map((e) => (
              <div key={e.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }}></div>
                  <span className="text-sm text-slate-600 font-medium">{e.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-800">Rp {(e.value / 1000000).toFixed(1)}M</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL ADD TRANSACTION */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">New Transaction</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2" placeholder="e.g. Invoice #123 or Solar Refill" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (Rp)</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2">
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2">
                    <option value="Logistics">Logistics</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Toll">Toll</option>
                    <option value="Parking">Parking</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-slate-300 rounded-lg p-2">
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceTool;
