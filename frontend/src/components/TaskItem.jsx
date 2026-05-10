import React from 'react';
import { CheckCircle2, Calendar, MoreVertical } from 'lucide-react';

const TaskItem = ({ task, onStatusToggle }) => {
  const isCompleted = task.status === 'completed';

  return (
    <div className="group flex items-center justify-between p-6 rounded-[32px] bg-white border border-slate-50 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-500 cursor-pointer">
      <div className="flex items-center gap-6 flex-1">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onStatusToggle?.(task);
          }}
          className={`w-12 h-12 rounded-[14px] flex items-center justify-center transition-all ${
            isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          <CheckCircle2 size={20} strokeWidth={3} />
        </button>
        <div>
          <h4 className={`text-[17px] font-[900] transition-colors tracking-tight ${
            isCompleted ? 'text-slate-300 line-through' : 'text-slate-900 group-hover:text-indigo-600'
          }`}>
            {task.title}
          </h4>
          <div className="flex items-center gap-4 mt-1.5">
            <span className="text-[11px] font-[800] text-slate-400 uppercase tracking-widest">
              {task.project?.title || 'Personal'}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-[800] text-slate-400">
              <Calendar size={12} strokeWidth={2.5} />
              {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Date'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <span className={`px-5 py-2 rounded-full text-[10px] font-[900] uppercase tracking-widest shadow-sm ${
          task.priority === 'high' ? 'bg-rose-500 text-white shadow-rose-200' : 
          task.priority === 'medium' ? 'bg-amber-400 text-white shadow-amber-200' : 'bg-sky-500 text-white shadow-sky-200'
        }`}>
          {task.priority}
        </span>
        <button className="text-slate-200 hover:text-slate-500 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
