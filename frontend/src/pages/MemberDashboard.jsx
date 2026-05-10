import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  FolderKanban, 
  Activity,
  MoreVertical,
  LayoutGrid
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import TaskCard from '../components/TaskCard';
import TaskDetailsDrawer from '../components/TaskDetailsDrawer';

const MemberDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tasks');
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/member');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard');
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
      case 'Tasks':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentTasks?.length > 0 ? (
              recentTasks.map(task => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onClick={() => setSelectedTask(task)} 
                />
              ))
            ) : (
              <div className="col-span-full glass-premium rounded-[32px] h-[200px] border-white/60 flex flex-col items-center justify-center text-[#989898] gap-3">
                 <CheckCircle2 size={32} strokeWidth={1.5} />
                 <p className="font-extrabold uppercase tracking-widest text-[10px] font-heading">No pending tasks</p>
              </div>
            )}
          </div>
        );
      case 'Projects':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeProjects?.map(proj => (
              <div 
                key={proj._id} 
                onClick={() => navigate(`/projects/${proj._id}`)}
                className="glass-premium rounded-[24px] p-4 h-[145px] flex flex-col justify-between group cursor-pointer border-white/60"
              >
                <div>
                   <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center text-[#989898] group-hover:bg-[#F5601A] group-hover:text-white transition-all shadow-sm mb-2">
                     <FolderKanban size={16} />
                   </div>
                   <h3 className="text-[14px] font-extrabold text-[#030303] truncate font-heading">{proj.title}</h3>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold text-[#989898] uppercase tracking-widest">{proj.taskStats?.progress}% Done</span>
                  </div>
                  <div className="w-full h-1 bg-white/40 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-[#F5601A] rounded-full transition-all duration-700"
                        style={{ width: `${proj.taskStats?.progress || 0}%` }}
                     ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#030303]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden pt-2">
      {/* Greeting Section */}
      <div className="max-w-xl animate-reveal-premium">
        <h1 className="text-3xl font-extrabold text-[#030303] tracking-tight-custom leading-tight mb-1.5 font-heading">
           Hello, {user?.name?.split(' ')[0] || 'Member'}
        </h1>
        <p className="text-[#989898] font-medium text-[14px] leading-relaxed">
           You have <span className="text-[#030303] font-bold">{stats?.pendingTasks || 0}</span> pending tasks for today.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-reveal-premium delay-100">
        {[
          { label: 'Assigned Projects', value: stats?.assignedProjectsCount || 0 },
          { label: 'Pending Tasks', value: stats?.pendingTasks || 0 },
          { label: 'Completion Rate', value: stats?.totalAssignedTasks > 0 
              ? `${Math.round((stats?.completedTasks / stats?.totalAssignedTasks) * 100)}%` 
              : '0%' 
          }
        ].map((stat, i) => (
          <div key={i} className="glass-premium h-[70px] rounded-[20px] flex flex-col justify-center px-6 border-white/60 group">
             <p className="text-[9px] font-black text-[#989898] uppercase tracking-widest mb-0.5">{stat.label}</p>
             <p className="text-xl font-extrabold text-[#030303] group-hover:text-[#F5601A] transition-colors font-heading">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tab Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-start gap-4 pt-4 animate-reveal-premium delay-200">
         <div className="glass-premium rounded-full px-1.5 py-1.5 flex items-center relative border-white/60">
            {/* Sliding Background */}
            <div 
               className="absolute h-[calc(100%-12px)] bg-[#030303] rounded-full transition-all duration-500 ease-out z-0 shadow-lg"
               style={{ 
                  width: '90px',
                  transform: `translateX(${['Tasks', 'Projects', 'Activity'].indexOf(activeTab) * 90}px)`
               }}
            ></div>
            {['Tasks', 'Projects', 'Activity'].map((tab) => (
               <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-[90px] py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all relative z-10 ${
                     activeTab === tab ? 'text-white' : 'text-[#989898] hover:text-[#030303]'
                  }`}
               >
                  {tab}
               </button>
            ))}
         </div>
      </div>

      <div className="w-full h-px bg-white/20 animate-reveal-premium delay-300"></div>

      <div className="min-h-[300px] animate-reveal-premium delay-400">
        {renderTabContent()}
      </div>
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

export default MemberDashboard;
