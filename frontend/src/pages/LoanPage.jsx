import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, Landmark, Menu, Bot, 
  ArrowLeft, Wallet, Briefcase, TrendingUp, 
  CheckCircle2, Clock, XCircle, Send, Moon, Sun,
  Calculator, Info, Calendar, Percent, ShieldCheck, Activity
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const LoanPage = () => {
  const [loans, setLoans] = useState([]);
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const [loanRequest, setLoanRequest] = useState({ amount: '', interestRate: '7' });
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();

  // EMI Calculator State
  const [emiData, setEmiData] = useState({ amount: 10000, rate: 7, tenure: 12 });
  const [emiResult, setEmiResult] = useState(0);

  // Credit Score State
  const [creditScore, setCreditScore] = useState(0);
  const [loadingScore, setLoadingScore] = useState(true);

  useEffect(() => {
    fetchLoans();
    calculateEMI();
    fetchCreditScore();
  }, []);

  const fetchCreditScore = async () => {
    try {
      const res = await api.get('/banking/credit-score');
      setCreditScore(res.data.score);
    } catch (err) {
      console.error("Credit Score Fetch Error:", err);
      setCreditScore(600); 
    } finally {
      setLoadingScore(false);
    }
  };

  useEffect(() => {
    calculateEMI();
  }, [emiData]);

  const calculateEMI = () => {
    const P = emiData.amount;
    const R = emiData.rate / 12 / 100;
    const N = emiData.tenure;
    if (R === 0) {
      setEmiResult(P / N);
      return;
    }
    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    setEmiResult(emi);
  };

  const fetchLoans = async () => {
    try {
      const res = await api.get('/loans/my-loans');
      setLoans(res.data);
    } catch (err) {
      console.error("Fetch Loans Error:", err);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      await api.post('/loans/apply', loanRequest);
      alert("Loan Application Submitted!");
      setLoanRequest({ amount: '', interestRate: '7' });
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || "Application failed.");
    } finally {
      setIsApplying(false);
    }
  };

  const glassStyle = {
    background: darkMode ? 'rgba(30, 41, 40, 0.7)' : 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: darkMode ? '0 10px 40px rgba(0, 0, 0, 0.2)' : '0 10px 40px rgba(99, 102, 241, 0.08)'
  };

  const buttonGradient = "bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white font-bold rounded-2xl transition-all shadow-[0_10px_25px_rgba(99,102,241,0.25)] hover:brightness-105 active:scale-[0.98]";

  const CreditScoreGauge = ({ score }) => {
    const min = 300;
    const max = 850;
    const percentage = ((score - min) / (max - min)) * 100;
    const radius = 70;
    const strokeDasharray = 2 * Math.PI * radius; 
    const offset = strokeDasharray - (percentage / 100) * strokeDasharray;

    let color = "#10B981"; 
    let status = "Excellent";
    if (score < 580) { color = "#EF4444"; status = "Poor"; }
    else if (score < 670) { color = "#F59E0B"; status = "Fair"; }
    else if (score < 740) { color = "#6366F1"; status = "Good"; }

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white/10 dark:bg-slate-800/30 rounded-[40px] border border-white/10">
        <div className="relative w-52 h-52 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="104" cy="104" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200 dark:text-slate-800" />
            <circle 
              cx="104" cy="104" r={radius} stroke={color} strokeWidth="12" fill="transparent" 
              strokeDasharray={strokeDasharray} 
              style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1.5s ease-in-out' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-5xl font-black dark:text-white tracking-tighter">{score}</span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 mt-1">Score</span>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em]" style={{ color }}>{status}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FF] dark:bg-[#0F172A] text-[#111827] dark:text-gray-100 font-['Inter',_sans-serif] transition-colors duration-300 relative">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-purple-200/40 dark:bg-indigo-900/20 blur-[140px] rounded-full pointer-events-none animate-pulse"></div>
      
      <nav className="relative z-20 px-8 py-4 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-b border-white/40 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] p-2.5 rounded-2xl shadow-lg">
            <Landmark size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#111827] dark:text-white">FinGenie <span className="text-[#6366F1]">AI</span></span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 bg-white dark:bg-slate-800 border border-white dark:border-slate-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all text-gray-600 dark:text-indigo-400 shadow-sm"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-bold text-[#6366F1] dark:text-indigo-400 hover:text-[#8B5CF6] transition-colors">
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <button onClick={logout} className="p-2.5 bg-white dark:bg-slate-800 border border-white dark:border-slate-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-[#EF4444] shadow-sm">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <h1 className="text-3xl font-black text-[#111827] dark:text-white mb-2 tracking-tight">Loan & Credit Core</h1>
          <p className="text-[#6B7280] dark:text-slate-400 font-medium mb-10">Manage your loan applications and credit profile powered by AI analysis.</p>
        </div>

        {/* Left Column */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* EMI Calculator */}
          <div style={glassStyle} className="p-8 rounded-[32px] border-indigo-200/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-2xl text-[#8B5CF6] dark:text-purple-400">
                <Calculator size={22} />
              </div>
              <h3 className="text-xl font-black text-[#111827] dark:text-white tracking-tight">EMI Calculator</h3>
            </div>

            <div className="space-y-6">
              <div className="bg-indigo-600/5 dark:bg-indigo-400/5 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 text-center mb-8">
                <p className="text-[10px] font-black text-[#6366F1] dark:text-indigo-400 uppercase tracking-[0.2em] mb-1">Monthly Installment</p>
                <h2 className="text-4xl font-black text-[#111827] dark:text-white tracking-tighter">${emiResult.toLocaleString(undefined, {maximumFractionDigits: 2})}</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Wallet size={12}/> Principal Amount</label>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">${emiData.amount.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="1000" max="100000" step="500"
                    value={emiData.amount}
                    onChange={e => setEmiData({...emiData, amount: Number(e.target.value)})}
                    className="w-full h-1.5 bg-indigo-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#6366F1]"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Percent size={12}/> Interest Rate (%)</label>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{emiData.rate}%</span>
                  </div>
                  <input 
                    type="range" min="1" max="20" step="0.5"
                    value={emiData.rate}
                    onChange={e => setEmiData({...emiData, rate: Number(e.target.value)})}
                    className="w-full h-1.5 bg-indigo-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#6366F1]"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> Tenure (Months)</label>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{emiData.tenure} m</span>
                  </div>
                  <input 
                    type="range" min="3" max="60" step="3"
                    value={emiData.tenure}
                    onChange={e => setEmiData({...emiData, tenure: Number(e.target.value)})}
                    className="w-full h-1.5 bg-indigo-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#6366F1]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={glassStyle} className="p-8 rounded-[32px]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-[#6366F1] dark:text-indigo-400">
                <Briefcase size={22} />
              </div>
              <h3 className="text-xl font-black text-[#111827] dark:text-white tracking-tight">Request New Loan</h3>
            </div>
            
            <form onSubmit={handleApply} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-[#6B7280] dark:text-slate-500 uppercase tracking-widest mb-3">Loan Amount ($)</label>
                <input 
                  type="number" placeholder="e.g. 5000" 
                  className="w-full bg-white/40 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700 rounded-[20px] py-4 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all dark:text-white"
                  value={loanRequest.amount}
                  onChange={e => setLoanRequest({...loanRequest, amount: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-[#6B7280] dark:text-slate-500 uppercase tracking-widest mb-3">Institutional Interest Rate (%)</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-100 dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-700 rounded-[20px] py-4 px-5 text-sm font-bold text-gray-500 dark:text-slate-500 cursor-not-allowed"
                  value="7"
                  readOnly
                />
                <p className="text-[10px] text-[#6366F1] dark:text-indigo-400 mt-2 font-bold px-1">Fixed Institutional Rate: 7.0%</p>
              </div>
              <button 
                type="submit" 
                disabled={isApplying}
                className={`${buttonGradient} w-full py-4 text-xs tracking-[0.1em] uppercase flex items-center justify-center gap-2`}
              >
                {isApplying ? 'Processing Neural Request...' : 'Submit Application'}
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Credit Analysis Card */}
          <div style={glassStyle} className="p-8 rounded-[32px]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-2xl text-[#10B981] dark:text-green-400">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="text-xl font-black text-[#111827] dark:text-white tracking-tight">Health Analysis</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
                <Activity size={12} className="text-[#6366F1] animate-pulse" />
                <span className="text-[10px] font-black text-[#6366F1] dark:text-indigo-400 uppercase tracking-widest">Real-time Scan</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <CreditScoreGauge score={creditScore} />
              <div className="space-y-6">
                <div className="p-5 bg-white/40 dark:bg-slate-800/30 rounded-2xl border border-white/10 group hover:border-[#6366F1]/30 transition-all">
                  <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Debt-to-Income Ratio</p>
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-bold dark:text-white">14.2%</span>
                    <span className="text-[10px] font-black text-[#10B981] uppercase tracking-widest">Low Risk</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                    <div className="w-[14.2%] h-full bg-[#10B981]" />
                  </div>
                </div>
                <div className="p-5 bg-white/40 dark:bg-slate-800/30 rounded-2xl border border-white/10 group hover:border-[#6366F1]/30 transition-all">
                  <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Credit Utilization</p>
                  <div className="flex justify-between items-end">
                    <span className="text-xl font-bold dark:text-white">28%</span>
                    <span className="text-[10px] font-black text-[#6366F1] uppercase tracking-widest">Optimal</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                    <div className="w-[28%] h-full bg-[#6366F1]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={glassStyle} className="p-8 rounded-[32px] flex flex-col min-h-[420px]">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-[#6366F1] dark:text-indigo-400">
                <TrendingUp size={22} />
              </div>
              <h3 className="text-xl font-black text-[#111827] dark:text-white tracking-tight">Credit Portfolio</h3>
            </div>

            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-indigo-50 dark:border-slate-800 text-[#6B7280]/60 dark:text-slate-500 uppercase text-[11px] font-black tracking-[0.2em]">
                    <th className="pb-6 pl-4">Loan Details</th>
                    <th className="pb-6">Status</th>
                    <th className="pb-6 text-right pr-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-50/30 dark:divide-slate-800/30">
                  {loans.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-20 text-center text-[#6B7280] dark:text-slate-500 font-bold text-sm">
                        No active loan applications found.
                      </td>
                    </tr>
                  ) : (
                    loans.map((loan, i) => (
                      <tr key={i} className="group hover:bg-white/40 dark:hover:bg-slate-800/50 transition-all duration-300">
                        <td className="py-7 pl-4">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-[#6366F1] dark:text-indigo-400">
                              <Landmark size={20} />
                            </div>
                            <div>
                              <p className="font-extrabold text-[#111827] dark:text-white">${Number(loan.amount).toLocaleString()}</p>
                              <p className="text-[10px] text-[#6B7280]/60 dark:text-slate-500 font-black tracking-widest uppercase">{loan.interestRate}% Interest Rate</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-7">
                          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            loan.status === 'APPROVED' ? 'bg-[#10B981]/10 text-[#10B981] dark:bg-green-900/20 dark:text-green-400' : 
                            loan.status === 'REJECTED' ? 'bg-[#EF4444]/10 text-[#EF4444] dark:bg-red-900/20 dark:text-red-400' : 
                            'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                          }`}>
                            {loan.status === 'APPROVED' && <CheckCircle2 size={12} />}
                            {loan.status === 'REJECTED' && <XCircle size={12} />}
                            {loan.status === 'PENDING' && <Clock size={12} />}
                            {loan.status}
                          </div>
                        </td>
                        <td className="py-7 text-right pr-4 text-xs font-bold text-[#6B7280]/40 dark:text-slate-600 uppercase tracking-widest">
                          {new Date(loan.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoanPage;
