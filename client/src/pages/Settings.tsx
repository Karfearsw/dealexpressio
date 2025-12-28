import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Shield, X, QrCode, Lock } from 'lucide-react';
import axios from 'axios';

const Settings = () => {
    const { user, refreshUser } = useAuth();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    
    // Password State
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // 2FA State
    const [qrCode, setQrCode] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [twoFactorError, setTwoFactorError] = useState('');
    const [twoFactorSuccess, setTwoFactorSuccess] = useState('');

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        try {
            await axios.post('/auth/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setPasswordSuccess('Password updated successfully');
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordSuccess('');
            }, 2000);
        } catch (error: any) {
            setPasswordError(error.response?.data?.message || 'Failed to update password');
        }
    };

    const start2FASetup = async () => {
        try {
            const res = await axios.post('/auth/2fa/setup');
            setQrCode(res.data.qrCode);
            setShow2FAModal(true);
        } catch (error) {
            console.error('Failed to start 2FA setup', error);
        }
    };

    const verify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setTwoFactorError('');
        setTwoFactorSuccess('');

        try {
            await axios.post('/auth/2fa/verify', { token: twoFactorCode });
            setTwoFactorSuccess('2FA verified and enabled successfully');
            await refreshUser();
            setTimeout(() => {
                setShow2FAModal(false);
                setQrCode('');
                setTwoFactorCode('');
                setTwoFactorSuccess('');
            }, 2000);
        } catch (error: any) {
            setTwoFactorError(error.response?.data?.message || 'Invalid code');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 relative">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
                <p className="text-slate-400">Manage your account and preferences.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center">
                        <User className="mr-2 text-teal-500" size={20} />
                        Profile Information
                    </h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                        <div className="text-slate-200 font-mono bg-slate-950 px-4 py-2 rounded border border-slate-800 inline-block">
                            {user?.email}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Role</label>
                        <div className="text-slate-200 bg-slate-950 px-4 py-2 rounded border border-slate-800 inline-block capitalize">
                            {user?.role}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-slate-100 flex items-center">
                        <Shield className="mr-2 text-teal-500" size={20} />
                        Security
                    </h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-slate-200 font-medium">Two-Factor Authentication</h4>
                            <p className="text-sm text-slate-500">
                                {user?.twoFactorEnabled ? 'Your account is secured with 2FA.' : 'Secure your account with 2FA.'}
                            </p>
                        </div>
                        <button 
                            onClick={user?.twoFactorEnabled ? undefined : start2FASetup}
                            disabled={!!user?.twoFactorEnabled}
                            className={`px-4 py-2 rounded-lg transition-colors border ${user?.twoFactorEnabled ? 'bg-green-500/10 text-green-500 border-green-500/20 cursor-default' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}
                        >
                            {user?.twoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
                        </button>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <div>
                            <h4 className="text-slate-200 font-medium">Change Password</h4>
                            <p className="text-sm text-slate-500">Update your password periodically.</p>
                        </div>
                        <button 
                            onClick={() => setShowPasswordModal(true)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                        >
                            Update Password
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center pt-8 text-xs text-slate-600">
                ExpressDeal CRM v1.0.0
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-100 flex items-center">
                                <Lock className="mr-2 text-teal-500" size={20} />
                                Change Password
                            </h2>
                            <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        
                        {passwordError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">{passwordError}</div>}
                        {passwordSuccess && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-sm">{passwordSuccess}</div>}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Current Password</label>
                                <input
                                    required
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
                                <input
                                    required
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Confirm New Password</label>
                                <input
                                    required
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:border-teal-500 outline-none"
                                />
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2FA Modal */}
            {show2FAModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-100 flex items-center">
                                <QrCode className="mr-2 text-teal-500" size={20} />
                                Setup 2FA
                            </h2>
                            <button onClick={() => setShow2FAModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        {twoFactorError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">{twoFactorError}</div>}
                        {twoFactorSuccess && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-sm">{twoFactorSuccess}</div>}

                        {!twoFactorSuccess && (
                            <div className="space-y-6 text-center">
                                <div className="flex justify-center">
                                    <div className="bg-white p-4 rounded-lg">
                                        <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400">
                                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.) and enter the code below.
                                </p>
                                <form onSubmit={verify2FA} className="space-y-4">
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        value={twoFactorCode}
                                        onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-center text-xl font-mono text-slate-100 focus:border-teal-500 outline-none tracking-widest"
                                    />
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Verify & Enable
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
