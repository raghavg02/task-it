import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Flag, User, Briefcase } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, initialProjectId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(initialProjectId || '');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  
  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (projectId) {
      const selectedProject = projects.find(p => p._id === projectId);
      if (selectedProject) {
        setProjectMembers(selectedProject.members || []);
      } else {
        // Fetch project members if not in projects list
        fetchProjectDetails(projectId);
      }
    } else {
      setProjectMembers([]);
    }
  }, [projectId, projects]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjectDetails = async (id) => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProjectMembers(res.data.data.members || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/tasks', {
        title,
        description,
        project: projectId,
        assignedTo,
        priority,
        deadline
      });
      if (res.data.success) {
        toast.success('Task created successfully!');
        onTaskCreated();
        onClose();
        resetForm();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setProjectId(initialProjectId || '');
    setAssignedTo('');
    setPriority('medium');
    setDeadline('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-[32px] w-full max-w-xl relative z-10 shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-black text-slate-900">Create New Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Task Title</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-black focus:ring-1 focus:ring-black font-bold text-black outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Description</label>
              <textarea 
                required
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add some details..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-black focus:ring-1 focus:ring-black font-bold text-black resize-none outline-none transition-all"
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                <Briefcase size={12} /> Project
              </label>
              <select 
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-black focus:ring-1 focus:ring-black font-bold text-black appearance-none cursor-pointer outline-none transition-all"
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                <User size={12} /> Assign To
              </label>
              <select 
                required
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={!projectId}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-black focus:ring-1 focus:ring-black font-bold text-black appearance-none cursor-pointer disabled:opacity-50 outline-none transition-all"
              >
                <option value="">Select Member</option>
                {projectMembers.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                <Flag size={12} /> Priority
              </label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      priority === p 
                        ? 'bg-black text-white shadow-lg shadow-black/10'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                <CalendarIcon size={12} /> Deadline
              </label>
              <input 
                required
                type="date" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 focus:border-black focus:ring-1 focus:ring-black font-bold text-black cursor-pointer outline-none transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white font-black rounded-2xl shadow-xl shadow-black/10 hover:opacity-80 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
