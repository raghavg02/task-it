import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  FolderKanban, 
  MoreVertical,
  Calendar,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import api from '../services/api';
import CreateProjectModal from '../components/CreateProjectModal';
import { toast } from 'react-hot-toast';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return 0;
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
          <h1 className="text-3xl font-extrabold text-[#030303] tracking-tight-custom font-heading">Projects</h1>
          <p className="text-[#989898] font-medium text-[14px] mt-1">Manage and track all your active team projects.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-premium-orange flex items-center gap-2.5 px-6 py-2.5 text-[13px]"
        >
          <Plus size={18} strokeWidth={2.5} /> 
          <span className="font-bold tracking-tight">New Project</span>
        </button>
      </div>

      {/* Search & Filter Pill */}
      <div className="flex flex-col sm:flex-row items-center gap-4 animate-reveal-premium delay-100">
        <div className="flex-1 glass-premium rounded-full px-5 py-2.5 flex items-center border-white/60 relative w-full group focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
          <Search size={16} className="text-[#989898] group-focus-within:text-[#F5601A] transition-colors" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full bg-transparent border-none outline-none text-[13px] font-medium pl-3 placeholder:text-[#989898] text-[#030303]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
             onClick={() => toast.success('Filter logic coming soon!')}
             className="bg-white p-3 rounded-full shadow-sm border border-slate-50 text-slate-400 hover:text-black transition-all"
          >
            <Filter size={18} />
          </button>
          <div className="relative group">
             <button 
                onClick={() => setSortBy(sortBy === 'newest' ? 'name' : sortBy === 'name' ? 'oldest' : 'newest')}
                className="bg-white p-3 rounded-full shadow-sm border border-slate-50 text-slate-400 hover:text-black transition-all flex items-center gap-2"
                title={`Sorting by ${sortBy}`}
             >
               <ArrowUpDown size={18} />
               <span className="text-[10px] font-bold uppercase hidden group-hover:inline-block transition-all">Sort: {sortBy}</span>
             </button>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-white/20 animate-reveal-premium delay-200"></div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-reveal-premium delay-300">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(proj => (
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
          <div className="col-span-full glass-premium rounded-[32px] h-[240px] border-white/60 flex flex-col items-center justify-center text-[#989898] gap-3">
             <FolderKanban size={32} strokeWidth={1.5} />
             <p className="font-extrabold uppercase tracking-widest text-[10px] font-heading">No projects found</p>
          </div>
        )}
      </div>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onProjectCreated={fetchProjects}
      />
    </div>
  );
};

export default Projects;
