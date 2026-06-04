import React, { useEffect, useState, Component } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, Send, History, MessageSquare, Landmark, 
  Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, 
  Bot, Menu, CreditCard, ChevronRight,
  Loader2, User, X, QrCode, Download, ArrowDownCircle, ArrowUpCircle,
  ArrowRight, Moon, Sun, Mic, Volume2, VolumeX
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Error Boundary for stability
class DashboardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-indigo-50 dark:bg-slate-900">
          <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl max-w-md">
            <div className="bg-red-50 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <Bot size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Neural Link Interrupted</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-6 text-sm">We encountered a synchronization error while connecting to your digital vault.</p>
            <button onClick={() => window.location.reload()} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">Re-establish Connection</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const DashboardContent = () => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [creditScore, setCreditScore] = useState(600);
  
  // Transfer state
  const [transferData, setTransferData] = useState({ receiverAccountNumber: '', amount: '', description: '' });
  
  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: `Greetings, ${user?.firstName}. FinGenie AI is online. How can I assist your financial strategy today?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Speech Recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChatMsg(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      setIsListening(true);
      recognition.start();
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis || isMuted) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    fetchDashboardData();
    fetchChatHistory();
    fetchCreditScore();
  }, []);

  const fetchCreditScore = async () => {
    try {
      const res = await api.get('/banking/credit-score');
      if (res.data && res.data.score) {
        setCreditScore(res.data.score);
      }
    } catch (err) {
      console.error("Credit Score Fetch Error:", err);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const history = res.data.flatMap(h => [
          { role: 'user', text: h.query },
          { role: 'bot', text: h.response }
        ]);
        setChatHistory(prev => [prev[0], ...history]);
      }
    } catch (err) {
      console.error("Chat History Fetch Error:", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [accRes, transRes] = await Promise.all([
        api.get('/banking/my-account'),
        api.get('/banking/history')
      ]);
      setAccount(accRes.data);
      setTransactions(transRes.data || []);
    } catch (err) {
      console.error("DEBUG: Link Failure:", err.response || err);
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/banking/transfer', transferData);
      alert("Transfer Synchronized Successfully!");
      setShowTransfer(false);
      fetchDashboardData();
      setTransferData({ receiverAccountNumber: '', amount: '', description: '' });
    } catch (err) {
      alert(err.response?.data?.message || "Transfer Failed");
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/banking/deposit', { amount: Number(amount) });
      alert("Deposit Processed!");
      setShowDeposit(false);
      setAmount('');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Deposit Failed");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      await api.post('/banking/withdraw', { amount: Number(amount) });
      alert("Withdrawal Processed!");
      setShowWithdraw(false);
      setAmount('');
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Withdrawal Failed");
    }
  };

  const sendChat = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;

    const newMsg = { role: 'user', text: chatMsg };
    setChatHistory([...chatHistory, newMsg]);
    setChatMsg('');
    setIsTyping(true);

    try {
      const res = await api.post('/ai/chat', { message: chatMsg });
      const botResponse = res.data.response;
      setChatHistory(prev => [...prev, { role: 'bot', text: botResponse }]);
      speak(botResponse);
    } catch (err) {
      const errorMsg = "Neural uplink unstable. Using local cache: Your account is secure.";
      setChatHistory(prev => [...prev, { role: 'bot', text: errorMsg }]);
      speak(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FF] dark:bg-slate-900">
      <div className="text-center">
        <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
        <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Initializing Neural Core...</p>
      </div>
    </div>
  );

  const glassStyle = {
    background: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(20px)',
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)'
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FF] dark:bg-[#0F172A] text-[#111827] dark:text-gray-100 font-['Inter',_sans-serif] transition-colors duration-300 overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-indigo-200/40 dark:bg-indigo-900/20 blur-[140px] rounded-full pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-200/30 dark:bg-purple-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Modern Navigation */}
      <nav className="relative z-20 px-8 py-4 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-b border-white/40 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] p-2.5 rounded-2xl shadow-lg text-white">
              <Landmark size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#111827] dark:text-white">FinGenie <span className="text-[#6366F1]">AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-[#6B7280] dark:text-slate-400">
            <Link to="/dashboard" className="text-[#111827] dark:text-white relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[#6366F1] after:rounded-full">Overview</Link>
            <Link to="/loan" className="hover:text-[#111827] dark:hover:text-white transition-colors">Loan</Link>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 bg-white dark:bg-slate-800 border border-white dark:border-slate-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all text-gray-600 dark:text-indigo-400 shadow-sm"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={logout} className="p-2.5 bg-white dark:bg-slate-800 border border-white dark:border-slate-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-[#EF4444] shadow-sm"><LogOut size={20} /></button>
        </div>
      </nav>

      {/* Main Grid */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Wealth Summary */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h1 className="text-3xl font-black text-[#111827] dark:text-white tracking-tight">System Overview</h1>
              <p className="text-[#6B7280] dark:text-slate-400 font-medium mt-1">Operational integrity: <span className="text-[#10B981] font-bold uppercase tracking-wider text-xs ml-1">Optimal</span></p>
            </div>
          </div>

          {/* Master Balance Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#1E1B4B] to-[#4338CA] rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20 group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                <Landmark size={120} />
              </div>
              <div className="relative z-10">
                <p className="text-indigo-200 text-xs font-black uppercase tracking-[0.2em] mb-4">Total Liquidity</p>
                <h2 className="text-5xl font-black mb-10 tracking-tighter">${account?.balance?.toLocaleString() || '0.00'}</h2>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">Account Number</p>
                    <p className="font-mono text-lg font-bold letter-spacing-1">{account?.accountNumber ? account.accountNumber.replace(/(\d{4})/g, '$1 ') : 'Initializing...'}</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <Wallet size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Unified Action & Health Card */}
            <div style={glassStyle} className="rounded-[40px] p-8 flex flex-col justify-between border-indigo-200/50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black text-[#6B7280] dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Credit Health</p>
                  <h3 className="text-3xl font-black text-[#111827] dark:text-white tracking-tighter">{creditScore}</h3>
                  <div className="flex items-center gap-2 mt-1">
                  </div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-2xl text-[#8B5CF6] dark:text-purple-400">
                  <TrendingUp size={24} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowDeposit(true)}
                  className="flex flex-col items-center justify-center gap-3 p-5 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-3xl hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all group shadow-sm"
                >
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 text-[#10B981] rounded-xl group-hover:scale-110 transition-transform">
                    <ArrowDownCircle size={20} />
                  </div>
                  <span className="text-[10px] font-black text-[#111827] dark:text-white uppercase tracking-widest">Deposit</span>
                </button>
                <button 
                  onClick={() => setShowWithdraw(true)}
                  className="flex flex-col items-center justify-center gap-3 p-5 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-3xl hover:bg-red-50 dark:hover:bg-slate-700 transition-all group shadow-sm"
                >
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 text-[#EF4444] rounded-xl group-hover:scale-110 transition-transform">
                    <ArrowUpCircle size={20} />
                  </div>
                  <span className="text-[10px] font-black text-[#111827] dark:text-white uppercase tracking-widest">Withdraw</span>
                </button>
              </div>
            </div>
          </div>

          {/* Transaction Ledger */}
          <div style={glassStyle} className="p-8 rounded-[40px]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-[#6366F1] dark:text-indigo-400">
                  <History size={22} />
                </div>
                <h3 className="text-xl font-black text-[#111827] dark:text-white tracking-tight">Transactions</h3>
              </div>
            </div>

            <div className="space-y-1">
              {transactions.length === 0 ? (
                <div className="py-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">No transaction history detected</div>
              ) : (
                transactions.map((t, i) => {
                  const isIncoming = t.receiverAccountNumber === account?.accountNumber;
                  const isDeposit = t.transactionType === 'DEPOSIT';
                  const isCredit = isIncoming || isDeposit;
                  
                  const counterParty = isDeposit ? "Self-ATM" : 
                                      isIncoming ? (t.senderName || "Unknown Sender") : 
                                      (t.receiverName || "Unknown Receiver");

                  return (
                    <div key={i} className="flex items-center justify-between p-5 rounded-3xl hover:bg-white/40 dark:hover:bg-slate-800/50 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCredit ? 'bg-green-50 dark:bg-green-900/20 text-[#10B981]' : 'bg-red-50 dark:bg-red-900/20 text-[#EF4444]'}`}>
                          {isCredit ? <ArrowDownLeft size={20}/> : <ArrowUpRight size={20}/>}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#111827] dark:text-white text-sm">{counterParty}</p>
                          <p className="text-[10px] text-[#6B7280] dark:text-slate-500 font-black uppercase tracking-widest mt-0.5">
                            {t.transactionType} • {new Date(t.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-sm ${isCredit ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {isCredit ? '+' : '-'}${Number(t.amount).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-[#6B7280]/40 font-black uppercase tracking-widest">Confirmed</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant & Rapid Transfer */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Rapid Transfer Card */}
          <div style={glassStyle} className="p-8 rounded-[40px] border-none shadow-indigo-500/10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-[#6366F1] text-white rounded-2xl shadow-lg shadow-indigo-500/30">
                <Send size={22} />
              </div>
              <h3 className="text-xl font-black text-[#111827] dark:text-white tracking-tight">Rapid Transfer</h3>
            </div>
            
            <div className="flex justify-center mb-8">
              <div onClick={() => setShowQr(true)} className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-20 h-20 rounded-[24px] bg-white dark:bg-slate-800 border-2 border-dashed border-indigo-200 dark:border-slate-700 group-hover:border-[#6366F1] transition-all flex items-center justify-center text-[#6366F1] dark:text-indigo-400">
                  <QrCode size={32} />
                </div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">QR Pay</span>
              </div>
            </div>

            <button 
              onClick={() => setShowTransfer(true)}
              className="w-full py-4 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm tracking-wide"
            >
              INITIALIZE TRANSFER <ArrowRight size={18} />
            </button>
          </div>

          {/* AI Strategy Panel */}
          <div className="bg-[#1E1B4B] dark:bg-slate-950 rounded-[40px] p-8 text-white relative overflow-hidden min-h-[400px] flex flex-col border border-white/5">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Bot size={140} />
            </div>
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-xl">
                    {isSpeaking ? <Volume2 size={20} className="text-indigo-400 animate-pulse" /> : <Bot size={20} className="text-indigo-400" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                    {isSpeaking ? 'Genie is Speaking...' : 'FinGenie Assistant'}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setIsMuted(!isMuted);
                    if (!isMuted) window.speechSynthesis.cancel();
                  }}
                  className={`p-2 rounded-xl transition-all ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-indigo-300 hover:bg-white/10'}`}
                  title={isMuted ? "Unmute Genie" : "Mute Genie"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
              
              <div className="flex-1 space-y-6 mb-8 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {chatHistory.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-[24px] text-sm font-medium leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/10 text-indigo-50 rounded-tl-none border border-white/5'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isTyping && <div className="text-indigo-300 text-[10px] font-bold animate-pulse uppercase tracking-widest">Genie is analyzing...</div>}
              </div>

              <form onSubmit={sendChat} className="relative mt-auto">
                <input 
                  type="text" 
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Ask Genie anything..."} 
                  className={`w-full bg-white/10 dark:bg-slate-900/50 border border-white/10 dark:border-slate-800 rounded-2xl py-4 pl-5 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-indigo-300/40 dark:placeholder:text-slate-600 dark:text-white ${isListening ? 'ring-2 ring-indigo-500' : ''}`} 
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={toggleListening}
                    className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-indigo-300 hover:bg-white/20'}`}
                  >
                    <Mic size={18} />
                  </button>
                  <button type="submit" className="p-2.5 bg-indigo-500 rounded-xl hover:bg-indigo-400 transition-colors shadow-lg text-white">
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Modals with Dark Support */}
      {showTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#1E1B4B]/60 backdrop-blur-md">
          <div style={glassStyle} className="w-full max-w-[480px] dark:bg-slate-900 rounded-[40px] p-10 animate-in zoom-in-95 duration-300 dark:border-slate-800">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black tracking-tight dark:text-white">Rapid Transfer</h3>
              <button onClick={() => setShowTransfer(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors dark:text-white"><X size={24}/></button>
            </div>
            <form onSubmit={handleTransfer} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#6B7280] dark:text-slate-500 uppercase tracking-widest ml-1">Receiver Account Number</label>
                <input 
                  type="text" 
                  className="w-full bg-white/50 dark:bg-slate-800/50 border border-indigo-50 dark:border-slate-700 rounded-2xl py-4 px-6 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all dark:text-white"
                  value={transferData.receiverAccountNumber}
                  onChange={e => setTransferData({...transferData, receiverAccountNumber: e.target.value})}
                  placeholder="Enter 10-digit number"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#6B7280] dark:text-slate-500 uppercase tracking-widest ml-1">Transfer Amount ($)</label>
                <input 
                  type="number" 
                  className="w-full bg-white/50 dark:bg-slate-800/50 border border-indigo-50 dark:border-slate-700 rounded-2xl py-4 px-6 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all dark:text-white"
                  value={transferData.amount}
                  onChange={e => setTransferData({...transferData, amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
              <button type="submit" className="w-full py-5 bg-[#6366F1] text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 hover:brightness-110 transition-all tracking-wider text-xs">CONFIRM & EXECUTE</button>
            </form>
          </div>
        </div>
      )}

      {/* Deposit/Withdraw Modals */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#1E1B4B]/60 backdrop-blur-md">
          <div style={glassStyle} className="w-full max-w-[420px] dark:bg-slate-900 rounded-[40px] p-10 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black dark:text-white">Add Funds</h3>
              <button onClick={() => setShowDeposit(false)} className="dark:text-white"><X/></button>
            </div>
            <form onSubmit={handleDeposit} className="space-y-6">
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                placeholder="Deposit Amount ($)" 
                className="w-full bg-white/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700 rounded-2xl py-4 px-6 font-bold dark:text-white"
                required 
              />
              <button type="submit" className="w-full py-4 bg-green-500 text-white font-bold rounded-2xl shadow-lg">CONFIRM DEPOSIT</button>
            </form>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#1E1B4B]/60 backdrop-blur-md">
          <div style={glassStyle} className="w-full max-w-[420px] dark:bg-slate-900 rounded-[40px] p-10 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black dark:text-white">Withdraw Funds</h3>
              <button onClick={() => setShowWithdraw(false)} className="dark:text-white"><X/></button>
            </div>
            <form onSubmit={handleWithdraw} className="space-y-6">
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                placeholder="Withdrawal Amount ($)" 
                className="w-full bg-white/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700 rounded-2xl py-4 px-6 font-bold dark:text-white"
                required 
              />
              <button type="submit" className="w-full py-4 bg-red-500 text-white font-bold rounded-2xl shadow-lg">CONFIRM WITHDRAWAL</button>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#1E1B4B]/60 backdrop-blur-md">
          <div style={glassStyle} className="w-full max-w-[400px] dark:bg-slate-900 rounded-[40px] p-10 flex flex-col items-center dark:border-slate-800">
            <div className="w-full flex justify-between items-center mb-8">
              <h3 className="text-xl font-black dark:text-white">Pay by QR</h3>
              <button onClick={() => setShowQr(false)} className="dark:text-white"><X/></button>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-inner mb-8">
              <QrCode size={180} className="text-indigo-600" />
            </div>
            <p className="text-center text-sm font-medium text-gray-500 dark:text-slate-400 mb-8 px-4">
              Scan this QR code from any FinGenie device to instantly authorize a peer-to-peer transfer.
            </p>
            <button className="w-full py-4 bg-indigo-50 dark:bg-slate-800 text-[#6366F1] dark:text-indigo-400 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all">
              <Download size={20} /> SAVE CODE
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

const Dashboard = () => (
  <DashboardErrorBoundary>
    <DashboardContent />
  </DashboardErrorBoundary>
);

export default Dashboard;
