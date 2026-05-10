import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
   Plus,
   Users,
   Clock,
   CheckCircle2,
   ArrowLeft,
   MoreVertical,
   Flag,
   Calendar,
   Activity,
   LayoutGrid,
   FolderKanban
} from 'lucide-react';
import api from '../services/api';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailsDrawer from '../components/TaskDetailsDrawer';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const ProjectDetails = () => {
   const { user } = useAuth();
   const { id } = useParams();
   const navigate = useNavigate();
   const [project, setProject] = useState(null);
   const [tasks, setTasks] = useState([]);
   const [loading, setLoading] = useState(true);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [selectedTask, setSelectedTask] = useState(null);
   const [activeMenu, setActiveMenu] = useState(false);
   const [quickAddStatus, setQuickAddStatus] = useState(null);

   const fetchProjectDetails = async () => {
      try {
         const [projRes, tasksRes] = await Promise.all([
            api.get(`/projects/${id}`),
            api.get(`/tasks/project/${id}`)
         ]);
         if (projRes.data.success) setProject(projRes.data.data);
         if (tasksRes.data.success) setTasks(tasksRes.data.data);
      } catch (err) {
         console.error(err);
         toast.error('Failed to load project details');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchProjectDetails();
   }, [id]);

   const handleTaskDelete = async (taskId) => {
      try {
         const res = await api.delete(`/tasks/${taskId}`);
         if (res.data.success) {
            toast.success('Task deleted successfully');
            setSelectedTask(null);
            fetchProjectDetails();
         }
      } catch (err) {
         toast.error('Failed to delete task');
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
         </div>
      );
   }

   return (
      <div className="space-y-6 pb-20 overflow-x-hidden pt-2">
         {/* Navigation Header */}
         <div className="flex items-center justify-between animate-reveal-premium px-1 pr-12 relative z-50">
            <button
               onClick={() => navigate(-1)}
               className="flex items-center gap-2 text-[#989898] hover:text-[#030303] font-bold text-xs transition-all group"
            >
               <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Projects
            </button>
            <div className="relative">
               <button
                  onClick={() => setActiveMenu(!activeMenu)}
                  className="glass-premium p-2.5 rounded-full border-white/60 text-[#989898] hover:text-[#030303] transition-all"
               >
                  <MoreVertical size={16} />
               </button>

               {activeMenu && (
                  <>
                     <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(false)}></div>
                     <div className="absolute right-0 mt-2 w-48 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-50 z-50 overflow-hidden py-1">
                        <button className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-black flex items-center gap-2">
                           <Plus size={14} /> Add Team Member
                        </button>
                        <button className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-black flex items-center gap-2">
                           <LayoutGrid size={14} /> Project Settings
                        </button>
                        <div className="h-px bg-slate-50 my-1"></div>
                        <button className="w-full text-left px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2">
                           Archive Project
                        </button>
                     </div>
                  </>
               )}
            </div>
         </div>

         {/* Project Hero Section */}
         <div className="animate-reveal-premium delay-100 pr-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 bg-[#F5601A] rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <FolderKanban size={20} />
                     </div>
                     <h1 className="text-3xl font-extrabold text-[#030303] tracking-tight-custom font-heading">{project?.title}</h1>
                  </div>
                  <p className="text-[#989898] font-medium text-[14px] leading-relaxed ml-1">{project?.description || 'No description provided'}</p>
               </div>

               <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 mr-4">
                     {project?.members?.slice(0, 4).map((m, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-white/60 flex items-center justify-center text-[10px] font-bold text-[#030303] shadow-sm overflow-hidden" title={m.name}>
                           {m.name?.charAt(0).toUpperCase()}
                        </div>
                     ))}
                     {project?.members?.length > 4 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-black flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                           +{project.members.length - 4}
                        </div>
                     )}
                  </div>
                  <button
                     onClick={() => setIsModalOpen(true)}
                     className="btn-premium-orange flex items-center gap-2.5 px-6 py-2.5 text-[13px]"
                  >
                     <Plus size={18} strokeWidth={2.5} />
                     <span className="font-bold tracking-tight">Add Task</span>
                  </button>
               </div>
            </div>
         </div>

         {/* Stats Summary */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-reveal-premium delay-200">
            {[
               { label: 'Total Tasks', value: tasks.length, icon: LayoutGrid, color: 'text-blue-500' },
               { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, icon: CheckCircle2, color: 'text-green-500' },
               { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, icon: Clock, color: 'text-orange-500' },
               { label: 'Velocity', value: '88%', icon: Activity, color: 'text-purple-500' }
            ].map((stat, i) => (
               <div key={i} className="glass-premium p-4 rounded-[24px] border-white/60 group">
                  <div className="flex items-center justify-between mb-1.5">
                     <stat.icon size={14} className={stat.color} />
                     <span className="text-[8px] font-black text-[#989898] uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <p className="text-xl font-extrabold text-[#030303] group-hover:text-[#F5601A] transition-colors font-heading">{stat.value}</p>
               </div>
            ))}
         </div>

         <div className="w-full h-px bg-white/20 animate-reveal-premium delay-300"></div>

         {/* Kanban Board */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-reveal-premium delay-400">
            {['todo', 'in-progress', 'review', 'completed'].map((status) => (
               <div key={status} className="flex flex-col h-full space-y-3">
                  <div className="flex items-center justify-between px-3 py-2 glass-premium rounded-2xl border-white/60">
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status === 'completed' ? 'bg-green-500' : status === 'in-progress' ? 'bg-orange-500' : status === 'review' ? 'bg-blue-500' : 'bg-[#989898]'}`}></div>
                        <span className="text-[11px] font-black text-[#030303] uppercase tracking-widest font-heading">{status.replace('-', ' ')}</span>
                     </div>
                     <span className="text-[10px] font-bold text-[#989898] bg-white/40 px-2.5 py-0.5 rounded-full">{tasks.filter(t => t.status === status).length}</span>
                  </div>

                  <div className="flex-1 space-y-3 min-h-[300px]">
                     {tasks.filter(t => t.status === status).map(task => (
                        <TaskCard
                           key={task._id}
                           task={task}
                           onClick={() => setSelectedTask(task)}
                        />
                     ))}

                     {tasks.filter(t => t.status === status).length === 0 && (
                        <div className="glass-premium rounded-[24px] h-[100px] border-white/40 border-dashed flex items-center justify-center text-[#989898] opacity-50">
                           <p className="text-[9px] font-bold uppercase tracking-widest">No tasks</p>
                        </div>
                     )}
                  </div>
               </div>
            ))}
         </div>

         <CreateTaskModal
            isOpen={isModalOpen}
            onClose={() => {
               setIsModalOpen(false);
               setQuickAddStatus(null);
            }}
            projectId={id}
            initialStatus={quickAddStatus}
            onTaskCreated={fetchProjectDetails}
         />
         <TaskDetailsDrawer
            task={selectedTask}
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={fetchProjectDetails}
            onDelete={handleTaskDelete}
         />
      </div>
   );
};

export default ProjectDetails;
