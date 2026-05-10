import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CheckSquare, CheckCircle2, ArrowLeft } from 'lucide-react';
import authBg from '../assets/auth_bg.png';

const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] font-sans flex items-center justify-center p-4">
      {/* MAIN CONTAINER */}
      <div className="flex w-full max-w-[1100px] glass-premium rounded-[48px] border-white/60 shadow-2xl overflow-hidden min-h-[700px] relative">
        
        {/* LEFT SIDE - BRANDING CARD */}
        <div className="hidden lg:flex w-[45%] p-3">
          <div className="w-full h-full relative rounded-[40px] overflow-hidden flex flex-col items-center justify-center bg-[#030303]">
            {/* Ambient Orange Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#F5601A] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
            
            {/* Logo */}
            <div className="relative z-10 flex flex-col items-center gap-4 animate-reveal-premium">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F5601A] to-[#ff8a4c] rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-orange-500/20">
                <CheckSquare size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight-custom font-heading">Task-It</h1>
              <p className="text-[#989898] text-sm font-medium tracking-wide">Premium Project Workspace</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - FORM CONTAINER */}
        <div className="w-full lg:w-[55%] flex flex-col bg-white/40 relative z-10">
          {/* Top Bar with Back Button */}
          <div className="absolute top-6 left-8 animate-reveal-premium delay-100">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full glass-premium border-white/60 text-[#989898] hover:text-[#030303] transition-all hover:scale-110"
            >
              <ArrowLeft size={18} />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:px-20 animate-reveal-premium delay-200">
            <div className="w-full max-w-[380px]">
              <Outlet />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
