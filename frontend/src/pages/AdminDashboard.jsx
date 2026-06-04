import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Briefcase, BarChart3,
  Sun, Moon,
  ArrowUpRight, ArrowDownRight, CheckCircle2, 
  Clock, XCircle, LogOut, Landmark, ShieldCheck,
  User, Mail, Wallet, Calendar, TrendingUp, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const AdminDashboard = () => {
  const { logout, darkMode, toggleDarkMode } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, loans, analytics
  const [loans, setLoans] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    pendingLoans: 0,
    approvedVolume: 0,
    loanToDepositRatio: 0,
    estimatedInterestRevenue: 0
  });

  useEffect(() => {
    fetchAdminData();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      const statsData = statsRes.data;

      const loanRes = await api.get('/loans/all');
      setLoans(loanRes.data || []);

      setStats({
        totalUsers: Number(statsData.totalUsers) || 0,
        totalBalance: Number(statsData.totalBalance) || 0,
        pendingLoans: Number(statsData.pendingLoans) || 0,
        approvedVolume: Number(statsData.approvedLoanVolume) || 0,
        loanToDepositRatio: Number(statsData.loanToDepositRatio) || 0,
        estimatedInterestRevenue: Number(statsData.estimatedInterestRevenue) || 0
      });
    } catch (err) {
      console.error("Admin Stats Fetch Error:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error("Admin Users Fetch Error:", err);
    }
  };

  const handleLoanAction = async (id, action) => {
    try {
      await api.post(`/loans/${action}/${id}`);
      alert(`Loan ${action === 'approve' ? 'Approved' : 'Rejected'}!`);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed.");
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete user "${name}"? This will also remove all their accounts, loans, and transaction history.`)) {
      try {
        await api.delete(`/admin/users/${id}`);
        alert("User deleted successfully.");
        fetchUsers();
        fetchAdminData();
      } catch (err) {
        alert(err.response?.data?.message || "Deletion failed.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FF] dark:bg-[#0F172A] transition-colors duration-300 flex font-sans text-gray-800 dark:text-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 h-[calc(100vh-2rem)] m-4 fixed left-0 top-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 rounded-[32px] shadow-xl flex flex-col z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <ShieldCheck size={24} />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            FinGenie Admin
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem 
            icon={<LayoutDashboard size={20}/>} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
          />
          <NavItem 
            icon={<Users size={20}/>} 
            label="User Base" 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')} 
          />
          <NavItem 
            icon={<Briefcase size={20}/>} 
            label="Loan Queue" 
            active={activeTab === 'loans'} 
            onClick={() => setActiveTab('loans')} 
          />
          <NavItem 
            icon={<BarChart3 size={20}/>} 
            label="Analytics" 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')} 
          />
        </nav>

        <div className="p-4 mt-auto">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all font-bold text-sm">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-72 p-8">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight capitalize">{activeTab} Core</h1>
            <p className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">Intelligent Banking Oversight</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 bg-white dark:bg-slate-800 border border-white dark:border-slate-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all text-gray-600 dark:text-indigo-400 shadow-sm"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="flex items-center gap-3 pl-2 pr-4 py-2 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">A</div>
              <span className="text-sm font-bold tracking-wide">MASTER ADMIN</span>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard title="Total Users" value={stats.totalUsers} trend="+4%" positive />
              <StatCard title="Global Deposits" value={`$${stats.totalBalance.toLocaleString()}`} trend="+12%" positive />
              <StatCard title="Pending Loans" value={stats.pendingLoans} trend="Manual Review" positive={false} />
              <StatCard title="Loan Volume" value={`$${stats.approvedVolume.toLocaleString()}`} trend="+24%" positive />
            </div>

            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white dark:border-slate-800 rounded-[32px] p-8 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Recent Loan Activity</h3>
              <LoanTable loans={loans.slice(0, 5)} onAction={handleLoanAction} />
              <button onClick={() => setActiveTab('loans')} className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">View Full Queue →</button>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white dark:border-slate-800 rounded-[32px] p-8 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Registered User Directory</h3>
            <UserTable users={users} onDelete={handleDeleteUser} />
          </div>
        )}

        {activeTab === 'loans' && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white dark:border-slate-800 rounded-[32px] p-8 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Complete Loan Queue</h3>
            <LoanTable loans={loans} onAction={handleLoanAction} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Liquidity Card */}
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white dark:border-slate-800 rounded-[32px] p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400"><BarChart3 size={22}/></div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Platform Liquidity</h3>
                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Loan-to-Deposit Ratio</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.loanToDepositRatio}%</span>
                    <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Risk Level: {stats.loanToDepositRatio > 70 ? 'High' : stats.loanToDepositRatio > 40 ? 'Moderate' : 'Stable'}</span>
                  </div>
                  <div className="w-full h-4 bg-indigo-50 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${stats.loanToDepositRatio > 70 ? 'bg-red-500' : 'bg-indigo-600'}`} 
                      style={{ width: `${Math.min(stats.loanToDepositRatio, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
                    This ratio indicates that {stats.loanToDepositRatio}% of the bank's liquid deposits are currently tied up in active loans. A healthy ratio is typically between 40% and 60%.
                  </p>
                </div>
              </div>

              {/* Profitability Card */}
              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white dark:border-slate-800 rounded-[32px] p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl text-green-600 dark:text-green-400"><TrendingUp size={22}/></div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Projected Revenue</h3>
                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">Interest Yield Forecast</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-green-50/50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30">
                    <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">Total Interest</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">${stats.estimatedInterestRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Avg. Rate</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">7%</p>
                  </div>
                </div>
                <p className="mt-8 text-sm text-gray-500 dark:text-slate-400 font-medium">
                  Based on current approved loans, the system is projected to generate ${stats.estimatedInterestRevenue.toLocaleString()} in interest payments over the next billing cycle.
                </p>
              </div>
            </div>

            {/* Risk Distribution Card */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white dark:border-slate-800 rounded-[32px] p-8 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Portfolio Risk Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <RiskGauge label="Approved Capital" value={`$${stats.approvedVolume.toLocaleString()}`} color="bg-green-500" />
                <RiskGauge label="Pending Requests" value={stats.pendingLoans} color="bg-amber-500" />
                <RiskGauge label="Global Liquidity" value={`$${stats.totalBalance.toLocaleString()}`} color="bg-indigo-600" />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Components
const NavItem = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all group ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-400 dark:text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
  >
    {icon}
    <span className="font-bold text-sm tracking-wide">{label}</span>
  </div>
);

const StatCard = ({ title, value, trend, positive }) => (
  <div className="bg-white dark:bg-slate-900 border border-white dark:border-slate-800 rounded-[28px] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform"><BarChart3 size={60} className="dark:text-indigo-400" /></div>
    <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{title}</p>
    <div className="flex items-end gap-3">
      <h4 className="text-2xl font-black text-gray-900 dark:text-white">{value}</h4>
      <span className={`text-[10px] font-bold mb-1.5 flex items-center ${positive ? 'text-green-500' : 'text-indigo-400 dark:text-indigo-500'}`}>
        {positive ? <ArrowUpRight size={12}/> : null} {trend}
      </span>
    </div>
  </div>
);

const RiskGauge = ({ label, value, color }) => (
  <div className="p-6 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center">
    <div className={`w-3 h-3 ${color} rounded-full mb-4 animate-pulse`}></div>
    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
  </div>
);

const LoanTable = ({ loans, onAction }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-indigo-50 dark:border-slate-800 text-gray-400 dark:text-slate-500 uppercase text-[11px] font-black tracking-[0.2em]">
          <th className="pb-6 pl-4">Application ID</th>
          <th className="pb-6">Amount</th>
          <th className="pb-6">Rate</th>
          <th className="pb-6">Status</th>
          <th className="pb-6 text-right pr-4">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-indigo-50/30 dark:divide-slate-800/30">
        {loans.length === 0 ? (
          <tr><td colSpan="5" className="py-10 text-center text-gray-400 dark:text-slate-500 font-bold">No loans found.</td></tr>
        ) : (
          loans.map((loan, i) => (
            <tr key={i} className="group hover:bg-white/10 dark:hover:bg-slate-800/30 transition-all">
              <td className="py-6 pl-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    #{loan.id}
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900 dark:text-white text-sm">{loan.userName || loan.userEmail || "Applicant #" + loan.id}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest">{loan.userEmail || "System Managed"}</p>
                  </div>
                </div>
              </td>
              <td className="py-6 font-black text-sm text-gray-900 dark:text-white">${Number(loan.amount).toLocaleString()}</td>
              <td className="py-6 text-sm text-indigo-600 dark:text-indigo-400 font-bold">{loan.interestRate}%</td>
              <td className="py-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  loan.status === 'APPROVED' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 
                  loan.status === 'REJECTED' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                }`}>{loan.status}</span>
              </td>
              <td className="py-6 text-right pr-4">
                {loan.status === 'PENDING' && (
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => onAction(loan.id, 'approve')} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all"><CheckCircle2 size={16} /></button>
                    <button onClick={() => onAction(loan.id, 'reject')} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"><XCircle size={16} /></button>
                  </div>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const UserTable = ({ users, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-indigo-50 dark:border-slate-800 text-gray-400 dark:text-slate-500 uppercase text-[11px] font-black tracking-[0.2em]">
          <th className="pb-6 pl-4">User Details</th>
          <th className="pb-6">Account #</th>
          <th className="pb-6">Balance</th>
          <th className="pb-6">Role</th>
          <th className="pb-6 text-right pr-4">Registered</th>
          <th className="pb-6 text-right pr-4">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-indigo-50/30 dark:divide-slate-800/30">
        {users.map((u, i) => (
          <tr key={i} className="hover:bg-white/10 dark:hover:bg-slate-800/30 transition-all">
            <td className="py-6 pl-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400"><User size={18} /></div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{u.firstName} {u.lastName}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">{u.email}</p>
                </div>
              </div>
            </td>
            <td className="py-6 font-mono text-xs font-bold text-gray-600 dark:text-slate-400">{u.accountNumber}</td>
            <td className="py-6 font-black text-sm text-indigo-600 dark:text-indigo-400">${Number(u.balance).toLocaleString()}</td>
            <td className="py-6"><span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase">{u.role}</span></td>
            <td className="py-6 text-right pr-4 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">{new Date(u.createdAt).toLocaleDateString()}</td>
            <td className="py-6 text-right pr-4">
              <button 
                onClick={() => onDelete(u.id, `${u.firstName} ${u.lastName}`)}
                className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AdminDashboard;
