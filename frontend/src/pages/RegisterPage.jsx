import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { UserPlus, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, Landmark } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      setError("Strategic Link Failure: Passwords do not match.");
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/signup', formData);
      alert("Registration initiated! Please check your email for the 6-digit verification code.");
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Initialization failed. System rejected credentials.');
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F7FF] overflow-hidden relative font-['Inter',_sans-serif] py-12">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6366F1] opacity-10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8B5CF6] opacity-10 blur-[150px] rounded-full animate-pulse"></div>

      <div className="relative z-10 w-full max-w-[480px] px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div style={glassStyle} className="rounded-[32px] p-10 flex flex-col items-center">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-600/20">
              <UserPlus size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#111827] tracking-tight">Initialize Account</h2>
            <p className="text-[#6B7280] mt-2 text-sm font-semibold tracking-wide uppercase opacity-70">Register New Profile</p>
          </div>

          {error && (
            <div className="w-full bg-red-500/5 border border-red-500/20 text-red-600 px-4 py-3 rounded-2xl mb-6 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="w-full space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#6B7280]/60 uppercase tracking-[0.2em] ml-1">First Name</label>
                <input 
                  type="text" 
                  placeholder=""
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-white/40 border border-indigo-50 rounded-2xl py-3.5 px-5 text-[#111827] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all shadow-sm placeholder:text-[#6B7280]/20"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#6B7280]/60 uppercase tracking-[0.2em] ml-1">Last Name</label>
                <input 
                  type="text" 
                  placeholder=""
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-white/40 border border-indigo-50 rounded-2xl py-3.5 px-5 text-[#111827] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all shadow-sm placeholder:text-[#6B7280]/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#6B7280]/60 uppercase tracking-[0.2em] ml-1">Official Email</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]/40 group-focus-within:text-[#6366F1] transition-colors" />
                <input 
                  type="email" 
                  placeholder="john@example.com"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/40 border border-indigo-50 rounded-2xl py-3.5 pl-11 pr-4 text-[#111827] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all shadow-sm placeholder:text-[#6B7280]/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#6B7280]/60 uppercase tracking-[0.2em] ml-1">Security Key</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]/40 group-focus-within:text-[#6366F1] transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white/40 border border-indigo-50 rounded-2xl py-3.5 pl-11 pr-11 text-[#111827] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all shadow-sm placeholder:text-[#6B7280]/20"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]/40 hover:text-[#6366F1] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#6B7280]/60 uppercase tracking-[0.2em] ml-1">Confirm Security Key</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]/40 group-focus-within:text-[#6366F1] transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/40 border border-indigo-50 rounded-2xl py-3.5 pl-11 pr-4 text-[#111827] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all shadow-sm placeholder:text-[#6B7280]/20"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`${buttonGradient} w-full py-5 flex items-center justify-center gap-3 group mt-4`}
            >
              {loading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <>
                  <span className="tracking-[0.15em] text-xs">CREATE ACCOUNT</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-xs font-bold text-[#6B7280]/50 uppercase tracking-widest text-center">
            Existing User? 
            <Link to="/login" className="ml-2 text-[#6366F1] hover:text-[#8B5CF6] transition-colors border-b-2 border-indigo-100 hover:border-[#8B5CF6]">
              Sign In to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
