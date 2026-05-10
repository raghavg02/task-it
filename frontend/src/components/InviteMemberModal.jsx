import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, Check } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const InviteMemberModal = ({ isOpen, onClose, currentMembers, onMembersAdded, projectId }) => {
    const [allMembers, setAllMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
            setSelectedMembers([]);
        }
    }, [isOpen]);

    const fetchMembers = async () => {
        try {
            const res = await api.get('/users/members');
            // Filter out members who are already in the project
            const currentIds = currentMembers.map(m => m._id);
            const available = res.data.data.filter(m => !currentIds.includes(m._id) && m.role !== 'admin');
            setAllMembers(available);
        } catch (err) {
            toast.error('Failed to fetch members');
        }
    };

    const toggleMember = (id) => {
        setSelectedMembers(prev => 
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    const handleInvite = async () => {
        if (selectedMembers.length === 0) return;
        setLoading(true);
        try {
            const res = await api.patch(`/projects/${projectId}/members`, { members: selectedMembers });
            if (res.data.success) {
                toast.success('Members added successfully!');
                onMembersAdded(res.data.data.members);
                onClose();
            }
        } catch (err) {
            toast.error('Failed to add members');
        } finally {
            setLoading(false);
        }
    };

    const filtered = allMembers.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-[32px] w-full max-w-md relative z-10 shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-black text-slate-900">Add Team Members</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search members..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-violet-500/20 outline-none"
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto scrollbar-hide space-y-2">
                        {filtered.length > 0 ? (
                            filtered.map(member => (
                                <div 
                                    key={member._id}
                                    onClick={() => toggleMember(member._id)}
                                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                                        selectedMembers.includes(member._id) ? 'bg-violet-50 border-violet-100' : 'bg-white border-slate-50 hover:bg-slate-50'
                                    } border`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-500">
                                            {member.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-black text-slate-800">{member.name}</p>
                                            <p className="text-[11px] font-medium text-slate-400">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                        selectedMembers.includes(member._id) ? 'bg-violet-600 text-white' : 'bg-slate-50 text-slate-200'
                                    }`}>
                                        <Check size={14} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-400 text-sm font-medium italic">No available members found.</p>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleInvite}
                        disabled={loading || selectedMembers.length === 0}
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : `Add ${selectedMembers.length} Member${selectedMembers.length !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteMemberModal;
