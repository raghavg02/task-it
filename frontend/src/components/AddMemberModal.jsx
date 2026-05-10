import React, { useState } from 'react';
import { X, Users, Mail, Shield, Lock, Copy, Check, Plus } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AddMemberModal = ({ isOpen, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const copyPassword = () => {
        navigator.clipboard.writeText("TaskIt123!");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Password copied to clipboard!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/users/invite', { name, email, role });
            toast.success("Invitation sent successfully!");
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to invite member");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-xl" onClick={onClose}></div>
            <div className="glass-premium rounded-[38px] w-full max-w-lg relative z-10 overflow-hidden animate-reveal-premium border-white/60 p-1">
                <div className="px-8 py-6 border-b border-white/20 flex items-center justify-between bg-orange-50/20 rounded-t-[36px]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#F5601A] to-[#ff8a4c] rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/10">
                            <Users size={16} />
                        </div>
                        <h2 className="text-xl font-extrabold text-[#030303] font-heading tracking-tight-custom">Add Team Member</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-xl transition-all">
                        <X size={20} className="text-[#989898]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-[#989898] uppercase tracking-[0.2em] ml-5">Full Name</label>
                        <div className="relative group">
                            <input 
                                required
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter member name"
                                className="w-full px-6 py-4 rounded-[20px] bg-white/50 border border-white/40 font-bold text-[#030303] focus:ring-4 focus:ring-orange-500/10 focus:border-[#F5601A]/30 transition-all placeholder:text-[#989898]/40 text-[13px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-[#989898] uppercase tracking-[0.2em] ml-5">Email Address</label>
                        <div className="relative group">
                            <input 
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full px-6 py-4 rounded-[20px] bg-white/50 border border-white/40 font-bold text-[#030303] focus:ring-4 focus:ring-orange-500/10 focus:border-[#F5601A]/30 transition-all placeholder:text-[#989898]/40 text-[13px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-[#989898] uppercase tracking-[0.2em] ml-5">Member Role</label>
                        <div className="flex gap-3">
                            {['member', 'admin'].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    className={`flex-1 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                        role === r 
                                        ? 'bg-[#030303] text-white shadow-lg' 
                                        : 'bg-white/50 text-[#989898] border border-white/40'
                                    }`}
                                >
                                    <Shield size={14} /> {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 space-y-3">
                        <div className="glass-premium rounded-xl p-4 border-orange-500/10 bg-orange-50/10 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#F5601A] shadow-sm">
                                    <Lock size={14} />
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-[#989898] uppercase tracking-widest">Default Password</p>
                                    <p className="text-[13px] font-extrabold text-[#030303] font-heading">TaskIt123!</p>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={copyPassword}
                                className="p-2 bg-white hover:bg-[#F5F5F5] rounded-lg transition-all shadow-sm group-active:scale-95"
                            >
                                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-[#F5601A]" />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-premium-orange w-full py-4 text-[14px] mt-2 disabled:opacity-50 flex items-center justify-center gap-2.5"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>Send Invitation <Plus size={18} strokeWidth={2.5} /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddMemberModal;
