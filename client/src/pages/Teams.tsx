import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, Plus, Copy, Trash2, Crown, Shield, User, Link2, UserPlus, LogOut, Check } from 'lucide-react';
import axios from 'axios';

interface TeamMember {
    id: number;
    userId: number;
    role: 'owner' | 'admin' | 'member';
    user: { email: string };
    joinedAt: string;
}

interface TeamCode {
    id: number;
    code: string;
    expiresAt: string | null;
    maxUses: number | null;
    usedCount: number;
    isActive: boolean;
}

interface Team {
    id: number;
    name: string;
    createdAt: string;
    members: TeamMember[];
    codes: TeamCode[];
}

const Teams = () => {
    const { user } = useAuth();
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    
    const [createError, setCreateError] = useState('');
    const [joinError, setJoinError] = useState('');

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/teams/my-team');
            setTeam(res.data);
        } catch (err: any) {
            if (err.response?.status !== 404) {
                setError('Failed to load team information');
            }
            setTeam(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError('');
        try {
            await axios.post('/api/teams', { name: teamName });
            setShowCreateModal(false);
            setTeamName('');
            fetchTeam();
        } catch (err: any) {
            setCreateError(err.response?.data?.message || err.response?.data?.error || 'Failed to create team');
        }
    };

    const handleJoinTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setJoinError('');
        try {
            await axios.post('/api/teams/join', { code: joinCode });
            setShowJoinModal(false);
            setJoinCode('');
            fetchTeam();
        } catch (err: any) {
            setJoinError(err.response?.data?.message || err.response?.data?.error || 'Failed to join team');
        }
    };

    const handleGenerateCode = async () => {
        if (!team) return;
        try {
            await axios.post(`/api/teams/${team.id}/codes`, {
                expiresInDays: 7,
                maxUses: 10
            });
            fetchTeam();
        } catch (err) {
            console.error('Failed to generate code');
        }
    };

    const handleDeactivateCode = async (codeId: number) => {
        if (!team) return;
        try {
            await axios.delete(`/api/teams/${team.id}/codes/${codeId}`);
            fetchTeam();
        } catch (err) {
            console.error('Failed to deactivate code');
        }
    };

    const handleUpdateRole = async (memberId: number, newRole: 'admin' | 'member') => {
        if (!team) return;
        try {
            await axios.put(`/api/teams/${team.id}/members/${memberId}/role`, { role: newRole });
            fetchTeam();
        } catch (err) {
            console.error('Failed to update role');
        }
    };

    const handleRemoveMember = async (memberId: number) => {
        if (!team) return;
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            await axios.delete(`/api/teams/${team.id}/members/${memberId}`);
            fetchTeam();
        } catch (err) {
            console.error('Failed to remove member');
        }
    };

    const handleLeaveTeam = async () => {
        if (!team) return;
        if (!confirm('Are you sure you want to leave this team?')) return;
        try {
            await axios.delete(`/api/teams/${team.id}/members`);
            fetchTeam();
        } catch (err) {
            console.error('Failed to leave team');
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner': return <Crown className="text-amber-500" size={16} />;
            case 'admin': return <Shield className="text-teal-500" size={16} />;
            default: return <User className="text-slate-400" size={16} />;
        }
    };

    const currentMember = team?.members.find(m => m.userId === user?.id);
    const isOwnerOrAdmin = currentMember?.role === 'owner' || currentMember?.role === 'admin';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Team Management</h1>
                    <p className="text-slate-400">Collaborate with your team members.</p>
                </div>
                {!team && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                        >
                            <UserPlus size={18} />
                            Join Team
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition"
                        >
                            <Plus size={18} />
                            Create Team
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {!team ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
                    <Users className="mx-auto text-slate-600 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-slate-200 mb-2">No Team Yet</h3>
                    <p className="text-slate-400 mb-6">Create a new team or join an existing one using an invite code.</p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                        >
                            <UserPlus size={18} />
                            Join with Code
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition"
                        >
                            <Plus size={18} />
                            Create Team
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                    <Users className="text-teal-500" size={20} />
                                    {team.name}
                                </h3>
                                <p className="text-sm text-slate-400">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</p>
                            </div>
                            {currentMember?.role !== 'owner' && (
                                <button
                                    onClick={handleLeaveTeam}
                                    className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-900/30 rounded-lg transition"
                                >
                                    <LogOut size={16} />
                                    Leave Team
                                </button>
                            )}
                        </div>
                        <div className="divide-y divide-slate-800">
                            {team.members.map(member => (
                                <div key={member.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getRoleIcon(member.role)}
                                        <div>
                                            <p className="text-slate-200">{member.user.email}</p>
                                            <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                                        </div>
                                    </div>
                                    {isOwnerOrAdmin && member.role !== 'owner' && member.userId !== user?.id && (
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleUpdateRole(member.id, e.target.value as 'admin' | 'member')}
                                                className="bg-slate-800 text-slate-200 text-sm px-2 py-1 rounded border border-slate-700"
                                            >
                                                <option value="member">Member</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <button
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="p-1 text-red-400 hover:bg-red-900/30 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {isOwnerOrAdmin && (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                        <Link2 className="text-teal-500" size={20} />
                                        Invite Codes
                                    </h3>
                                    <p className="text-sm text-slate-400">Share these codes with people you want to invite.</p>
                                </div>
                                <button
                                    onClick={handleGenerateCode}
                                    className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition text-sm"
                                >
                                    <Plus size={16} />
                                    Generate Code
                                </button>
                            </div>
                            <div className="divide-y divide-slate-800">
                                {team.codes.filter(c => c.isActive).length === 0 ? (
                                    <div className="p-6 text-center text-slate-500">
                                        No active invite codes. Generate one to invite team members.
                                    </div>
                                ) : (
                                    team.codes.filter(c => c.isActive).map(code => (
                                        <div key={code.id} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <code className="bg-slate-800 px-3 py-1 rounded font-mono text-teal-400">
                                                    {code.code}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(code.code)}
                                                    className="p-1 text-slate-400 hover:text-teal-400 transition"
                                                >
                                                    {copiedCode === code.code ? <Check size={16} /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                                <span>Used: {code.usedCount}{code.maxUses ? `/${code.maxUses}` : ''}</span>
                                                {code.expiresAt && (
                                                    <span>Expires: {new Date(code.expiresAt).toLocaleDateString()}</span>
                                                )}
                                                <button
                                                    onClick={() => handleDeactivateCode(code.id)}
                                                    className="p-1 text-red-400 hover:bg-red-900/30 rounded"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-slate-100 mb-4">Create a Team</h3>
                        <form onSubmit={handleCreateTeam}>
                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="Team name"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 mb-4"
                                required
                            />
                            {createError && <p className="text-red-400 text-sm mb-4">{createError}</p>}
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg"
                                >
                                    Create Team
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showJoinModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-slate-100 mb-4">Join a Team</h3>
                        <form onSubmit={handleJoinTeam}>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="Enter invite code"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 mb-4 font-mono uppercase"
                                required
                            />
                            {joinError && <p className="text-red-400 text-sm mb-4">{joinError}</p>}
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowJoinModal(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg"
                                >
                                    Join Team
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teams;
