import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Filter, 
  MoreVertical,
  Flag,
  Calendar,
  ChevronRight,
  FolderKanban
} from 'lucide-react';
import api from '../services/api';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailsDrawer from '../components/TaskDetailsDrawer';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTaskDelete = async (taskId) => {
    try {
      const res = await api.delete(`/tasks/${taskId}`);
      if (res.data.success) {
        toast.success('Task deleted successfully');
        setSelectedTask(null);
        fetchTasks();
      }
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(t => {
    const matchesStatus = filterStatus === 'all' ? true : t.status === filterStatus;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (t.project?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden pt-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-reveal-premium">
        <div>
          <h1 className="text-3xl font-extrabold text-[#030303] tracking-tight-custom font-heading">Tasks</h1>
          <p className="text-[#989898] font-medium text-[14px] mt-1">Stay focused and track your daily priorities.</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-premium-orange flex items-center gap-2.5 px-6 py-2.5 text-[13px]"
          >
            <Plus size={18} strokeWidth={2.5} /> 
            <span className="font-bold tracking-tight">New Task</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 animate-reveal-premium delay-100">
         <div className="glass-premium rounded-full px-1.5 py-1.5 flex items-center relative border-white/60">
            {/* Sliding Background */}
            <div 
               className="absolute h-[calc(100%-12px)] bg-[#030303] rounded-full transition-all duration-500 ease-out z-0 shadow-lg"
               style={{ 
                  width: '90px',
                  transform: `translateX(${['all', 'pending', 'in-progress', 'completed'].indexOf(filterStatus) * 90}px)`
               }}
            ></div>
            {['all', 'pending', 'in-progress', 'completed'].map((status) => (
               <button 
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`w-[90px] py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all relative z-10 ${
                     filterStatus === status ? 'text-white' : 'text-[#989898] hover:text-[#030303]'
                  }`}
               >
                  {status.replace('-', ' ')}
               </button>
            ))}
         </div>
      </div>

      <div className="w-full h-px bg-white/20 animate-reveal-premium delay-200"></div>

      {/* Tasks List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-reveal-premium delay-300">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskCard 
              key={task._id} 
              task={task} 
              onClick={() => setSelectedTask(task)} 
            />
          ))
        ) : (
          <div className="col-span-full glass-premium rounded-[32px] h-[240px] border-white/60 flex flex-col items-center justify-center text-[#989898] gap-3">
             <CheckCircle2 size={32} strokeWidth={1.5} />
             <p className="font-extrabold uppercase tracking-widest text-[10px] font-heading">No tasks found</p>
          </div>
        )}
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTaskCreated={fetchTasks}
      />

      <TaskDetailsDrawer
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={fetchTasks}
        onDelete={handleTaskDelete}
      />
    </div>
  );
};

export default Tasks;
