import React, { useState } from 'react';
import { CheckSquare, Lock, KeyRound, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ForcePasswordChangeModal = ({ isOpen }) => {
    const { user, setUser } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            return toast.error("New passwords don't match");
        }

        if (newPassword.length < 8) {
            return toast.error("Password must be at least 8 characters");
        }

        setLoading(true);
        try {
            const res = await api.patch('/users/change-password', {
                currentPassword,
                newPassword
            });

            if (res.data.success) {
                toast.success("Security updated successfully!");
                // Update local user state to remove the barrier
                const updatedUser = { ...user, needsPasswordChange: false };
                setUser(updatedUser);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-xl"></div>
            
            <div className="glass-premium rounded-[38px] w-full max-w-md relative z-10 overflow-hidden animate-reveal-premium border-white/60 p-1">
                <div className="px-8 pt-10 pb-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#F5601A] to-[#ff8a4c] rounded-[24px] flex items-center justify-center mx-auto mb-6 text-white shadow-2xl shadow-orange-500/20 animate-float">
                        <CheckSquare size={32} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#030303] tracking-tight-custom mb-3 font-heading">Secure Workspace</h2>
                    <p className="text-[#989898] font-medium px-4 text-[13px] leading-relaxed">
                        Please update your credentials to continue.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-[#989898] uppercase tracking-[0.2em] ml-5">Default Password</label>
                        <div className="relative group">
                            <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-[#989898] group-focus-within:text-[#F5601A] transition-colors" size={16} />
                            <input 
                                required
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter TaskIt123!"
                                className="w-full px-14 py-4 rounded-[20px] bg-white/50 border border-white/40 font-bold text-[#030303] focus:ring-4 focus:ring-orange-500/10 focus:border-[#F5601A]/30 transition-all placeholder:text-[#989898]/40 text-[13px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-[#989898] uppercase tracking-[0.2em] ml-5">New Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#989898] group-focus-within:text-[#F5601A] transition-colors" size={16} />
                            <input 
                                required
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 8 characters"
                                className="w-full px-14 py-4 rounded-[20px] bg-white/50 border border-white/40 font-bold text-[#030303] focus:ring-4 focus:ring-orange-500/10 focus:border-[#F5601A]/30 transition-all placeholder:text-[#989898]/40 text-[13px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-[#989898] uppercase tracking-[0.2em] ml-5">Confirm Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#989898] group-focus-within:text-[#F5601A] transition-colors" size={16} />
                            <input 
                                required
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat new password"
                                className="w-full px-14 py-4 rounded-[20px] bg-white/50 border border-white/40 font-bold text-[#030303] focus:ring-4 focus:ring-orange-500/10 focus:border-[#F5601A]/30 transition-all placeholder:text-[#989898]/40 text-[13px]"
                            />
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
                            <>Update & Access <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForcePasswordChangeModal;
