import React, { useState } from 'react';
import { X, Calendar, User, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const TaskDetailsDrawer = ({ task, isOpen, onClose, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);

    if (!isOpen || !task) return null;

    const handleStatusChange = async (newStatus) => {
        try {
            const res = await api.patch(`/tasks/${task._id}/status`, { status: newStatus });
            if (res.data.success) {
                onUpdate(res.data.data);
                toast.success(`Status updated to ${newStatus}`);
            }
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handlePriorityChange = async (newPriority) => {
        try {
            const res = await api.put(`/tasks/${task._id}`, { priority: newPriority });
            if (res.data.success) {
                onUpdate(res.data.data);
                toast.success(`Priority updated to ${newPriority}`);
            }
        } catch (err) {
            toast.error('Failed to update priority');
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className={`relative w-full max-w-lg bg-white h-full shadow-2xl transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                task.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 
                                task.status === 'in-progress' ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400'
                            }`}>
                                {task.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => onDelete(task._id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 size={20} />
                            </button>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-slate-900 leading-tight">{task.title}</h2>
                            <p className="text-slate-500 font-medium leading-relaxed">{task.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <User size={12} /> Assignee
                                </label>
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
                                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 font-black text-[12px]">
                                        {task.assignedTo?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{task.assignedTo?.name}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={12} /> Deadline
                                </label>
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
                                    <span className="text-sm font-bold text-slate-700">
                                        {new Date(task.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Update Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {['todo', 'in-progress', 'review', 'completed'].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => handleStatusChange(s)}
                                            className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                                task.status === s 
                                                ? 'bg-slate-900 text-white shadow-lg' 
                                                : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Priority Level</label>
                                <div className="flex gap-2">
                                    {['low', 'medium', 'high'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => handlePriorityChange(p)}
                                            className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                                task.priority === p 
                                                ? 'bg-slate-900 text-white shadow-lg' 
                                                : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailsDrawer;
