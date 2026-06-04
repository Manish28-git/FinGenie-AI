import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig';
import { ShieldCheck, ArrowRight, Loader2, Landmark, Mail } from 'lucide-react';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email context lost. Please register again.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/verify-otp', { email, otp });
      alert("Verification Successful! You can now login.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F7FF] font-['Inter',_sans-serif]">
      <div className="relative z-10 w-full max-w-[420px] px-6">
        <div style={glassStyle} className="rounded-[32px] p-10 flex flex-col items-center">
          <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] p-4 rounded-2xl mb-6 shadow-lg shadow-indigo-600/20">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#111827] tracking-tight mb-2">Verify Your Email</h2>
          <p className="text-[#6B7280] text-sm font-medium text-center mb-8">
            We've sent a 6-digit security code to <br/><span className="text-[#111827] font-bold">{email}</span>
          </p>

          {error && (
            <div className="w-full bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-6 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="w-full space-y-6">
            <div className="space-y-2 text-center">
              <label className="text-[10px] font-black text-[#6B7280]/60 uppercase tracking-[0.2em]">6-Digit Code</label>
              <input 
                type="text" 
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full bg-white/40 border border-indigo-50 rounded-2xl py-4 text-center text-2xl font-black tracking-[0.5em] text-[#111827] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 hover:brightness-105 transition-all"
            >
              {loading ? <Loader2 size={22} className="animate-spin" /> : <><span>ACTIVATE VAULT</span><ArrowRight size={18}/></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
