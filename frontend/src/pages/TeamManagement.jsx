import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical, 
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import AddMemberModal from '../components/AddMemberModal';

const TeamManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const fetchTeam = async () => {
    try {
      const response = await api.get('/users/members');
      if (response.data.success) {
        setMembers(response.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden pt-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-reveal-premium">
        <div>
          <h1 className="text-3xl font-extrabold text-[#030303] tracking-tight-custom font-heading">Team Management</h1>
          <p className="text-[#989898] font-medium text-[14px] mt-1">Manage your team members, roles, and permissions.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn-premium-orange flex items-center gap-2.5 px-6 py-2.5 text-[13px]"
        >
          <UserPlus size={18} strokeWidth={2.5} /> 
          <span className="font-bold tracking-tight">Invite Member</span>
        </button>
      </div>

      {/* Search & Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-reveal-premium delay-100">
         <div className="lg:col-span-2 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 glass-premium rounded-full px-5 py-2.5 flex items-center border-white/60 relative w-full group focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
               <Search size={16} className="text-[#989898] group-focus-within:text-[#F5601A] transition-colors" />
               <input 
                  type="text" 
                  placeholder="Search members..." 
                  className="w-full bg-transparent border-none outline-none text-[13px] font-medium pl-3 placeholder:text-[#989898] text-[#030303]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <button className="glass-premium p-2.5 rounded-full border-white/60 text-[#989898] hover:text-[#030303] transition-all">
               <Filter size={16} />
            </button>
         </div>
         <div className="glass-premium rounded-full px-6 py-2.5 flex items-center justify-between border-white/60">
            <div className="flex items-center gap-2.5">
               <div className="w-7 h-7 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={14} />
               </div>
               <span className="text-[11px] font-black text-[#030303] uppercase tracking-widest font-heading">{members.length} Members</span>
            </div>
            <div className="h-4 w-px bg-white/20"></div>
            <div className="flex items-center gap-2.5">
               <div className="w-7 h-7 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
                  <Shield size={14} />
               </div>
               <span className="text-[11px] font-black text-[#030303] uppercase tracking-widest font-heading">{members.filter(m => m.role === 'admin').length} Admins</span>
            </div>
         </div>
      </div>

      <div className="w-full h-px bg-white/20 animate-reveal-premium delay-200"></div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-reveal-premium delay-300">
        {filteredMembers.map(member => (
          <div key={member._id} className="glass-premium rounded-[24px] p-4 flex flex-col items-center text-center space-y-3 group border-white/60 relative">
            <div className="absolute top-3 right-3">
               <button 
                  onClick={(e) => {
                     e.stopPropagation();
                     setActiveMenuId(activeMenuId === member._id ? null : member._id);
                  }}
                  className={`transition-all ${activeMenuId === member._id ? 'text-[#030303]' : 'text-[#989898] hover:text-[#030303]'}`}
               >
                  <MoreVertical size={14} />
               </button>
            </div>
            
            <div className="relative pt-2">
               <div className="w-14 h-14 rounded-2xl bg-white/50 flex items-center justify-center text-xl font-black text-[#989898] border-2 border-white shadow-sm transition-all group-hover:bg-[#F5601A] group-hover:text-white font-heading">
                  {member.name?.charAt(0).toUpperCase()}
               </div>
               <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${member.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
            </div>

            <div className="space-y-0.5">
               <h3 className="text-[14px] font-extrabold text-[#030303] font-heading">{member.name}</h3>
               <p className="text-[9px] font-black text-[#989898] uppercase tracking-widest">{member.role}</p>
            </div>

            <div className="w-full pt-2.5 border-t border-white/20 flex items-center justify-center gap-2">
               <Mail size={12} className="text-[#989898]" />
               <span className="text-[10px] font-medium text-[#989898] truncate max-w-[120px]">{member.email}</span>
            </div>
            

          </div>
        ))}
      </div>
      <AddMemberModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onMemberAdded={fetchTeam}
      />
    </div>
  );
};

export default TeamManagement;
