import React, { useState, useEffect } from 'react';
import { API_URL } from '../src/config';
import { User, Lock, Mail, Save, Smartphone, QrCode, Wifi } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const [profile, setProfile] = useState({
        id: 0,
        name: '',
        email: '',
        username: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState({ text: '', type: '' });
    const [waStatus, setWaStatus] = useState('loading');
    const [waQr, setWaQr] = useState<string | null>(null);

    useEffect(() => {
        // Load user data from localStorage
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (savedUser && savedUser.id) {
            setProfile(savedUser);
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetch(`${API_URL}/api/whatsapp/qr`)
                .then(res => res.json())
                .then(data => {
                    setWaStatus(data.status);
                    setWaQr(data.qr);
                })
                .catch(err => console.error(err));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ text: "New passwords do not match!", type: "error" });
            return;
        }

        try {
            const body: any = {
                name: profile.name,
                email: profile.email
            };

            if (passwordData.newPassword) {
                body.password = passwordData.newPassword;
            }

            const response = await fetch(`${API_URL}/api/users/${profile.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Update local storage
                setMessage({ text: "Profile updated successfully!", type: "success" });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ text: "Failed to update profile", type: "error" });
            }
        } catch (error) {
            console.error(error);
            setMessage({ text: "An error occurred", type: "error" });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                <p className="text-slate-500">Manage your account profile, security, and integration</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* PROFILE & SECURITY */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                            <User size={20} className="text-blue-600" />
                            Profile Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleProfileChange}
                                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleProfileChange}
                                        className="w-full border border-slate-300 rounded-lg pl-10 p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                            <Lock size={20} className="text-blue-600" />
                            Security
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full border border-slate-300 rounded-lg p-2.5"
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full border border-slate-300 rounded-lg p-2.5"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-transform active:scale-95"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </form>

                {/* WHATSAPP INTEGRATION */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <Smartphone size={20} className="text-green-600" />
                                WhatsApp Gateway
                            </h3>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${waStatus === 'connected' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {waStatus}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            {waStatus === 'connected' ? (
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                        <Wifi size={40} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Connected</h4>
                                        <p className="text-sm text-slate-500">WhatsApp is ready to send notifications.</p>
                                    </div>
                                </div>
                            ) : waQr ? (
                                <div className="text-center space-y-4">
                                    <div className="p-4 bg-white rounded-xl shadow-sm inline-block">
                                        <img src={waQr} alt="WhatsApp QR Code" className="w-48 h-48" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Scan QR Code</h4>
                                        <p className="text-sm text-slate-500">Open WhatsApp on your phone &rarr; Linked Devices &rarr; Link a Device</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-400">
                                    <QrCode size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>Loading WhatsApp Client...</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 text-xs text-slate-400 text-center">
                            *Notifikasi otomatis akan dikirim ke customer saat status pengiriman berubah.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsPage;
