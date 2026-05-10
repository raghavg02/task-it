import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  ChevronRight,
  Camera
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const Settings = () => {
  const { user, setUser } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [profileLoading, setProfileLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.patch('/users/profile', { name, email });
      if (res.data.success) {
        setUser(res.data.data);
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      console.error('Profile update error:', err.response?.data);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      return toast.error('Please fill in all password fields');
    }
    setSecurityLoading(true);
    try {
      const res = await api.patch('/users/change-password', { currentPassword, newPassword });
      if (res.data.success) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      console.error('Password change error:', err.response?.data);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to change password';
      toast.error(msg);
    } finally {
      setSecurityLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden pt-2">
      {/* Header Section */}
      <div className="animate-reveal-premium">
        <h1 className="text-3xl font-extrabold text-[#030303] tracking-tight-custom font-heading">Settings</h1>
        <p className="text-[#989898] font-medium text-[14px] mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar - Navigation Pills */}
        <aside className="w-full lg:w-64 space-y-2 animate-reveal-premium delay-100">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`w-full flex items-center justify-between px-5 py-3 rounded-2xl transition-all ${
                  activeSection === tab.id 
                    ? 'bg-[#030303] text-white shadow-lg' 
                    : 'glass-premium text-[#989898] hover:text-[#030303] border-white/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="text-[13px] font-bold tracking-tight">{tab.label}</span>
                </div>
                <ChevronRight size={14} className={activeSection === tab.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'} transition-all />
              </button>
            );
          })}
        </aside>

        {/* Right Content - Settings Form */}
        <div className="flex-1 animate-reveal-premium delay-200">
          <div className="glass-premium rounded-[32px] p-8 border-white/60 min-h-[400px]">
             {activeSection === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="space-y-8 animate-reveal-premium">
                   <div className="flex items-center gap-6">
                      <div className="relative">
                         <div className="w-20 h-20 rounded-2xl bg-white/60 flex items-center justify-center text-3xl font-black text-[#989898] border-2 border-white shadow-sm font-heading">
                            {user?.name?.charAt(0).toUpperCase()}
                         </div>
                         <button type="button" className="absolute -bottom-1.5 -right-1.5 bg-[#F5601A] text-white p-2 rounded-lg shadow-lg hover:scale-110 transition-all">
                            <Camera size={14} />
                         </button>
                      </div>
                      <div>
                         <h3 className="text-xl font-extrabold text-[#030303] font-heading">{user?.name}</h3>
                         <p className="text-[#989898] font-black text-[9px] uppercase tracking-widest mt-1">{user?.role}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-[#989898] uppercase tracking-widest ml-4">Full Name</label>
                         <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[#989898] group-focus-within:text-[#F5601A] transition-colors" size={16} />
                            <input 
                               type="text" 
                               value={name}
                               onChange={(e) => setName(e.target.value)}
                               className="w-full bg-white/40 border-2 border-white/60 rounded-full py-3 pl-12 pr-6 text-[13px] font-bold focus:ring-4 focus:ring-orange-500/5 focus:border-[#F5601A]/30 outline-none transition-all text-[#030303]"
                            />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-[#989898] uppercase tracking-widest ml-4">Email Address</label>
                         <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#989898] group-focus-within:text-[#F5601A] transition-colors" size={16} />
                            <input 
                               type="email" 
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               className="w-full bg-white/40 border-2 border-white/60 rounded-full py-3 pl-12 pr-6 text-[13px] font-bold focus:ring-4 focus:ring-orange-500/5 focus:border-[#F5601A]/30 outline-none transition-all text-[#030303]"
                            />
                         </div>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-white/20 flex justify-end">
                      <button 
                        type="submit"
                        disabled={profileLoading}
                        className="btn-premium-orange px-8 py-2.5 text-[13px] disabled:opacity-50"
                      >
                         {profileLoading ? 'Updating...' : 'Save Changes'}
                      </button>
                   </div>
                </form>
             )}

             {activeSection === 'security' && (
                <form onSubmit={handleChangePassword} className="space-y-8 animate-reveal-premium">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-[#989898] uppercase tracking-widest ml-4">Current Password</label>
                      <div className="relative group max-w-md">
                         <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#989898]" size={16} />
                         <input 
                            type="password" 
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-white/40 border-2 border-white/60 rounded-full py-3 pl-12 pr-6 text-[13px] font-bold focus:ring-4 focus:ring-orange-500/5 focus:border-[#F5601A]/30 outline-none transition-all text-[#030303]"
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-[#989898] uppercase tracking-widest ml-4">New Password</label>
                      <div className="relative group max-w-md">
                         <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#989898]" size={16} />
                         <input 
                            type="password" 
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-white/40 border-2 border-white/60 rounded-full py-3 pl-12 pr-6 text-[13px] font-bold focus:ring-4 focus:ring-orange-500/5 focus:border-[#F5601A]/30 outline-none transition-all text-[#030303]"
                         />
                      </div>
                   </div>
                   <div className="pt-6 border-t border-white/20 flex justify-end">
                      <button 
                        type="submit"
                        disabled={securityLoading}
                        className="btn-premium-orange px-8 py-2.5 text-[13px] disabled:opacity-50"
                      >
                         {securityLoading ? 'Updating...' : 'Update Password'}
                      </button>
                   </div>
                </form>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
