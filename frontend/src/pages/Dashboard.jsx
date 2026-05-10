import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Users, 
  MoreVertical,
  Activity,
  FolderKanban,
  CheckCircle2,
  Calendar,
  Settings,
  LogOut,
  Clock,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CreateProjectModal from '../components/CreateProjectModal';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskCard from '../components/TaskCard';
import TaskDetailsDrawer from '../components/TaskDetailsDrawer';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Projects');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/member';
      const response = await api.get(endpoint);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const { stats, activeProjects, recentTasks, activities } = data || {};

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Projects':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeProjects?.length > 0 ? (
              activeProjects.slice(0, 8).map(proj => (
                <div 
                  key={proj._id} 
                  onClick={() => navigate(`/projects/${proj._id}`)}
                  className="glass-premium rounded-[24px] p-4 h-[145px] flex flex-col justify-between group cursor-pointer border-white/60"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center text-[#989898] group-hover:bg-[#F5601A] group-hover:text-white transition-all shadow-sm">
                        <FolderKanban size={16} />
                      </div>
                      <div className="relative">
                         <button 
                            onClick={(e) => {
                               e.stopPropagation();
                               setActiveMenuId(activeMenuId === proj._id ? null : proj._id);
                            }}
                            className={`transition-all ${activeMenuId === proj._id ? 'text-[#030303]' : 'text-[#989898] hover:text-[#030303]'}`}
                         >
                            <MoreVertical size={14} />
                         </button>
                      </div>
                    </div>
                    <h3 className="text-[14px] font-extrabold text-[#030303] truncate font-heading">{proj.title}</h3>
                    <p className="text-[#989898] font-medium text-[10px] line-clamp-1 mt-0.5">{proj.description || 'No description'}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-[#989898] uppercase tracking-widest">{proj.taskStats?.progress || 0}% Done</span>
                    </div>
                    <div className="w-full h-1 bg-white/40 rounded-full overflow-hidden">
                       <div 
                          className="h-full bg-[#F5601A] rounded-full transition-all duration-700"
                          style={{ width: `${proj.taskStats?.progress || 0}%` }}
                       ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="lg:col-span-4 glass-premium rounded-[24px] h-[140px] border-white/60 flex flex-col items-center justify-center text-[#989898] gap-2">
                 <FolderKanban size={24} />
                 <p className="text-[10px] font-bold uppercase tracking-widest">No Projects Found</p>
              </div>
            )}
          </div>
        );
      case 'Tasks':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentTasks?.length > 0 ? (
              recentTasks.slice(0, 6).map(task => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onClick={() => setSelectedTask(task)} 
                />
              ))
            ) : (
              <div className="col-span-full bg-white/40 rounded-[24px] h-[140px] border border-white/60 flex flex-col items-center justify-center text-[#989898] gap-2">
                 <CheckCircle2 size={24} />
                 <p className="text-[10px] font-bold uppercase tracking-widest">No Recent Tasks</p>
              </div>
            )}
          </div>
        );
      case 'Activity':
        return (
          <div className="bg-white rounded-3xl p-8 border border-slate-50 shadow-sm">
            <div className="space-y-8">
              {activities?.length > 0 ? (
                activities.map((activity, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (activity.projectId) navigate(`/projects/${activity.projectId}`);
                      else if (activity.taskId) navigate(`/tasks`);
                    }}
                    className="flex gap-4 relative group cursor-pointer"
                  >
                    {i !== activities.length - 1 && <div className="absolute left-4 top-10 bottom-[-32px] w-px bg-slate-100"></div>}
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-all flex-shrink-0 z-10">
                      <Activity size={16} />
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-bold text-black group-hover:text-indigo-600 transition-colors">{activity.message}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
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
    <div className="space-y-8 pb-20 overflow-x-hidden pt-2">
      {/* Greeting Section */}
      <div className="max-w-2xl animate-reveal-premium">
        <h1 className="text-3xl font-extrabold text-[#030303] tracking-tight-custom leading-tight mb-2 font-heading">
           Good morning, <span className="text-[#F5601A]">{user?.name?.split(' ')[0] || 'Kanha'}</span>
        </h1>
        <p className="text-[#989898] font-medium text-[15px] leading-relaxed max-w-lg">
           Manage your projects, track team velocity, and stay ahead of deadlines.
        </p>
      </div>

      {/* Metric Boxes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-reveal-premium delay-100">
        {[
          { label: 'Total Projects', value: stats?.totalProjects || 0 },
          { label: 'Active Tasks', value: (stats?.totalTasks || 0) - (stats?.completedTasks || 0) },
          { label: 'Completed', value: stats?.completedTasks || 0 },
          { label: 'Team Members', value: stats?.totalMembers || 0 }
        ].map((stat, i) => (
          <div key={i} className="glass-premium py-5 rounded-[24px] flex flex-col justify-center px-6 group border-white/60">
             <p className="text-[9px] font-black text-[#989898] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
             <p className="text-xl font-extrabold text-[#030303] group-hover:text-[#F5601A] transition-colors font-heading">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs and Create Buttons */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 animate-reveal-premium delay-200">
         <div className="glass-premium rounded-full px-1.5 py-1.5 flex items-center relative border-white/60">
            <div 
               className="absolute h-[calc(100%-12px)] bg-[#030303] rounded-full transition-all duration-500 ease-out z-0 shadow-lg"
               style={{ 
                  width: '110px',
                  transform: `translateX(${['Projects', 'Tasks', 'Activity'].indexOf(activeTab) * 110}px)`
               }}
            ></div>
            {['Projects', 'Tasks', 'Activity'].map((tab) => (
               <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-[110px] py-2 rounded-full text-[13px] font-bold transition-all relative z-10 ${
                     activeTab === tab ? 'text-white' : 'text-[#989898] hover:text-[#030303]'
                  }`}
               >
                  {tab}
               </button>
            ))}
         </div>

         <div className="flex items-center gap-3">
            <button 
               onClick={() => setIsProjectModalOpen(true)}
               className="btn-premium-orange flex items-center gap-2 px-6 py-2.5 text-[13px]"
            >
               <Plus size={16} strokeWidth={2.5} /> 
               <span className="font-bold tracking-tight">Create Project</span>
            </button>
            <button 
               onClick={() => setIsTaskModalOpen(true)}
               className="btn-premium-orange flex items-center gap-2 px-6 py-2.5 text-[13px]"
            >
               <Plus size={16} strokeWidth={2.5} /> 
               <span className="font-bold tracking-tight">Create Task</span>
            </button>
         </div>
      </div>

      <div className="w-full h-px bg-slate-100 animate-reveal delay-300"></div>

      <div className="animate-reveal-premium delay-300">
         {renderTabContent()}
      </div>

      <CreateProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        onProjectCreated={fetchDashboardData}
      />
      <CreateTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onTaskCreated={fetchDashboardData}
      />
      <TaskDetailsDrawer
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={fetchDashboardData}
        onDelete={async (id) => {
           try {
              await api.delete(`/tasks/${id}`);
              setSelectedTask(null);
              fetchDashboardData();
              toast.success('Task deleted');
           } catch (err) {
              toast.error('Failed to delete');
           }
        }}
      />
    </div>
  );
};

export default Dashboard;
