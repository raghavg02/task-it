import React from 'react';
import { Calendar, Paperclip, MessageSquare, ListTodo, Flag, MoreVertical } from 'lucide-react';

const TaskCard = ({ task, onClick }) => {
  const isCompleted = task.status === 'completed';
  
  // Dynamic colors for priority
  const priorityStyles = {
    high: { bg: 'bg-red-500/10', text: 'text-red-600', dot: 'bg-red-600' },
    medium: { bg: 'bg-orange-500/10', text: 'text-[#F5601A]', dot: 'bg-[#F5601A]' },
    low: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-600' }
  };

  const style = priorityStyles[task.priority] || priorityStyles.low;

  return (
    <div 
      onClick={() => onClick?.(task)}
      className="glass-premium rounded-[24px] p-4 space-y-3 group cursor-pointer border-white/60 hover:border-[#F5601A]/30 transition-all hover:translate-y-[-2px] hover:shadow-xl shadow-orange-500/5"
    >
      {/* Priority Badge & Options */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 ${style.bg} ${style.text} rounded-full border border-white/40`}>
           <div className={`w-1 h-1 rounded-full ${style.dot} animate-pulse`}></div>
           <span className="text-[9px] font-black uppercase tracking-widest font-heading">{task.priority}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-orange-500'} opacity-40`}></div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(task);
            }}
            className="text-[#989898] group-hover:text-[#030303] transition-all p-1"
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>
      
      {/* Title & Subtitle */}
      <div>
        <h4 className="text-[14px] font-extrabold text-[#030303] tracking-tight-custom leading-tight mb-1 font-heading truncate group-hover:text-[#F5601A] transition-colors">{task.title}</h4>
        <p className="text-[10px] font-medium text-[#989898] line-clamp-1 leading-relaxed">
          {task.description || 'No detailed description provided...'}
        </p>
      </div>
      
      {/* Due Date Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/60 rounded-full border border-white/80 shadow-sm group-hover:bg-[#030303] group-hover:text-white transition-all">
        <Calendar size={11} className="group-hover:text-white" />
        <span className="text-[10px] font-black uppercase tracking-tight">
          {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Deadline'}
        </span>
      </div>
      
      {/* Footer */}
      <div className="flex justify-between items-center pt-2.5 border-t border-white/20">
        <div className="flex items-center gap-2">
           {task.assignedTo && (
              <div className="w-6 h-6 rounded-lg bg-[#030303] flex items-center justify-center text-[8px] font-black text-white shadow-md overflow-hidden ring-2 ring-white">
                 {(task.assignedTo.name || (typeof task.assignedTo === 'string' ? task.assignedTo : 'U'))?.charAt(0).toUpperCase()}
              </div>
           )}
           <span className="text-[9px] font-black text-[#030303] uppercase tracking-widest font-heading opacity-40">Assigned</span>
        </div>
        <div className="flex items-center gap-3 text-[#989898]">
           <div className="flex items-center gap-1 group/icon">
              <MessageSquare size={11} className="group-hover/icon:text-[#F5601A] transition-colors" />
              <span className="text-[9px] font-black">4</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
