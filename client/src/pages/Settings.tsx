import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Shield, Key } from 'lucide-react';

const Settings = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
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
                            <p className="text-sm text-slate-500">Secure your account with 2FA.</p>
                        </div>
                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700">
                            {user?.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                        </button>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                        <div>
                            <h4 className="text-slate-200 font-medium">Change Password</h4>
                            <p className="text-sm text-slate-500">Update your password periodically.</p>
                        </div>
                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700">
                            Update Password
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center pt-8 text-xs text-slate-600">
                ExpressDeal CRM v1.0.0
            </div>
        </div>
    );
};

export default Settings;
