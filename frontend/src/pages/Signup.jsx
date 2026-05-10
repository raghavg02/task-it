import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import RoleSelector from '../components/RoleSelector.jsx';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [role, setRole] = useState('member');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [errors, setErrors] = useState({});
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Please enter a valid email address';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await signup(name, email, password, role);
    if (result.success) {
      navigate('/');
    } else if (result.error) {
       setErrors({ general: result.error });
    }
  };

  return (
    <div className="w-full animate-reveal-premium">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-extrabold text-[#030303] tracking-tight-custom mb-2 font-heading">Join Task-It</h2>
        <p className="text-[#989898] text-[15px] font-medium">Create your premium project workspace today.</p>
      </div>

      <div className="mb-8">
         <RoleSelector value={role} onChange={setRole} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-6 py-3 rounded-2xl text-[12px] font-bold animate-reveal-premium flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
             {errors.general}
          </div>
        )}
        
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-[#989898] uppercase tracking-widest ml-4">Full Name</label>
          <input 
            type="text" 
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-6 py-3 rounded-full border-2 bg-white/40 focus:outline-none transition-all duration-300 text-[#030303] font-bold text-[13px] placeholder:text-[#989898]/50 ${
              errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/60 focus:border-[#F5601A]/30 focus:ring-4 focus:ring-orange-500/5'
            }`}
            required
            disabled={loading}
          />
          {errors.name && <p className="text-[9px] font-bold text-red-500 ml-5 mt-0.5">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-[#989898] uppercase tracking-widest ml-4">Email Address</label>
          <input 
            type="email" 
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-6 py-3 rounded-full border-2 bg-white/40 focus:outline-none transition-all duration-300 text-[#030303] font-bold text-[13px] placeholder:text-[#989898]/50 ${
              errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/60 focus:border-[#F5601A]/30 focus:ring-4 focus:ring-orange-500/5'
            }`}
            required
            disabled={loading}
          />
          {errors.email && <p className="text-[9px] font-bold text-red-500 ml-5 mt-0.5">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-[#989898] uppercase tracking-widest ml-4">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-6 pr-11 py-3 rounded-full border-2 bg-white/40 focus:outline-none transition-all duration-300 text-[#030303] font-bold text-[13px] placeholder:text-[#989898]/50 ${
                  errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/60 focus:border-[#F5601A]/30 focus:ring-4 focus:ring-orange-500/5'
                }`}
                required
                disabled={loading}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#989898] hover:text-[#030303]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-[9px] font-bold text-red-500 ml-5 mt-0.5">{errors.password}</p>}
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-[#989898] uppercase tracking-widest ml-4">Confirm</label>
            <div className="relative">
              <input 
                type={showConfirm ? 'text' : 'password'} 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-6 pr-11 py-3 rounded-full border-2 border-white/60 bg-white/40 focus:outline-none focus:border-[#F5601A]/30 focus:ring-4 focus:ring-orange-500/5 transition-all duration-300 text-[#030303] font-bold text-[13px] placeholder:text-[#989898]/50"
                required
                disabled={loading}
              />
              <button 
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                disabled={loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#989898] hover:text-[#030303]"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="btn-premium-orange w-full py-4 text-[14px] flex items-center justify-center gap-3 disabled:opacity-70 mt-6"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span className="font-bold tracking-tight">Creating account...</span>
            </>
          ) : (
            <span className="font-bold tracking-tight">Create your Account</span>
          )}
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-[14px] text-[#989898] font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-extrabold text-[#030303] hover:text-[#F5601A] transition-colors underline decoration-[#F5601A]/20 underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
