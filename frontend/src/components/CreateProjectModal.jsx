import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/users/members');
      setMembers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/projects', {
        title,
        description,
        members: selectedMembers
      });
      if (res.data.success) {
        toast.success('Project created successfully!');
        onProjectCreated();
        onClose();
        setTitle('');
        setDescription('');
        setSelectedMembers([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (id) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-[32px] w-full max-w-lg relative z-10 shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900">Create New Project</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Project Title</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter project name..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-black focus:ring-1 focus:ring-black font-bold text-black outline-none transition-all"
              />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Description</label>
            <textarea 
              required
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-black focus:ring-1 focus:ring-black font-bold text-black resize-none outline-none transition-all"
            ></textarea>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Assign Members</label>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
              {members.map(member => (
                <div 
                  key={member._id}
                  onClick={() => toggleMember(member._id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedMembers.includes(member._id) 
                      ? 'border-black bg-black text-white shadow-lg' 
                      : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${selectedMembers.includes(member._id) ? 'bg-white text-black' : 'bg-white text-slate-500'}`}>
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${selectedMembers.includes(member._id) ? 'text-white' : 'text-slate-800'}`}>{member.name}</p>
                      <p className={`text-[10px] ${selectedMembers.includes(member._id) ? 'text-slate-300' : 'text-slate-400'}`}>{member.email}</p>
                    </div>
                  </div>
                  {selectedMembers.includes(member._id) && (
                    <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                      <Check size={12} className="text-black" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white font-black rounded-2xl shadow-xl shadow-black/10 hover:opacity-80 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
