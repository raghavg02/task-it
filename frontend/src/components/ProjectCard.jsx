import React from 'react';
import { Calendar, Paperclip, MessageSquare, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const progress = project.taskStats?.progress || 0;
  const completed = project.taskStats?.completed || 0;
  const total = project.taskStats?.total || 0;

  return (
    <Link to={`/projects/${project._id}`} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group block">
      {/* Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
           <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
        </div>
      </div>
      
      {/* Title & Subtitle */}
      <div className="mb-6">
        <h4 className="text-[18px] font-bold text-slate-900 group-hover:text-black transition-colors leading-tight mb-1">
          {project.title}
        </h4>
        <p className="text-[13px] text-slate-400 font-medium">Workspace Project</p>
      </div>
      
      {/* Progress Section */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-slate-400">
           <div className="flex items-center gap-2">
              <ListTodo size={14} />
              <span className="text-[12px] font-bold">Progress</span>
           </div>
           <span className="text-[12px] font-bold text-slate-900">{completed}/{total}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-slate-900 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Due Date Pill */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full mb-6">
        <Calendar size={14} className="text-slate-900" />
        <span className="text-[12px] font-bold text-slate-900">
          Created: {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      
      {/* Separator */}
      <div className="w-full h-px bg-slate-50 mb-4"></div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <div className="flex -space-x-2">
          {project.members?.slice(0, 3).map((m, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
              {m.name?.charAt(0).toUpperCase()}
            </div>
          ))}
          {project.members?.length > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[9px] font-black text-slate-400">
              +{project.members.length - 3}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-slate-300">
           <div className="flex items-center gap-1.5">
              <Paperclip size={14} />
              <span className="text-[12px] font-bold text-slate-400">0</span>
           </div>
           <div className="flex items-center gap-1.5">
              <MessageSquare size={14} />
              <span className="text-[12px] font-bold text-slate-400">0</span>
           </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
