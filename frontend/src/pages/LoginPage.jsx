import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, ArrowRight, Eye, EyeOff, Loader2, Landmark } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/signin', { email, password });
      login(response.data);
      if (response.data.role === 'ROLE_ADMIN' || response.data.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please verify your access.');
    } finally {
      setLoading(false);
    }
  };

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 10px 40px rgba(99, 102, 241, 0.08)'
  };

  const buttonGradient = "bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white font-bold rounded-2xl transition-all shadow-[0_10px_25px_rgba(99,102,241,0.25)] hover:brightness-105 active:scale-[0.98]";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F7FF] overflow-hidden relative font-['Inter',_sans-serif]">
      {/* Animated Background Orbs (Dashboard Theme) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6366F1] opacity-10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8B5CF6] opacity-10 blur-[150px] rounded-full animate-pulse"></div>

      <div className="relative z-10 w-full max-w-[420px] px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div style={glassStyle} className="rounded-[32px] p-10 flex flex-col items-center">
          
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-600/20">
              <Landmark size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">FinGenie <span className="text-[#6366F1]">AI</span></h2>
            <p className="text-[#6B7280] mt-2 text-sm font-semibold tracking-wide uppercase opacity-70"></p>
          </div>

          {error && (
            <div className="w-full bg-red-500/5 border border-red-500/20 text-red-600 px-4 py-3 rounded-2xl mb-8 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#6B7280]/60 uppercase tracking-[0.2em] ml-1">Access Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]/40 group-focus-within:text-[#6366F1] transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full bg-white/40 border border-indigo-50 rounded-2xl py-4 pl-12 pr-4 text-[#111827] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all placeholder:text-[#6B7280]/30 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-[#6B7280]/60 uppercase tracking-[0.2em]">Security Key</label>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]/40 group-focus-within:text-[#6366F1] transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/40 border border-indigo-50 rounded-2xl py-4 pl-12 pr-12 text-[#111827] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all placeholder:text-[#6B7280]/30 shadow-sm"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]/40 hover:text-[#6366F1] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`${buttonGradient} w-full py-5 flex items-center justify-center gap-3 group`}
            >
              {loading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <>
                  <span className="tracking-[0.15em] text-xs">AUTHORIZE SESSION</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-xs font-bold text-[#6B7280]/50 uppercase tracking-widest">
            New User? 
            <Link to="/register" className="ml-2 text-[#6366F1] hover:text-[#8B5CF6] transition-colors border-b-2 border-indigo-100 hover:border-[#8B5CF6]">
              Initialize Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
