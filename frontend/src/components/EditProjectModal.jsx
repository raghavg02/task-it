import React, { useState, useEffect } from 'react';
import { X, FolderKanban, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const EditProjectModal = ({ isOpen, onClose, project, onProjectUpdated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (project) {
            setTitle(project.title);
            setDescription(project.description);
        }
    }, [project, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put(`/projects/${project._id}`, { title, description });
            if (res.data.success) {
                toast.success('Project updated successfully!');
                onProjectUpdated(res.data.data);
                onClose();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update project');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-[32px] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden animate-fade-in-up">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">Edit Project Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Project Title</label>
                        <input 
                            required
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 focus:ring-2 focus:ring-violet-500/20 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                        <textarea 
                            required
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                        ></textarea>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProjectModal;
