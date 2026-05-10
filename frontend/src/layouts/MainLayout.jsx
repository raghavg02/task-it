import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  Users,
  HelpCircle
} from 'lucide-react';
import ForcePasswordChangeModal from '../components/ForcePasswordChangeModal';
import api from '../services/api';
import { useEffect } from 'react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await api.get(`/search?q=${searchQuery}`);
          if (res.data.success) {
            setSearchResults(res.data.data);
          }
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleResultClick = (type, id) => {
    setSearchQuery('');
    setSearchResults(null);
    if (type === 'project') navigate(`/projects/${id}`);
    if (type === 'task') navigate(`/tasks`);
    if (type === 'member') navigate(`/team`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'Team', icon: Users, path: '/team' },
  ];

  return (
    <div className="min-h-screen bg-[#EAEAEA] text-black flex font-sans antialiased overflow-x-hidden p-6 relative">

      <div className="fixed top-5 left-6 z-[80] hidden md:block animate-reveal-premium">
        <div className="glass-premium rounded-full px-4 py-2 flex items-center gap-2.5 min-w-[140px] border-white/50">
          <div className="w-7 h-7 bg-gradient-to-br from-[#F5601A] to-[#ff8a4c] rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
             <CheckSquare size={15} strokeWidth={3} />
          </div>
          <span className="text-[15px] font-extrabold tracking-tight-custom font-heading text-[#030303]">Task-It</span>
        </div>
      </div>

      <div className="fixed top-0 left-0 right-0 h-14 glass-premium z-[90] flex md:hidden items-center justify-between px-6 border-b border-white/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#F5601A] rounded-lg flex items-center justify-center text-white">
            <CheckSquare size={14} strokeWidth={3} />
          </div>
          <span className="text-sm font-extrabold tracking-tight-custom font-heading text-[#030303]">Task-It</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-orange-50/50 rounded-xl transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <aside className={`fixed left-6 top-1/2 -translate-y-1/2 w-[60px] z-[70] transition-all duration-300 animate-reveal-premium delay-100 ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'md:translate-x-0 -translate-x-20 md:opacity-100 opacity-0'}`}>
        <div className="w-full glass-premium rounded-full py-6 flex flex-col items-center gap-5 relative border-white/50">

          <div
            className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-[#F5601A] to-[#ff8a4c] rounded-xl transition-all duration-500 ease-out z-0 shadow-lg shadow-orange-500/20"
            style={{
              top: `${23 + (mainMenuItems.findIndex(item => item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)) * 58)}px`,
              opacity: mainMenuItems.findIndex(item => item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)) !== -1 ? 1 : 0
            }}
          ></div>

          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <div key={item.name} className="relative group flex items-center justify-center w-full z-10">
                <Link
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl transition-all duration-500 ${
                    isActive ? 'text-white' : 'text-[#989898] hover:text-[#030303]'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </Link>
                <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-[#030303] text-white text-[9px] font-bold uppercase tracking-widest rounded-lg opacity-0 invisible md:group-hover:opacity-100 md:group-hover:visible transition-all duration-300 delay-500 whitespace-nowrap z-50">
                  {item.name}
                  <div className="absolute top-1/2 -translate-y-1/2 right-full border-[5px] border-transparent border-r-[#030303]"></div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      <div className="fixed bottom-6 left-6 z-[80] hidden md:block">
        <div className="glass-premium rounded-full py-6 px-4 flex flex-col items-center gap-6 border-white/50">
          <Link to="/settings" className="p-2.5 text-[#989898] hover:text-[#F5601A] transition-all">
            <Settings size={20} />
          </Link>
          <button onClick={handleLogout} className="p-2.5 text-[#989898] hover:text-red-500 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-white/40 backdrop-blur-md z-[60] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <main className="flex-1 flex flex-col md:ml-28 mt-20 md:mt-0 transition-all duration-300">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 mb-8 h-auto md:h-[56px] pt-4 pr-6 relative z-[9999]">
          <div className="min-w-[140px] hidden md:block"></div>

          <div className="w-full md:flex-1 md:max-w-xl glass-premium rounded-full px-5 py-2.5 flex items-center relative group focus-within:ring-2 focus-within:ring-orange-500/10 transition-all order-2 md:order-1 border-white/60 animate-reveal-premium delay-200">
            <input
              type="text"
              placeholder="Search everything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-[13px] font-medium text-left pl-3 placeholder:text-[#989898] text-[#030303]"
            />
            <Search className={`absolute right-6 transition-colors ${searchQuery ? 'text-[#F5601A]' : 'text-[#989898]'} ${isSearching ? 'animate-pulse' : ''}`} size={16} />

            {searchResults && (
              <>
                <div className="fixed inset-0 z-[2000] backdrop-blur-[2px] bg-white/10" onClick={() => setSearchResults(null)}></div>
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/98 backdrop-blur-xl rounded-[28px] z-[2001] overflow-hidden animate-reveal-premium p-2 border-white/60 shadow-2xl">
                   <div className="max-h-[350px] overflow-y-auto p-2 space-y-4">

                     {searchResults.projects.length > 0 && (
                        <div>
                           <p className="text-[9px] font-black text-[#989898] uppercase tracking-[0.2em] mb-2 ml-4">Projects</p>
                           <div className="space-y-1">
                              {searchResults.projects.map(p => (
                                 <button
                                    key={p._id}
                                    onClick={() => handleResultClick('project', p._id)}
                                    className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-orange-50/50 text-left transition-all group"
                                 >
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#989898] group-hover:bg-[#F5601A] group-hover:text-white transition-all shadow-sm">
                                       <FolderKanban size={14} />
                                    </div>
                                    <span className="text-[13px] font-bold text-[#030303]">{p.title}</span>
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}

                     {searchResults.tasks.length > 0 && (
                        <div>
                           <p className="text-[9px] font-black text-[#989898] uppercase tracking-[0.2em] mb-2 ml-4">Tasks</p>
                           <div className="space-y-1">
                              {searchResults.tasks.map(t => (
                                 <button
                                    key={t._id}
                                    onClick={() => handleResultClick('task', t._id)}
                                    className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-orange-50/50 text-left transition-all group"
                                 >
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#989898] group-hover:bg-[#F5601A] group-hover:text-white transition-all shadow-sm">
                                       <CheckSquare size={14} />
                                    </div>
                                    <div className="flex-1">
                                       <p className="text-[13px] font-bold text-[#030303]">{t.title}</p>
                                       <p className="text-[9px] font-bold text-[#989898] uppercase">{t.status}</p>
                                    </div>
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}

                     {searchResults.members.length > 0 && (
                        <div>
                           <p className="text-[9px] font-black text-[#989898] uppercase tracking-[0.2em] mb-2 ml-4">Members</p>
                           <div className="space-y-1">
                              {searchResults.members.map(m => (
                                 <button
                                    key={m._id}
                                    onClick={() => handleResultClick('member', m._id)}
                                    className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-orange-50/50 text-left transition-all group"
                                 >
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#989898] group-hover:bg-[#F5601A] group-hover:text-white transition-all shadow-sm">
                                       <Users size={14} />
                                    </div>
                                    <div className="flex-1">
                                       <p className="text-[13px] font-bold text-[#030303]">{m.name}</p>
                                       <p className="text-[9px] font-bold text-[#989898]">{m.role}</p>
                                    </div>
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}

                     {searchResults.projects.length === 0 && searchResults.tasks.length === 0 && searchResults.members.length === 0 && (
                        <div className="py-10 text-center">
                           <Search size={32} className="mx-auto mb-3 text-[#989898] opacity-30" />
                           <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#989898]">No results found</p>
                        </div>
                     )}
                   </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end order-1 md:order-2 animate-reveal-premium delay-300">
            <div className="relative">
               <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`glass-premium rounded-full px-4 py-2 flex items-center gap-3 w-fit transition-all border-white/60 ${isProfileOpen ? 'ring-2 ring-orange-500/10' : 'hover:scale-[1.01]'}`}
               >
                  <div className="text-right hidden sm:block">
                     <p className="text-[12px] font-bold leading-none mb-1 text-[#030303]">{user?.name || 'username'}</p>
                     <p className="text-[9px] font-bold text-[#989898] uppercase tracking-wider text-right">{user?.role || 'role'}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5601A] to-[#ff8a4c] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-orange-500/10">
                     <Users size={15} />
                  </div>
               </button>

               {isProfileOpen && (
                  <>
                     <div
                        className="fixed inset-0 z-[2000] backdrop-blur-[2px] bg-white/10"
                        onClick={() => setIsProfileOpen(false)}
                     ></div>
                     <div className="absolute right-0 mt-4 w-64 bg-white/98 backdrop-blur-xl rounded-[28px] z-[2001] overflow-hidden animate-reveal-premium p-2 border-white/60 shadow-2xl">
                        <div className="p-6 border-b border-white/20 bg-orange-50/20 rounded-t-[24px]">
                           <p className="text-[14px] font-extrabold text-[#030303] font-heading">{user?.name}</p>
                           <p className="text-[11px] font-bold text-[#989898] truncate">{user?.email}</p>
                        </div>
                        <div className="p-2 mt-1">
                           <button
                              onClick={() => { navigate('/settings'); setIsProfileOpen(false); }}
                              className="w-full flex items-center gap-4 px-5 py-3 text-[13px] font-bold text-[#989898] hover:bg-orange-50/50 hover:text-[#F5601A] rounded-2xl transition-all"
                           >
                              <Settings size={17} /> Profile Settings
                           </button>
                           <button
                              onClick={() => { navigate('/team'); setIsProfileOpen(false); }}
                              className="w-full flex items-center gap-4 px-5 py-3 text-[13px] font-bold text-[#989898] hover:bg-orange-50/50 hover:text-[#F5601A] rounded-2xl transition-all"
                           >
                              <Users size={17} /> My Team
                           </button>
                           <div className="h-px bg-white/20 my-2 mx-3"></div>
                           <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-4 px-5 py-3 text-[13px] font-bold text-red-500 hover:bg-red-50/50 rounded-2xl transition-all"
                           >
                              <LogOut size={17} /> Logout
                           </button>
                        </div>
                     </div>
                  </>
               )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-6 scrollbar-hide px-6 md:px-0 relative z-0">
          <Outlet />
        </div>
      </main>
      <ForcePasswordChangeModal isOpen={user?.needsPasswordChange} />
    </div>
  );
};

export default MainLayout;
