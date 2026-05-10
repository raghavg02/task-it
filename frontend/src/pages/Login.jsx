import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import RoleSelector from '../components/RoleSelector.jsx';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [role, setRole] = useState('member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Please enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const result = await login(email, password, role);
    if (result.success) {
      navigate('/');
    } else {
      setErrors({ general: result.error || 'Invalid email or password' });
    }
  };

  return (
    <div className="w-full animate-reveal-premium">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-extrabold text-[#030303] tracking-tight-custom mb-2 font-heading">Welcome Back</h2>
        <p className="text-[#989898] text-[15px] font-medium">Enter your credentials to access your workspace.</p>
      </div>

      <div className="mb-8">
         <RoleSelector value={role} onChange={setRole} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-6 py-3 rounded-2xl text-[12px] font-bold animate-reveal-premium flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
             {errors.general}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[#989898] uppercase tracking-widest ml-4">Email Address</label>
          <input 
            type="email" 
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-6 py-3.5 rounded-full border-2 bg-white/40 focus:outline-none transition-all duration-300 text-[#030303] font-bold text-[14px] placeholder:text-[#989898]/50 ${
              errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/60 focus:border-[#F5601A]/30 focus:ring-4 focus:ring-orange-500/5'
            }`}
            required
            disabled={loading}
          />
          {errors.email && <p className="text-[10px] font-bold text-red-500 ml-5 mt-1">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-[#989898] uppercase tracking-widest ml-4">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-6 pr-12 py-3.5 rounded-full border-2 bg-white/40 focus:outline-none transition-all duration-300 text-[#030303] font-bold text-[14px] placeholder:text-[#989898]/50 ${
                errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/60 focus:border-[#F5601A]/30 focus:ring-4 focus:ring-orange-500/5'
              }`}
              required
              disabled={loading}
            />
            {errors.password && <p className="text-[10px] font-bold text-red-500 ml-5 mt-1">{errors.password}</p>}
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-[#989898] hover:text-[#030303] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="btn-premium-orange w-full py-4 text-[14px] flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span className="font-bold tracking-tight">Signing in...</span>
            </>
          ) : (
            <span className="font-bold tracking-tight">Sign In to Task-It</span>
          )}
        </button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-[14px] text-[#989898] font-medium">
          New to Task-It?{' '}
          <Link to="/signup" className="font-extrabold text-[#030303] hover:text-[#F5601A] transition-colors underline decoration-[#F5601A]/20 underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
