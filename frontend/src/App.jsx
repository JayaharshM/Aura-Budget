import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  PieChart as ChartIcon,
  Target,
  ArrowLeft,
  ArrowRightLeft,
  Search,
  Settings,
  User as UserIcon,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  LogOut,
  Sun,
  Moon,
  PlusCircle,
  Filter,
  Sparkles,
  RefreshCw,
  Send,
  Users,
  Check,
  X,
  History,
  Calendar,
  Bell,
  RotateCcw,
  Download,
  Palette,
  Sliders,
  Briefcase,
  GraduationCap,
  Coins,
  DollarSign,
  Euro,
  CircleDollarSign,
  User,
  Mic,
  MicOff,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  BarChart2
} from 'lucide-react';




import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import Auth from './components/Auth';

const API_URL = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';
const socket = io(SOCKET_URL);

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');

  // AI Insights State
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [dayDescription, setDayDescription] = useState('');
  const [isProcessingDay, setIsProcessingDay] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // Room State
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomBudgets, setRoomBudgets] = useState([]);
  const [roomTransactions, setRoomTransactions] = useState([]);
  const [roomCode, setRoomCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomLoading, setRoomLoading] = useState(false);
  const [dayRoomId, setDayRoomId] = useState('');
  const [commentText, setCommentText] = useState('');
  const [roomComments, setRoomComments] = useState([]);
  const [roomSettlements, setRoomSettlements] = useState([]);

  // Subscription State
  const [subscriptions, setSubscriptions] = useState([]);
  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subFrequency, setSubFrequency] = useState('monthly');
  const [subDate, setSubDate] = useState('');
  const [showSubForm, setShowSubForm] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [goals, setGoals] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');

  // Investment State
  const [investments, setInvestments] = useState([]);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [currentAssetPrice, setCurrentAssetPrice] = useState('');
  const [assetType, setAssetType] = useState('Stock');
  const [stockSuggestions, setStockSuggestions] = useState('');
  const [stockLoading, setStockLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [goalInsights, setGoalInsights] = useState({});
  const [loadingInsights, setLoadingInsights] = useState({});
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // AI Budget Builder State
  const [aiBudgetDescription, setAiBudgetDescription] = useState('');
  const [aiBudgetLoading, setAiBudgetLoading] = useState(false);
  const [aiBudgetResult, setAiBudgetResult] = useState(null);
  const [aiBudgetApplied, setAiBudgetApplied] = useState(false);

  // Forecast State
  const [forecastData, setForecastData] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');
  const [forecastDays, setForecastDays] = useState(3);

  // Diary State
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [diaryTab, setDiaryTab] = useState('new'); // 'new' or 'history'
  const [shares, setShares] = useState('');
  const [buyPrice, setBuyPrice] = useState('');


  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingPhase, setOnboardingPhase] = useState('intro'); // 'intro' or 'questions'
  const [introStep, setIntroStep] = useState(0);


  const [onboardingData, setOnboardingData] = useState({
    basics: { preferredName: '', occupation: 'employee', subOccupation: '', currency: 'USD' },
    income: { monthly: '', type: 'fixed', otherSources: '', savingsTarget: 20 },
    expenses: { type: 'fixed', hasLoans: false, loanDetails: '' },
    goals: { shortTerm: '', longTerm: '' },
    personalization: { preferences: '' }
  });






  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (token) {
      fetchTransactions();
      fetchBudgets();
      fetchRooms();
      fetchSubscriptions();
      fetchGoals();
      fetchInvestments();
      fetchDiaryEntries();
    }
  }, [token]);

  useEffect(() => {
    if (user && !user.onboardingCompleted) {
      setShowOnboarding(true);
    }
    if (user?.onboarding) {
      setOnboardingData(user.onboarding);
    }

    // Always start at Overview when identity changes or session starts
    setActiveTab('Overview');
    setSelectedRoom(null);
  }, [user?._id || user?.id]);


  // Socket Room Management
  useEffect(() => {
    if (user && token) {
      socket.emit('join_user_room', user._id || user.id);

      const handleRequestProcessed = (data) => {
        fetchRooms();
        if (data.status === 'accepted') {
          // No alert needed, fetchRooms() will update the UI silently
        }
      };

      socket.on('request_processed', handleRequestProcessed);

      return () => {
        socket.off('request_processed', handleRequestProcessed);
      };
    }
  }, [user, token]);

  useEffect(() => {
    if (selectedRoom) {
      socket.emit('join_room', selectedRoom._id);

      const handleNewComment = (newComments) => {
        setRoomComments(newComments);
      };

      const handleNewTransaction = () => {
        fetchRoomData(selectedRoom);
      };

      const handleJoinRequest = (data) => {
        // Only fetch if we are the admin of the room
        const currentUserId = user?._id || user?.id;
        const isAdmin = selectedRoom.admin?._id === currentUserId || selectedRoom.admin === currentUserId;
        if (isAdmin || selectedRoom._id === data.roomId) {
          fetchRoomData(selectedRoom);
        }
      };

      const handleRoomUpdate = (updatedRoom) => {
        if (selectedRoom && selectedRoom._id === updatedRoom._id) {
          setSelectedRoom(updatedRoom);
          if (updatedRoom.comments) setRoomComments(updatedRoom.comments);
        }
        setRooms(prev => prev.map(r => r._id === updatedRoom._id ? updatedRoom : r));
      };

      const handleRoomDeleted = (data) => {
        if (selectedRoom && selectedRoom._id === data.roomId) {
          setSelectedRoom(null);
          setActiveTab('Collaboration');
          fetchRooms();
        }
      };

      socket.on('new_comment', handleNewComment);
      socket.on('new_transaction', handleNewTransaction);
      socket.on('new_join_request', handleJoinRequest);
      socket.on('room_update', handleRoomUpdate);
      socket.on('room_deleted', handleRoomDeleted);

      return () => {
        socket.emit('leave_room', selectedRoom._id);
        socket.off('new_comment', handleNewComment);
        socket.off('new_transaction', handleNewTransaction);
        socket.off('new_join_request', handleJoinRequest);
        socket.off('room_update', handleRoomUpdate);
        socket.off('room_deleted', handleRoomDeleted);
      };
    }
  }, [selectedRoom, user]);





  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);

    // Reset all session states to prevent leakage from previous user
    setTransactions([]);
    setBudgets([]);
    setRooms([]);
    setGoals([]);
    setRoomBudgets([]);
    setRoomTransactions([]);
    setRoomComments([]);
    setSelectedRoom(null);
    setInvestments([]);
    setAiInsight('');
    setDiaryEntries([]);
    setGoalInsights({});
    setActiveTab('Overview');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Reset all session states
    setTransactions([]);
    setBudgets([]);
    setRooms([]);
    setGoals([]);
    setRoomBudgets([]);
    setRoomTransactions([]);
    setRoomComments([]);
    setSelectedRoom(null);
    setInvestments([]);
    setAiInsight('');
    setDiaryEntries([]);
    setActiveTab('Overview');

    // Reset onboarding state
    setShowOnboarding(false);
    setOnboardingStep(1);
    setOnboardingData({
      basics: { preferredName: '', occupation: 'employee', subOccupation: '', currency: 'USD' },
      income: { monthly: '', type: 'fixed', otherSources: '' },
      expenses: { type: 'fixed', hasLoans: false, loanDetails: '' },
      goals: { shortTerm: '', longTerm: '' },
      personalization: { preferences: '' }
    });
  };



  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      if (err.response?.status === 401) handleLogout();
    }
  };

  const exportTransactionsToPDF = () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(22);
    doc.setTextColor(124, 58, 237); // Aura Primary Color
    doc.text("Aura Budget Report", 14, 20);

    // Subtitle
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Detailed Transaction History - Generated on ${new Date().toLocaleDateString()}`, 14, 30);

    // Summary Info
    const monthlyBase = parseFloat(user?.onboarding?.income?.monthly) || 0;
    const extraIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = monthlyBase + extraIncome;

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    doc.setFontSize(10);
    doc.text(`Monthly Base: ${monthlyBase.toFixed(2)} | Additions: ${extraIncome.toFixed(2)}`, 14, 38);
    doc.text(`Total Income: ${totalIncome.toFixed(2)} | Total Expenses: ${totalExpenses.toFixed(2)} | Net: ${(totalIncome - totalExpenses).toFixed(2)}`, 14, 44);

    const tableColumn = ["Date", "Description", "Category", "Type", "Amount"];
    const tableRows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.title,
      t.category,
      t.type.toUpperCase(),
      { content: `${t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}`, styles: { textColor: t.type === 'expense' ? [239, 68, 68] : [34, 197, 94] } }
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { top: 45 }
    });

    doc.save(`aura_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const fetchBudgets = async () => {
    try {
      const res = await axios.get(`${API_URL}/budgets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBudgets(res.data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    }
  };

  const fetchForecast = async (days = 30) => {
    setForecastLoading(true);
    setForecastError('');
    try {
      const res = await axios.post(`${API_URL}/forecast`, { days }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForecastData(res.data);
    } catch (err) {
      console.error('Error fetching forecast:', err);
      setForecastError(err.response?.data?.message || 'Failed to load forecast. Please try again.');
    } finally {
      setForecastLoading(false);
    }
  };

  const fetchAiInsight = async (query = "") => {
    setAiLoading(true);
    try {
      const res = await axios.post(`${API_URL}/insights`, { query }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiInsight(res.data.text);
    } catch (err) {
      console.error('Error fetching AI insight:', err);
      const errorMsg = err.response?.data?.message || "AI Insights are currently unavailable. Please check your backend connection.";
      setAiInsight(errorMsg);
    } finally {
      setAiLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        let chunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          setIsProcessingDay(true);
          try {
            const res = await axios.post(`${API_URL}/ai/transcribe`, formData, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            });
            setDayDescription(res.data.text);
          } catch (err) {
            console.error('Transcription error:', err);
            alert('Failed to transcribe audio.');
          } finally {
            setIsProcessingDay(false);
          }

          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone.');
      }
    }
  };

  const fetchDiaryEntries = async () => {
    try {
      const res = await axios.get(`${API_URL}/diary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiaryEntries(res.data);
    } catch (err) {
      console.error('Error fetching diary entries:', err);
    }
  };

  const deleteDiaryEntry = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await axios.delete(`${API_URL}/diary/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDiaryEntries();
    } catch (err) {
      console.error('Error deleting diary entry:', err);
      alert('Failed to delete entry.');
    }
  };

  const processDayDescription = async () => {
    if (!dayDescription.trim()) return;
    setIsProcessingDay(true);

    // 1. Save the Journal Entry first (Historical Record)
    try {
      await axios.post(`${API_URL}/diary`, { text: dayDescription }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDiaryEntries();
    } catch (diaryErr) {
      console.error('Failed to save journal history:', diaryErr);
    }

    try {
      // 2. AI Parsing Context
      const res = await axios.post(`${API_URL}/ai/parse-day`, {
        description: dayDescription,
        rooms: rooms.map(r => ({ _id: r._id, name: r.name, code: r.code })),
        goals: goals.map(g => ({ _id: g._id, title: g.title }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { transactions: aiTrans, subscriptions: aiSubs, goals: aiGoals } = res.data;
      const sharedRoomNames = new Set();

      // 3. Process Transactions (Individual Success)
      if (aiTrans && aiTrans.length > 0) {
        for (const t of aiTrans) {
          try {
            await axios.post(`${API_URL}/transactions`, {
              title: t.title,
              amount: t.amount,
              type: t.type,
              category: t.category,
              ...(t.collaborationId ? { collaborationId: t.collaborationId } : {})
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (t.collaborationId) {
              const room = rooms.find(r => r._id === t.collaborationId);
              if (room) sharedRoomNames.add(room.name);
            }
          } catch (tErr) {
            console.error('Failed to post shared transaction:', t.title, tErr);
          }
        }
      }

      // 4. Process Subscriptions
      if (aiSubs && aiSubs.length > 0) {
        for (const s of aiSubs) {
          try {
            const nextDate = new Date();
            if (s.frequency === 'yearly') {
              nextDate.setFullYear(nextDate.getFullYear() + 1);
            } else {
              nextDate.setMonth(nextDate.getMonth() + 1);
            }

            await axios.post(`${API_URL}/subscriptions`, {
              ...s,
              nextBillingDate: nextDate.toISOString().split('T')[0]
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            await axios.post(`${API_URL}/transactions`, {
              title: `Subscription: ${s.name}`,
              amount: s.amount,
              type: 'expense',
              category: s.category || 'Other'
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (sErr) {
            console.error('Failed to process subscription:', s.name, sErr);
          }
        }
      }

      // 5. Process Goals
      if (aiGoals && aiGoals.length > 0) {
        for (const g of aiGoals) {
          try {
            if (g.type === 'contribute') {
              const existingGoal = goals.find(eg => eg.title.toLowerCase().trim() === g.title.toLowerCase().trim());
              if (existingGoal) {
                await axios.put(`${API_URL}/goals/${existingGoal._id}`, {
                  currentAmount: (existingGoal.currentAmount || 0) + (g.amount || 0),
                  contribution: g.amount || 0
                }, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                continue;
              }
            }

            await axios.post(`${API_URL}/goals`, {
              title: g.title,
              targetAmount: g.targetAmount || g.amount || 1000,
              currentAmount: 0
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (gErr) {
            console.error('Failed to process goal:', g.title, gErr);
          }
        }
      }

      const sharedRoomsList = [...sharedRoomNames].join(', ');
      // Analysis complete

      // Cleanup
      setDayDescription('');
      fetchTransactions();
      fetchSubscriptions();
      fetchGoals();
      if (selectedRoom && sharedRoomNames.has(rooms.find(r => r._id === selectedRoom._id)?.name)) {
        fetchRoomData(selectedRoom);
      }
    } catch (err) {
      console.error('AI Processing Error:', err);
      alert('Your entry was saved to history, but the financial analysis failed. You can still see your story in the History tab.');
    } finally {
      setIsProcessingDay(false);
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    const collabId = document.getElementById('collab-select')?.value;

    try {
      const res = await axios.post(`${API_URL}/transactions`, {
        title,
        amount: parseFloat(amount),
        type,
        category,
        collaborationId: collabId || null,
        date: new Date()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions([res.data, ...transactions]);
      setTitle('');
      setAmount('');
      setShowAddForm(false);
      if (collabId && selectedRoom?._id === collabId) {
        fetchRoomData(selectedRoom);
      }

    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${API_URL}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    const limit = parseFloat(amount);
    if (!category || !limit) return;

    try {
      const res = await axios.post(`${API_URL}/budgets`, {
        category,
        limit
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedBudgets = budgets.filter(b => b.category !== category);
      setBudgets([...updatedBudgets, res.data]);
      setAmount('');
      setShowBudgetForm(false);
    } catch (err) {
      console.error('Error setting budget:', err);
    }
  };

  const deleteBudget = async (id) => {
    try {
      await axios.delete(`${API_URL}/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBudgets(budgets.filter(b => b._id !== id));
    } catch (err) {
      console.error('Error deleting budget:', err);
    }
  };

  // --- Budget Room Functions ---

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    if (!roomName) return;
    try {
      await axios.post(`${API_URL}/rooms`, { name: roomName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoomName('');
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create room');
    }
  };

  const joinRoom = async (e) => {
    e.preventDefault();
    if (!roomCode) return;
    try {
      const res = await axios.post(`${API_URL}/rooms/join`, { code: roomCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoomCode('');
      setRoomCode('');
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join room');
    }
  };

  const handleRequest = async (roomId, requestId, status) => {
    try {
      const res = await axios.put(`${API_URL}/rooms/${roomId}/requests`, { requestId, status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedRoom = res.data;
      // Update the selected room in-place so the UI reflects the change immediately
      setSelectedRoom(updatedRoom);
      // Also sync the rooms list
      setRooms(prev => prev.map(r => r._id === updatedRoom._id ? updatedRoom : r));
    } catch (err) {
      console.error('Error handling request:', err);
      alert(err.response?.data?.message || 'Failed to handle request.');
    }
  };
  const deleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room? All data will be lost.')) return;
    try {
      await axios.delete(`${API_URL}/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedRoom(null);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const kickMember = async (roomId, userId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      const res = await axios.delete(`${API_URL}/rooms/${roomId}/members/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedRoom(res.data);
      setRooms(prev => prev.map(r => r._id === res.data._id ? res.data : r));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to kick member');
    }
  };

  const fetchRoomData = async (room) => {
    setRoomLoading(true);
    try {
      // 1. Fetch fresh room metadata first
      const roomRes = await axios.get(`${API_URL}/rooms/${room._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const freshRoom = roomRes.data;

      // Update selected room and synchronization list
      setSelectedRoom(freshRoom);
      setRooms(prev => prev.map(r => r._id === freshRoom._id ? freshRoom : r));

      // 2. Fetch budgets, transactions, and settlements in parallel
      const [budgetsRes, transRes, settleRes] = await Promise.all([
        axios.get(`${API_URL}/rooms/${room._id}/budgets`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/rooms/${room._id}/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/rooms/${room._id}/settle`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setRoomBudgets(budgetsRes.data);
      setRoomTransactions(transRes.data);
      setRoomSettlements(settleRes.data);
      setRoomComments(freshRoom.comments || []);
    } catch (err) {
      console.error('Error fetching room data:', err);
      // If unauthorized (e.g. kicked while away), fallback
      if (err.response?.status === 404 || err.response?.status === 403) {
        setSelectedRoom(null);
        fetchRooms();
      }
    } finally {
      setRoomLoading(false);
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!commentText || !selectedRoom) return;
    try {
      const res = await axios.post(`${API_URL}/rooms/${selectedRoom._id}/comments`, { text: commentText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoomComments(res.data);
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };


  const proposeRoomBudget = async (e) => {
    e.preventDefault();
    const limit = parseFloat(amount);
    if (!category || !limit || !selectedRoom) return;

    try {
      const res = await axios.post(`${API_URL}/rooms/${selectedRoom._id}/budgets`, {
        category,
        limit
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoomBudgets([...roomBudgets, res.data]);
      setAmount('');
      setShowBudgetForm(false);
    } catch (err) {
      console.error('Error adding room budget:', err);
    }
  };

  // --- Subscription Functions ---

  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get(`${API_URL}/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptions(res.data);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    }
  };

  const addSubscription = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/subscriptions`, {
        name: subName,
        amount: parseFloat(subAmount),
        frequency: subFrequency,
        nextBillingDate: subDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptions([...subscriptions, res.data]);
      setSubName('');
      setSubAmount('');
      setSubDate('');
      setShowSubForm(false);
    } catch (err) {
      console.error('Error adding subscription:', err);
    }
  };

  // --- Goal Functions ---

  const fetchGoals = async () => {
    try {
      const res = await axios.get(`${API_URL}/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(res.data);
    } catch (err) {
      console.error('Error fetching goals:', err);
    }
  };

  const addGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle || !goalTarget) return;
    try {
      const res = await axios.post(`${API_URL}/goals`, {
        title: goalTitle,
        targetAmount: parseFloat(goalTarget),
        currentAmount: parseFloat(goalCurrent) || 0,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals([res.data, ...goals]);
      setGoalTitle('');
      setGoalTarget('');
      setGoalCurrent('');
      setShowGoalForm(false);
    } catch (err) {
      console.error('Error adding goal:', err);
    }
  };

  const deleteGoal = async (id) => {
    try {
      await axios.delete(`${API_URL}/goals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(goals.filter(g => g._id !== id));
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  const updateGoalProgress = async (id, contributionAmount) => {
    try {
      const goal = goals.find(g => g._id === id);
      const newTotal = (goal?.currentAmount || 0) + contributionAmount;

      const res = await axios.put(`${API_URL}/goals/${id}`, {
        currentAmount: newTotal,
        contribution: contributionAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(goals.map(g => g._id === id ? res.data : g));
    } catch (err) {
      console.error('Error updating goal:', err);
    }
  };

  const estimateTimeRemaining = (goal) => {
    if (goal.currentAmount >= goal.targetAmount) return "Completed!";

    const income = parseFloat(user?.onboarding?.income?.monthly) || 0;
    const savingsTargetPercent = parseFloat(user?.onboarding?.income?.savingsTarget) || 20;

    // Monthly savings based on onboarding preference
    const plannedMonthlySavings = (income * savingsTargetPercent) / 100;

    // Refine based on actual spending nature (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSpending = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) > thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    const recentIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date) > thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    // Dynamic monthly saving potential: (Base Income + Extra Income) - Actual Spending
    const actualMonthlyPotential = (income + (recentIncome / (30 / 30))) - (recentSpending / (30 / 30));

    // Use the more conservative of the two, but at least 1 unit to avoid division by zero
    const monthlySavingRate = Math.max(1, Math.min(plannedMonthlySavings, actualMonthlyPotential));

    const remaining = goal.targetAmount - goal.currentAmount;
    const monthsRemaining = remaining / monthlySavingRate;

    if (monthsRemaining > 12) return `~${(monthsRemaining / 12).toFixed(1)} yrs`;
    if (monthsRemaining < 1) return `~${Math.ceil(monthsRemaining * 30)} days`;
    return `~${monthsRemaining.toFixed(1)} mos`;
  };

  const fetchGoalInsight = async (goalId) => {
    if (goalInsights[goalId]) return;
    setLoadingInsights(prev => ({ ...prev, [goalId]: true }));
    try {
      const res = await axios.post(`${API_URL}/ai/goal-insight`, { goalId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoalInsights(prev => ({ ...prev, [goalId]: res.data.text }));
    } catch (err) {
      console.error('Error fetching goal insight:', err);
      setGoalInsights(prev => ({ ...prev, [goalId]: 'Could not generate insights.' }));
    } finally {
      setLoadingInsights(prev => ({ ...prev, [goalId]: false }));
    }
  };

  const processingIds = React.useRef(new Set());

  useEffect(() => {
    if (activeTab === 'Goals' && goals.length > 0) {
      const fetchMissingInsights = async () => {
        for (const goal of goals) {
          if (goalInsights[goal._id] || loadingInsights[goal._id] || processingIds.current.has(goal._id)) continue;

          processingIds.current.add(goal._id);
          await fetchGoalInsight(goal._id);
          await new Promise(r => setTimeout(r, 800));
        }
      };
      fetchMissingInsights();
    }
  }, [activeTab, goals.length]);

  // --- Investment Functions ---

  const fetchInvestments = async () => {
    try {
      const res = await axios.get(`${API_URL}/investments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvestments(res.data);
    } catch (err) {
      console.error('Error fetching investments:', err);
    }
  };

  const addInvestment = async (e) => {
    e.preventDefault();
    if (!assetName || !shares || !buyPrice || !currentAssetPrice) return;
    try {
      const res = await axios.post(`${API_URL}/investments`, {
        assetName,
        symbol: selectedSymbol,
        shares: parseFloat(shares),
        amountInvested: parseFloat(shares) * parseFloat(buyPrice),
        currentPrice: parseFloat(currentAssetPrice),
        type: assetType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvestments([res.data, ...investments]);
      setAssetName('');
      setShares('');
      setBuyPrice('');
      setSearchQuery('');
      setSelectedSymbol('');
      setCurrentAssetPrice('');
      setAssetType('Stock');
      setShowInvestmentForm(false);
    } catch (err) {
      console.error('Error adding investment:', err);
    }
  };

  const deleteInvestment = async (id) => {
    try {
      await axios.delete(`${API_URL}/investments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvestments(investments.filter(inv => inv._id !== id));
    } catch (err) {
      console.error('Error deleting investment:', err);
    }
  };

  const updateInvestmentPrice = async (id, newPrice) => {
    try {
      const res = await axios.put(`${API_URL}/investments/${id}`, { currentPrice: newPrice }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvestments(prev => prev.map(inv => inv._id === id ? res.data : inv));
    } catch (err) {
      console.error('Error updating investment price:', err);
    }
  };

  const fetchStockSuggestions = async () => {
    setStockLoading(true);
    try {
      const res = await axios.post(`${API_URL}/ai/stock-suggestions`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStockSuggestions(res.data.text);
    } catch (err) {
      console.error('Error fetching stock suggestions:', err);
    } finally {
      setStockLoading(false);
    }
  };

  const searchStocks = async (query) => {
    if (!query) return;
    setIsSearching(true);
    setSearchError('');
    try {
      const res = await axios.get(`${API_URL}/stocks/search?keywords=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.length === 0) {
        setSearchError('No stocks found.');
      }
      setSearchResults(res.data);
    } catch (err) {
      console.error('Error searching stocks:', err);
      setSearchError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const fetchLivePrice = async (symbol) => {
    setIsPriceLoading(true);
    try {
      const res = await axios.get(`${API_URL}/stocks/price?symbol=${symbol}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentAssetPrice(res.data.price);
    } catch (err) {
      console.error('Error fetching live price:', err);
      alert('Could not fetch live price. Alpha Vantage might be rate limited.');
    } finally {
      setIsPriceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Investments' && investments.length > 0 && investments.every(inv => inv.currentPrice === 0)) {
      // Small optimization: only auto-refresh once if all prices are zero (initial load)
      refreshAllPrices();
    }
  }, [activeTab, investments.length, token]);

  const refreshAllPrices = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      for (const inv of investments) {
        if (inv.symbol && (inv.type === 'Stock' || inv.type === 'Crypto')) {
          try {
            const res = await axios.get(`${API_URL}/stocks/price?symbol=${inv.symbol}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.price) {
              updateInvestmentPrice(inv._id, res.data.price);
            }
          } catch (e) {
            console.error(`Auto-refresh failed for ${inv.symbol}:`, e);
          }
          // Wait to respect Alpha Vantage free tier rate limits (5 calls/min)
          await new Promise(r => setTimeout(r, 12000));
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // --- Onboarding Functions ---

  const submitOnboarding = async () => {
    try {
      const res = await axios.post(`${API_URL}/user/onboarding`, onboardingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowOnboarding(false);
      setOnboardingStep(1);
      setOnboardingPhase('intro');
      setIntroStep(0);
      const updatedUser = { ...user, onboardingCompleted: true, onboarding: res.data.onboarding };


      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error saving onboarding:', err);
    }
  };

  const updatePreferences = async () => {
    try {
      const res = await axios.post(`${API_URL}/user/onboarding`, onboardingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = { ...user, onboarding: res.data.onboarding };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowPreferences(false);
    } catch (err) {
      console.error('Error updating preferences:', err);
      alert('Failed to update preferences.');
    }
  };

  const handleResetAccount = async (e) => {
    e.preventDefault();
    if (resetConfirmText !== 'RESET') {
      alert('Please type RESET to confirm.');
      return;
    }

    try {
      await axios.post(`${API_URL}/user/reset`, { password: resetPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear all local data
      setTransactions([]);
      setBudgets([]);
      setRooms([]);
      setRoomBudgets([]);
      setRoomTransactions([]);
      setSubscriptions([]);
      setAiInsight('');

      // Setup onboarding again
      const updatedUser = { ...user, onboardingCompleted: false };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setShowResetModal(false);
      setResetConfirmText('');
      setResetPassword('');
      setOnboardingStep(1);
      setOnboardingPhase('intro');
      setIntroStep(0);
      setShowOnboarding(true);


      alert('Account has been completely reset.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error resetting account');
    }
  };


  const deleteSubscription = async (id) => {

    try {
      await axios.delete(`${API_URL}/subscriptions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptions(subscriptions.filter(s => s._id !== id));
    } catch (err) {
      console.error('Error deleting subscription:', err);
    }
  };


  // Removed approveRoomBudget as it's no longer needed


  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  const getCurrencySymbol = () => {
    const code = user?.onboarding?.basics?.currency || 'USD';
    const symbols = { 'USD': '$', 'INR': '₹', 'EUR': '€', 'GBP': '£', 'JPY': '¥' };
    return symbols[code] || '$';
  };

  const currencySymbol = getCurrencySymbol();
  const displayName = user?.onboarding?.basics?.preferredName || user?.name || 'User';

  const totalIncome = (parseFloat(user?.onboarding?.income?.monthly) || 0) + transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  const categoryTotals = transactions
    .filter(t => t.type === 'expense' && !t.collaborationId)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const chartData = [
    { name: 'Income', value: totalIncome, color: '#10b981' },
    { name: 'Expense', value: totalExpense, color: '#f43f5e' }
  ].filter(d => d.value > 0);

  const budgetChartData = budgets.map(b => ({
    category: b.category,
    limit: b.limit,
    spent: categoryTotals[b.category] || 0
  }));

  const expenseCategoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
  }));

  const dailyExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const key = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[key] = (acc[key] || 0) + t.amount;
      return acc;
    }, {});

  const dailyChartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      date: label,
      amount: dailyExpenses[label] || 0
    };
  });

  const balanceChartData = [
    { name: 'Remaining', value: Math.max(0, balance), color: 'var(--primary)' },
    { name: 'Spent', value: totalExpense, color: 'var(--color-expense)' }
  ];

  const EXPENSE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#a855f7', '#06b6d4', '#ec4899'];

  const SidebarItem = ({ icon: Icon, label }) => (
    <div
      className={`nav-item ${activeTab === label ? 'active' : ''}`}
      onClick={() => setActiveTab(label)}
    >
      <Icon size={20} />
      <span>{label}</span>
    </div>
  );

  // --- Screen Renderers ---

  const renderOverviewScreen = () => (
    <div className="dashboard-grid">
      {/* Financial Summary Cards */}
      <div className="card full-width" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={14} /> Total Monthly Income
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{currencySymbol}{totalIncome.toLocaleString()}</div>
          <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
            {currencySymbol}{(parseFloat(user?.onboarding?.income?.monthly) || 0).toLocaleString()} (Base) + {currencySymbol}{(totalIncome - (parseFloat(user?.onboarding?.income?.monthly) || 0)).toLocaleString()} (Additions)
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingDown size={14} /> Total Expenses
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{currencySymbol}{totalExpense.toLocaleString()}</div>
          <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Personal and shared spending</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Wallet size={14} /> Current Balance
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{currencySymbol}{balance.toLocaleString()}</div>
          <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Remaining for the month</span>
        </div>
      </div>

      <div className="card one-third">
        <div className="card-header">
          <h2>Income vs Spent</h2>
        </div>
        <div style={{ height: 200, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={balanceChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {balanceChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '0.5rem' }}
                itemStyle={{ color: 'var(--text-primary)' }}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{Math.round((balance / totalIncome) * 100) || 0}%</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Remaining</div>
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span>Balance: <strong>{currencySymbol}{balance.toLocaleString()}</strong></span>
          <span>Income: <strong>{currencySymbol}{totalIncome.toLocaleString()}</strong></span>
        </div>
      </div>

      <div className="card one-third">
        <div className="card-header">
          <h2>Expense Allocation</h2>
        </div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={expenseCategoryData} innerRadius={0} outerRadius={80} dataKey="value">
                {expenseCategoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '0.5rem' }}
                itemStyle={{ color: 'var(--text-primary)' }}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
          {expenseCategoryData.slice(0, 4).map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }} />
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Spent This Month: </span>
          <span style={{ fontWeight: 700 }}>{currencySymbol}{totalExpense.toLocaleString()}</span>
        </div>
      </div>

      <div className="card one-third">
        <div className="card-header">
          <h2>Daily Expenses</h2>
        </div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} width={30} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '0.5rem' }}
                itemStyle={{ color: 'var(--text-primary)' }}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="amount" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Spending trend (Last 7 days)</p>
      </div>

      <div className="card full-width">
        <div className="card-header">
          <h2>Recent Activity</h2>
          <span className="action" onClick={() => setActiveTab('Transactions')}>See all activity</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {transactions.slice(0, 5).map((t) => (
                <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>
                    {t.title}
                    <span className={t.collaborationId ? 'collab-badge' : 'personal-badge'}>
                      {t.collaborationId ? 'Shared' : 'Personal'}
                    </span>


                  </td>
                  <td style={{ padding: '1rem' }}><span style={{ padding: '3px 8px', borderRadius: '10px', background: 'var(--bg-hover)', fontSize: '0.7rem' }}>{t.category}</span></td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: t.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)' }}>{t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );



  const generateAIBudgetFromDescription = async () => {
    if (!aiBudgetDescription.trim()) return;
    setAiBudgetLoading(true);
    setAiBudgetResult(null);
    setAiBudgetApplied(false);
    try {
      const res = await axios.post(`${API_URL}/ai/suggest-budget`, {
        description: aiBudgetDescription
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiBudgetResult(res.data);
    } catch (err) {
      console.error('AI budget error:', err);
      alert(err.response?.data?.message || 'Failed to generate AI budget.');
    } finally {
      setAiBudgetLoading(false);
    }
  };

  const applyAIBudget = async () => {
    if (!aiBudgetResult?.budgets) return;
    try {
      for (const b of aiBudgetResult.budgets) {
        if (!b.category || !b.limit) continue;
        await axios.post(`${API_URL}/budgets`, {
          category: b.category,
          limit: b.limit
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setAiBudgetApplied(true);
      fetchBudgets();
    } catch (err) {
      console.error('Apply budget error:', err);
      alert('Failed to apply budget. Please try again.');
    }
  };

  const renderBudgetsScreen = () => {
    const CATEGORY_COLORS = {
      Food: '#f59e0b', Rent: '#8b5cf6', Transport: '#3b82f6',
      Entertainment: '#ec4899', Savings: '#10b981', Subscriptions: '#06b6d4',
      Other: '#6b7280', Salary: '#22c55e'
    };


    return (
      <div className="dashboard-grid">

        {/* === AI Budget Builder === */}
        <div className="card full-width" style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} color="white" />
              </div>
              <div>
                <h2 style={{ margin: 0 }}>AI Budget Builder</h2>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Describe your financial goals — AI analyzes your real spending to craft a personalized plan</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Left: Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Describe your budget goals</label>
                <textarea
                  value={aiBudgetDescription}
                  onChange={(e) => setAiBudgetDescription(e.target.value)}
                  placeholder="e.g. I want to reduce food spending and save at least 30% of my income. I have a car loan and need to set aside money for a vacation..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={generateAIBudgetFromDescription}
                disabled={aiBudgetLoading || !aiBudgetDescription.trim()}
                style={{ padding: '0.875rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {aiBudgetLoading
                  ? <><RefreshCw size={17} className="animate-spin" /> Analyzing your finances...</>
                  : <><Sparkles size={17} /> Generate Smart Budget</>}
              </button>
            </div>

            {/* Right: AI Result */}
            <div>
              {!aiBudgetResult && !aiBudgetLoading && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                  <div style={{ fontSize: '3rem', opacity: 0.3 }}>✨</div>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>Your personalized AI budget will appear here.<br />It analyzes your real transactions, subscriptions &amp; goals.</p>
                </div>
              )}

              {aiBudgetLoading && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center' }}>
                  <RefreshCw size={32} className="animate-spin" color="var(--primary)" />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>AI is analyzing your spending patterns...</p>
                </div>
              )}

              {aiBudgetResult && !aiBudgetLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                  {/* Summary box */}
                  {aiBudgetResult.summary && (
                    <div style={{ padding: '1rem', borderRadius: '10px', background: 'var(--primary-light)', border: '1px solid', borderColor: 'color-mix(in srgb, var(--primary) 30%, transparent)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <Sparkles size={14} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>AI Analysis</span>
                        {aiBudgetResult.savingsRate && (
                          <span style={{ marginLeft: 'auto', background: '#10b981', color: 'white', borderRadius: '12px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}>
                            {aiBudgetResult.savingsRate}% Savings Rate
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{aiBudgetResult.summary}</p>
                    </div>
                  )}

                  {/* Category cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', flex: 1, overflowY: 'auto', maxHeight: '240px' }}>
                    {(aiBudgetResult.budgets || []).map((b, i) => (
                      <div key={i} style={{
                        padding: '0.75rem',
                        borderRadius: '10px',
                        background: 'var(--bg-hover)',
                        border: `1px solid ${CATEGORY_COLORS[b.category] || '#6b7280'}30`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: CATEGORY_COLORS[b.category] || 'var(--text-primary)' }}>{b.category}</span>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{currencySymbol}{(b.limit || 0).toLocaleString()}</span>
                        </div>
                        {b.reason && <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{b.reason}</p>}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      className="btn btn-primary"
                      onClick={applyAIBudget}
                      disabled={aiBudgetApplied}
                      style={{ flex: 1, padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      {aiBudgetApplied
                        ? <><CheckCircle2 size={16} /> Applied!</>
                        : <><Check size={16} /> Apply This Budget</>}
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => { setAiBudgetResult(null); setAiBudgetApplied(false); }}
                      style={{ padding: '0.75rem 1rem' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === Budget Chart === */}
        <div className="card two-thirds">
          <div className="card-header">
            <h2>Budget Distribution</h2>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(v) => `${currencySymbol}${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '0.5rem' }}
                  formatter={(val) => [`${currencySymbol}${val}`, '']}
                />
                <Legend />
                <Bar dataKey="spent" name="Spent" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="limit" name="Limit" fill="var(--bg-hover)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* === Manual Budget Form === */}
        <div className="card one-third">
          <div className="card-header">
            <h2>Set Budget Manually</h2>
          </div>
          <form onSubmit={handleSetBudget}>
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Food">Food</option>
                <option value="Rent">Rent</option>
                <option value="Transport">Transport</option>
                <option value="Salary">Salary</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Subscriptions">Subscriptions</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Monthly Limit ({currencySymbol})</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Save Budget</button>
          </form>
        </div>

        {/* === Current Budgets === */}
        <div className="card full-width">
          <div className="card-header">
            <h2>Active Budgets</h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{budgets.length} budget{budgets.length !== 1 ? 's' : ''} set</span>
          </div>
          {budgets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <ChartIcon size={48} style={{ opacity: 0.15, marginBottom: '1rem' }} />
              <p>No budgets yet. Use the AI builder or set one manually.</p>
            </div>
          ) : (
            <div className="progress-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {budgets.map((budget) => {
                const spent = categoryTotals[budget.category] || 0;
                const percent = Math.min((spent / budget.limit) * 100, 100);
                const isOver = spent > budget.limit;
                const catColor = CATEGORY_COLORS[budget.category] || 'var(--primary)';
                return (
                  <div key={budget._id} className="card" style={{ background: 'var(--bg-hover)', border: `1px solid ${catColor}25`, position: 'relative', padding: '1.25rem' }}>
                    <button
                      onClick={() => deleteBudget(budget._id)}
                      style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6 }}
                    >
                      <Trash2 size={15} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: catColor, flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, fontSize: '1rem', paddingRight: '1.5rem' }}>{budget.category}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Spent</span>
                      <span style={{ color: isOver ? 'var(--color-expense)' : 'var(--text-primary)', fontWeight: 700, fontSize: '1.05rem' }}>
                        {currencySymbol}{spent.toLocaleString()} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.82rem' }}>/ {currencySymbol}{budget.limit.toLocaleString()}</span>
                      </span>
                    </div>
                    <div style={{ borderRadius: '6px', background: 'var(--bg-card)', height: '8px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        style={{ height: '100%', background: isOver ? 'var(--color-expense)' : catColor, borderRadius: '6px' }}
                      />
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: isOver ? 'var(--color-expense)' : 'var(--text-secondary)' }}>
                      {isOver ? `⚠ Over by ${currencySymbol}${(spent - budget.limit).toLocaleString()}` : `${currencySymbol}${(budget.limit - spent).toLocaleString()} remaining (${Math.round(100 - percent)}%)`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGoalsScreen = () => (
    <div className="dashboard-grid">
      <div className="card full-width" style={{ border: 'none', background: 'transparent', padding: '0' }}>
        <div className="card-header" style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Target size={24} color="var(--primary)" />
            <h2>Financial Goals</h2>
          </div>
          <button className="btn btn-primary" onClick={() => setShowGoalForm(true)}><Plus size={18} /> Add New Goal</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {goals.map((goal) => {
            const percent = (goal.currentAmount / goal.targetAmount) * 100;
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            return (
              <div key={goal._id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="checkbox" style={{ color: isCompleted ? 'var(--color-income)' : 'var(--text-muted)' }}>
                      {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{goal.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Progress: {currencySymbol}{goal.currentAmount.toLocaleString()} / {currencySymbol}{goal.targetAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        const amountToAdd = prompt(`How much would you like to contribute to "${goal.title}"?`, '0');
                        if (amountToAdd !== null && !isNaN(parseFloat(amountToAdd)) && parseFloat(amountToAdd) > 0) {
                          updateGoalProgress(goal._id, parseFloat(amountToAdd));
                        }
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      Contribute
                    </button>
                    <button
                      onClick={() => confirm('Delete this goal?') && deleteGoal(goal._id)}
                      style={{ color: 'var(--color-expense)', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="progress-track" style={{ height: '12px', background: 'var(--bg-hover)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percent, 100)}%` }}
                    className="progress-fill"
                    style={{ background: isCompleted ? 'var(--color-income)' : 'var(--primary)', height: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-hover)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isCompleted ? 'var(--color-income)' : 'var(--text-primary)' }}>{Math.round(percent)}%</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completion</div>
                  </div>
                  <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-hover)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Clock size={18} /> {estimateTimeRemaining(goal)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Time</div>
                  </div>
                </div>

                <div style={{ flex: 1, borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Sparkles size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Aura's Advice</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {loadingInsights[goal._id] ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Aura is thinking...</span>
                      </div>
                    ) : (
                      <div style={{ fontStyle: 'italic' }}>
                        {goalInsights[goal._id] || 'Waiting for data analysis...'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {goals.length === 0 && (
            <div className="card full-width" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
              <Target size={64} style={{ opacity: 0.1, marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem' }}>Your financial map is empty. Add a goal to see Aura's magic!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDailyDiaryScreen = () => (
    <div className="dashboard-grid">
      <div className="card full-width" style={{ padding: '0' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setDiaryTab('new')}
            style={{
              flex: 1,
              padding: '1.25rem',
              background: diaryTab === 'new' ? 'var(--bg-hover)' : 'transparent',
              border: 'none',
              borderBottom: diaryTab === 'new' ? '2px solid var(--primary)' : 'none',
              color: diaryTab === 'new' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: diaryTab === 'new' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            New Entry
          </button>
          <button
            onClick={() => setDiaryTab('history')}
            style={{
              flex: 1,
              padding: '1.25rem',
              background: diaryTab === 'history' ? 'var(--bg-hover)' : 'transparent',
              border: 'none',
              borderBottom: diaryTab === 'history' ? '2px solid var(--primary)' : 'none',
              color: diaryTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: diaryTab === 'history' ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Entry History
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {diaryTab === 'new' ? (
            <>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <History size={24} color="var(--primary)" />
                  <h2>Daily Journal</h2>
                </div>
                <button
                  onClick={toggleRecording}
                  className={`btn ${isRecording ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                  }}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                  {isRecording ? 'Recording...' : 'Voice Input'}
                </button>
              </div>
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Tell Aura what happened today. We'll automatically extract transactions, set goals, or track subscriptions for you.
              </p>
              <div className="form-group">
                <textarea
                  rows="8"
                  placeholder="I spent 50 on breakfast. Added 200 for groceries to our Home Expenses room..."
                  value={dayDescription}
                  onChange={(e) => setDayDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    resize: 'none'
                  }}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={processDayDescription}
                disabled={isProcessingDay || !dayDescription.trim()}
                style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem' }}
              >
                {isProcessingDay ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
                {isProcessingDay ? 'Analyzing Story...' : 'Save & Analyze Entry'}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card-header">
                <h2>Past Journal Entries</h2>
              </div>
              {diaryEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  <History size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                  <p>Your journal history is empty. Start writing today!</p>
                </div>
              ) : (
                diaryEntries.map((entry) => (
                  <div key={entry._id} style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} />
                        {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span>{new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button
                          onClick={() => deleteDiaryEntry(entry._id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-expense)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                          title="Delete entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p style={{ lineHeight: '1.6', fontSize: '1rem', color: 'var(--text-primary)' }}>{entry.text}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderInsightsScreen = () => (
    <div className="dashboard-grid">
      <div className="card full-width">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={24} color="#a855f7" />
            <h2>Personal Financial Insights</h2>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => fetchAiInsight()}
            disabled={aiLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} className={aiLoading ? 'animate-spin' : ''} />
            Recalculate Insights
          </button>
        </div>

        <div className="insight-content" style={{
          background: 'var(--bg-hover)',
          padding: '2rem',
          borderRadius: '1rem',
          minHeight: '300px',
          lineHeight: '1.6',
          fontSize: '0.95rem'
        }}>
          {aiLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-secondary)' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <RefreshCw size={40} />
              </motion.div>
              <p>Gemini is analyzing your finances...</p>
            </div>
          ) : aiInsight ? (
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiInsight}</ReactMarkdown>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', paddingTop: '2rem' }}>
              <Sparkles size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
              <p>Click "Recalculate Insights" to generate personalized financial advice based on your transactions and budgets.</p>
            </div>
          )}
        </div>
      </div>

      <div className="card full-width" style={{ marginTop: '1rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={20} color="var(--primary)" />
            <h2>Ask your Financial Assistant</h2>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="e.g., How can I reduce my food expenses this month?"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-hover)' }}
            onKeyPress={(e) => e.key === 'Enter' && fetchAiInsight(aiQuery)}
          />
          <button
            className="btn btn-primary"
            onClick={() => fetchAiInsight(aiQuery)}
            disabled={aiLoading || !aiQuery.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.5rem' }}
          >
            <Send size={18} />
            Ask
          </button>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Tip: You can ask specific questions about your spending habits, debt management, or saving goals.
        </p>
      </div>
    </div>
  );


  const renderTransactionsScreen = () => (
    <div className="card full-width">
      <div className="card-header">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <h2>Transaction History</h2>

        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          <PlusCircle size={18} style={{ marginRight: '6px' }} />
          Add Transaction
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Title</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Category</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Date</th>
              <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '1rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.25rem 1rem', fontWeight: 600 }}>
                  {t.title}
                  <span className={t.collaborationId ? 'collab-badge' : 'personal-badge'}>
                    {t.collaborationId ? 'Shared' : 'Personal'}
                  </span>


                </td>
                <td style={{ padding: '1.25rem 1rem' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'var(--bg-hover)', fontSize: '0.75rem', fontWeight: 600 }}>{t.category}</span>
                </td>
                <td style={{ padding: '1.25rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(t.date).toLocaleDateString()}</td>
                <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: 700, color: t.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)' }}>
                  {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
                </td>
                <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                  <button onClick={() => deleteTransaction(t._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInvestmentsScreen = () => {
    const totalInvested = investments.reduce((acc, inv) => acc + inv.amountInvested, 0);
    const currentValue = investments.reduce((acc, inv) => acc + (inv.shares * inv.currentPrice), 0);
    const totalProfit = currentValue - totalInvested;
    const profitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return (
      <div className="dashboard-grid">
        <div className="card one-third" style={{ background: 'var(--primary)', color: 'white' }}>
          <h3>Total Portfolio Value</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0' }}>${currentValue.toLocaleString()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {totalProfit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <span style={{ fontWeight: 600 }}>
              {totalProfit >= 0 ? '+' : ''}${Math.abs(totalProfit).toLocaleString()} ({profitPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="card two-thirds">
          <div className="card-header">
            <h2>Your Investments</h2>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className={`btn btn-outline btn-sm ${isRefreshing ? 'loading' : ''}`}
                onClick={refreshAllPrices}
                disabled={isRefreshing}
              >
                <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} style={{ marginRight: '6px' }} />
                {isRefreshing ? 'Updating...' : 'Refresh Prices'}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowInvestmentForm(true)}>
                <Plus size={16} /> Add Asset
              </button>
            </div>
          </div>
          <div className="investment-list">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Asset</th>
                  <th style={{ padding: '1rem' }}>Shares</th>
                  <th style={{ padding: '1rem' }}>Cost Basis</th>
                  <th style={{ padding: '1rem' }}>Current Price</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Total Value</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Profit/Loss</th>
                  <th style={{ padding: '1rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {investments.map(inv => {
                  const currentHoldingValue = inv.shares * inv.currentPrice;
                  const profit = currentHoldingValue - inv.amountInvested;
                  const pPercent = inv.amountInvested > 0 ? (profit / inv.amountInvested) * 100 : 0;
                  return (
                    <tr key={inv._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>{inv.assetName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{inv.symbol || inv.type}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>{inv.shares}</td>
                      <td style={{ padding: '1rem' }}>${inv.amountInvested.toLocaleString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 600 }}>${inv.currentPrice.toLocaleString()}</span>
                          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                          </motion.div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                        ${currentHoldingValue.toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: profit >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
                        {profit >= 0 ? '+' : '-'}${Math.abs(profit).toLocaleString()} ({pPercent.toFixed(1)}%)
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button onClick={() => deleteInvestment(inv._id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {investments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <TrendingUp size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                <p>No investments tracked yet. Click "Add Asset" to start monitoring your portfolio.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card full-width" style={{ marginTop: '2rem' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Sparkles size={24} color="#a855f7" />
              <h2>AI Stock Suggestions</h2>
            </div>
            <button
              className="btn btn-outline"
              onClick={fetchStockSuggestions}
              disabled={stockLoading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} className={stockLoading ? 'animate-spin' : ''} />
              {stockSuggestions ? 'Refresh Suggestions' : 'Get Top 5 Stocks'}
            </button>
          </div>

          <div className="insight-content" style={{
            background: 'var(--bg-hover)',
            padding: '2rem',
            borderRadius: '1rem',
            minHeight: '200px',
            lineHeight: '1.6',
            fontSize: '0.95rem',
            marginTop: '1rem'
          }}>
            {stockLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-secondary)', padding: '2rem' }}>
                <RefreshCw size={40} className="spin" />
                <p>Analyzing your income and market trends...</p>
              </div>
            ) : stockSuggestions ? (
              <div
                className="markdown-body"
                style={{
                  color: 'var(--text-primary)',
                  maxWidth: '800px',
                  margin: '0 auto'
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{stockSuggestions}</ReactMarkdown>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                <TrendingUp size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                <p>Click "Get Top 5 Stocks" to see summarized picks based on your budget.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderForecastScreen = () => {
    const summary = forecastData?.summary || {};
    const forecast = forecastData?.forecast || [];

    // Build weekly bar chart data (group by week)
    const weeklyData = [];
    if (forecast.length > 0) {
      for (let w = 0; w < Math.ceil(forecast.length / 7); w++) {
        const week = forecast.slice(w * 7, w * 7 + 7);
        const total = week.reduce((s, d) => s + d.predicted, 0);
        weeklyData.push({
          name: `Week ${w + 1}`,
          spending: Math.round(total)
        });
      }
    }

    return (
      <div className="dashboard-grid">
        {/* Controls */}
        <div className="card full-width" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <BarChart2 size={22} color="var(--primary)" />
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>Forecast Period:</span>
          {[3, 6, 9].map(d => (
            <button
              key={d}
              className={`btn ${forecastDays === d ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              onClick={() => { setForecastDays(d); fetchForecast(d); }}
            >
              {d} Days
            </button>
          ))}
          <button
            className="btn btn-outline"
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            onClick={() => fetchForecast(forecastDays)}
            disabled={forecastLoading}
          >
            <RefreshCw size={15} className={forecastLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {forecastLoading && (
          <div className="card full-width" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3rem', flexDirection: 'column' }}>
            <RefreshCw size={32} className="animate-spin" color="var(--primary)" />
            <p style={{ color: 'var(--text-secondary)' }}>Running ML model forecast…</p>
          </div>
        )}

        {forecastError && (
          <div className="card full-width" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-expense)', fontWeight: 600 }}>⚠ {forecastError}</p>
          </div>
        )}

        {!forecastLoading && forecastData && (
          <>
            {/* Summary Cards */}
            <div className="card full-width" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Total Predicted Spend</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{currencySymbol}{(summary.totalPredicted || 0).toLocaleString()}</div>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Next {forecastDays} days</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Avg Daily Spend</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{currencySymbol}{(summary.avgDaily || 0).toLocaleString()}</div>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Per day average</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Peak Spending Day</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  {summary.peakDay?.date ? new Date(summary.peakDay.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </div>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                  {currencySymbol}{(summary.peakDay?.predicted || 0).toLocaleString()} predicted
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Monthly Budget (Base)</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                  {currencySymbol}{(parseFloat(user?.onboarding?.income?.monthly) || 0).toLocaleString()}
                </div>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Your monthly income</span>
              </div>
            </div>

            {/* 30-day Area Chart */}
            <div className="card full-width">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <TrendingUp size={22} color="var(--primary)" />
                  <h2>Daily Spending Forecast</h2>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Powered by ML Model (RandomForest)</span>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={forecast} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                    tickFormatter={(v) => new Date(v + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    interval={Math.floor(forecast.length / 6)}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(v) => `${currencySymbol}${v.toLocaleString()}`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                    formatter={(val) => [`${currencySymbol}${val.toLocaleString()}`, 'Predicted Spend']}
                    labelFormatter={(label) => new Date(label + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  />
                  <ReferenceLine y={summary.avgDaily} stroke="rgba(124,58,237,0.5)" strokeDasharray="5 5" label={{ value: 'Avg', position: 'right', fill: 'var(--primary)', fontSize: 11 }} />
                  <Area type="monotone" dataKey="predicted" stroke="var(--primary)" strokeWidth={2.5} fill="url(#forecastGrad)" dot={false} activeDot={{ r: 5, fill: 'var(--primary)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Bar Chart */}
            <div className="card" style={{ flex: 1 }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <BarChart2 size={20} color="var(--primary)" />
                  <h2>Daily Breakdown</h2>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={forecast} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                    tickFormatter={(v) => new Date(v + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(v) => `${currencySymbol}${v.toLocaleString()}`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                    formatter={(val) => [`${currencySymbol}${val.toLocaleString()}`, 'Predicted Spend']}
                    labelFormatter={(label) => new Date(label + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  />
                  <Bar dataKey="predicted" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>


            {/* Forecast Table */}
            <div className="card" style={{ flex: 1 }}>
              <div className="card-header">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar size={20} color="var(--primary)" /> Daily Forecast Table
                </h2>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Day</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Predicted</th>
                      <th style={{ textAlign: 'right', padding: '0.5rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>vs Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.map((row, idx) => {
                      const diff = row.predicted - (summary.avgDaily || 0);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-hover)' }}>
                          <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)' }}>
                            {new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{row.dayOfWeek}</td>
                          <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {currencySymbol}{row.predicted.toLocaleString()}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600, color: diff > 0 ? 'var(--color-expense)' : 'var(--color-income)', fontSize: '0.8rem' }}>
                            {diff >= 0 ? '+' : ''}{currencySymbol}{Math.abs(diff).toFixed(0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!forecastLoading && !forecastData && !forecastError && (
          <div className="card full-width" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart2 size={32} color="white" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem' }}>Ready to Forecast</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Click below to run the ML model and generate a spending forecast based on your transaction history.</p>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }} onClick={() => fetchForecast(forecastDays)}>
              <BarChart2 size={18} /> Generate Forecast
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview': return renderOverviewScreen();
      case 'Insights': return renderInsightsScreen();
      case 'Diary': return renderDailyDiaryScreen();
      case 'Budgets': return renderBudgetsScreen();
      case 'Goals': return renderGoalsScreen();
      case 'Subs': return renderSubsScreen();
      case 'Transactions': return renderTransactionsScreen();
      case 'Collaboration': return renderCollaborationScreen();
      case 'Investments': return renderInvestmentsScreen();
      case 'Forecast': return renderForecastScreen();
      default: return renderOverviewScreen();
    }
  };

  const renderSubsScreen = () => (
    <div className="dashboard-grid">
      <div className="card full-width">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={24} color="var(--primary)" />
            <h2>Upcoming Subscriptions</h2>
          </div>
          <button className="btn btn-primary" onClick={() => setShowSubForm(true)}>
            <Plus size={18} /> Add Subscription
          </button>
        </div>
        <div className="progress-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {subscriptions.map((sub) => {
            const daysLeft = Math.ceil((new Date(sub.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24));
            const isUrgent = daysLeft <= 3 && daysLeft >= 0;

            return (
              <motion.div
                key={sub._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{
                  background: 'var(--bg-hover)',
                  border: isUrgent ? '1px solid var(--color-expense)' : 'none',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{sub.name}</h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sub.frequency.toUpperCase()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{currencySymbol}{sub.amount}</div>
                    <div style={{ fontSize: '0.75rem', color: isUrgent ? 'var(--color-expense)' : 'var(--text-secondary)', fontWeight: 600 }}>
                      {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due Today' : `${daysLeft} days left`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Next Bill: {new Date(sub.nextBillingDate).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => deleteSubscription(sub._id)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
          {subscriptions.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1/-1', padding: '2rem' }}>No subscriptions tracked yet.</p>}
        </div>
      </div>
    </div>
  );


  const renderCollaborationScreen = () => {
    if (!selectedRoom) {
      return (
        <div className="dashboard-grid">
          <div className="card one-third">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <div className="card-header"><h2>Create Room</h2></div>
                <form onSubmit={createRoom}>
                  <div className="form-group">
                    <label>Room Name</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="text" placeholder="e.g. Home Expenses" value={roomName} onChange={(e) => setRoomName(e.target.value)} required />
                      <button type="submit" className="btn btn-primary"><Plus size={18} /></button>
                    </div>
                  </div>
                </form>
              </div>

              <div>
                <div className="card-header"><h2>Join Room</h2></div>
                <form onSubmit={joinRoom}>
                  <div className="form-group">
                    <label>Room Code</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="text" placeholder="ENTER CODE" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} required />
                      <button type="submit" className="btn btn-primary"><ArrowRightLeft size={18} /></button>
                    </div>
                  </div>
                </form>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>My Budget Rooms</h3>
                <div className="nav-list">
                  {rooms.map(room => (
                    <div
                      key={room._id}
                      className="nav-item"
                      onClick={() => fetchRoomData(room)}
                      style={{ justifyContent: 'space-between', padding: '0.75rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {room.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{room.name}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Code: {room.code}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {rooms.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No rooms yet.</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="card two-thirds" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', minHeight: '400px' }}>
            <Users size={64} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <h2 style={{ opacity: 0.5, marginBottom: '0.5rem' }}>Collaboration Hub</h2>
            <p>Select a room from the list or create a new one to start collaborating.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="card full-width">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button
              className="btn btn-outline"
              onClick={() => setSelectedRoom(null)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px' }}
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <div>
              <h2 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 800 }}>{selectedRoom.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><History size={14} /> Code: <strong>{selectedRoom.code}</strong></span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><UserIcon size={14} /> Admin: {selectedRoom.admin.name}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {(selectedRoom.admin._id === (user._id || user.id) || selectedRoom.admin === (user._id || user.id)) && (
              <button
                className="btn btn-outline"
                onClick={() => deleteRoom(selectedRoom._id)}
                style={{ color: '#ef4444', borderColor: '#ef4444' }}
              >
                <Trash2 size={18} style={{ marginRight: '6px' }} />
                Delete Room
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setShowBudgetForm(true)}>
              <Plus size={18} style={{ marginRight: '6px' }} />
              Add Room Budget
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {(selectedRoom.admin._id === user._id || selectedRoom.admin._id === user.id) && selectedRoom.requests.filter(r => r.status === 'pending').length > 0 && (
            <div className="card" style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} /> Join Requests
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedRoom.requests.filter(r => r.status === 'pending').map(req => (
                  <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700 }}>{req.userId.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{req.userId.email}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleRequest(selectedRoom._id, req._id, 'accepted')} className="btn btn-sm btn-primary" title="Accept"><Check size={16} /></button>
                      <button onClick={() => handleRequest(selectedRoom._id, req._id, 'rejected')} className="btn btn-sm btn-outline" title="Reject"><X size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{ border: '1px solid var(--border)', background: 'var(--bg-hover)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Users size={20} color="var(--primary)" /> Members ({selectedRoom.members?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {(selectedRoom.members || []).map((member) => {
                const isAdmin = member._id === selectedRoom.admin._id;
                return (
                  <div
                    key={member._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      background: 'var(--bg-card)', borderRadius: '1rem',
                      padding: '0.6rem 1rem',
                      border: isAdmin ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      boxShadow: 'var(--shadow-sm)',
                      position: 'relative',
                      minWidth: '200px'
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: isAdmin ? 'var(--primary)' : 'var(--color-indigo)',
                      color: 'white', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem'
                    }}>
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {member.name}
                        {isAdmin && <span style={{ fontSize: '0.6rem', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Admin</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{member.email}</div>
                    </div>
                    {(selectedRoom.admin._id === (user._id || user.id) || selectedRoom.admin === (user._id || user.id)) && !isAdmin && (
                      <button
                        onClick={() => kickMember(selectedRoom._id, member._id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex' }}
                        title="Kick member"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Shared Budgets</h3>
                <ChartIcon size={20} color="var(--primary)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {roomBudgets.map(budget => {
                  const myUserId = user?._id || user?.id;
                  const mySpent = roomTransactions
                    .filter(t => {
                      const tUserId = t.userId?._id?.toString() || t.userId?.toString();
                      return t.category === budget.category && tUserId === myUserId && t.type === 'expense';
                    })
                    .reduce((acc, t) => acc + t.amount, 0);
                  const othersSpent = roomTransactions
                    .filter(t => {
                      const tUserId = t.userId?._id?.toString() || t.userId?.toString();
                      return t.category === budget.category && tUserId !== myUserId && t.type === 'expense';
                    })
                    .reduce((acc, t) => acc + t.amount, 0);
                  const totalSpent = mySpent + othersSpent;
                  const myPercent = budget.limit > 0 ? (mySpent / budget.limit) * 100 : 0;
                  const othersPercent = budget.limit > 0 ? (othersSpent / budget.limit) * 100 : 0;

                  return (
                    <div key={budget._id} style={{ padding: '1rem', background: 'var(--bg-hover)', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <strong style={{ fontSize: '1rem' }}>{budget.category}</strong>
                        <span style={{ fontWeight: 700 }}>{currencySymbol}{totalSpent.toLocaleString()} / {currencySymbol}{budget.limit.toLocaleString()}</span>
                      </div>
                      <div className="progress-track" style={{ height: 10, display: 'flex', borderRadius: '5px', overflow: 'hidden', background: 'var(--border)', marginBottom: '0.75rem' }}>
                        <div style={{ width: `${Math.min(myPercent, 100)}%`, background: 'var(--primary)' }} />
                        <div style={{ width: `${Math.min(othersPercent, 100 - myPercent)}%`, background: 'var(--color-indigo)' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} /> You: {currencySymbol}{mySpent.toLocaleString()}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-indigo)' }} /> Others: {currencySymbol}{othersSpent.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
                {roomBudgets.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No shared budgets yet.</p>}
              </div>
            </div>

            <div className="card" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Recent Activity</h3>
                <ArrowRightLeft size={20} color="var(--primary)" />
              </div>
              <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {roomTransactions.map(t => (
                      <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '8px', background: t.userId?._id === user.id ? 'var(--primary-light)' : 'var(--color-indigo)', color: t.userId?._id === user.id ? 'var(--primary)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                              {t.userId?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {t.userId?.name || 'Unknown'} • {new Date(t.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 800, color: t.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)' }}>
                          {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {roomTransactions.length === 0 && <tr><td colSpan="2" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No transactions yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Discussions</h3>
                <Send size={20} color="var(--primary)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', marginBottom: '1.5rem', background: 'var(--bg-hover)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                {roomComments.map((comment, idx) => (
                  <div key={idx} style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '0.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)' }}>{comment.userId?.name || 'User'}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(comment.date).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>{comment.text}</p>
                  </div>
                ))}
                {roomComments.length === 0 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', color: 'var(--text-secondary)' }}><Users size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} /><p>No comments yet. Start the conversation!</p></div>}
              </div>
              <form onSubmit={addComment} style={{ display: 'flex', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Type a message to the group..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  style={{ flex: 1, padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}><Send size={20} /></button>
              </form>
            </div>

            <div className="card" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Settle Up</h3>
                <RefreshCw size={20} color="var(--primary)" />
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Based on all shared expenses, here is the simplest way to settle debts among members:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {roomSettlements.map((settlement, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: 'var(--bg-hover)',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: settlement.fromId === (user._id || user.id) ? 'var(--primary)' : 'inherit' }}>
                          {settlement.fromId === (user._id || user.id) ? 'You' : settlement.from}
                        </span>
                      </div>
                      <ArrowRightLeft size={16} color="var(--text-secondary)" />
                      <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: settlement.toId === (user._id || user.id) ? 'var(--color-income)' : 'inherit' }}>
                          {settlement.toId === (user._id || user.id) ? 'You' : settlement.to}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--color-expense)' }}>
                      owes {currencySymbol}{settlement.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
                {roomSettlements.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
                    <p>Everyone is settled up!</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };




  const renderOnboarding = () => {
    const introSlides = [
      {
        title: "Master Your Money",
        desc: "Aura Budget uses Groq LPU technology to provide instant financial clarity.",
        icon: Sparkles,
        color: "var(--primary)"
      },
      {
        title: "Collaborative Budgeting",
        desc: "Create shared rooms to manage household expenses or group trips with ease.",
        icon: Users,
        color: "var(--color-indigo)"
      },
      {
        title: "Subscription Control",
        desc: "Never lose track of a recurring payment again. We track your renewals 24/7.",
        icon: Calendar,
        color: "var(--color-teal)"
      },
      {
        title: "Ready to Start?",
        desc: "Let's personalize your dashboard with a few quick questions.",
        icon: Target,
        color: "var(--primary)"
      }
    ];

    if (onboardingPhase === 'intro') {
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 5000,
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={introStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{ maxWidth: '500px', padding: '2rem' }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '24px',
                background: introSlides[introStep].color,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem',
                boxShadow: '0 10px 20px -5px ' + introSlides[introStep].color + '66'
              }}>
                {React.createElement(introSlides[introStep].icon, { size: 40 })}
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{introSlides[introStep].title}</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem' }}>{introSlides[introStep].desc}</p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
                {introSlides.map((_, i) => (
                  <div key={i} style={{ width: i === introStep ? '24px' : '8px', height: '8px', borderRadius: '4px', background: i === introStep ? 'var(--primary)' : 'var(--border)', transition: 'all 0.3s' }} />
                ))}
              </div>

              <button
                className="btn btn-primary"
                style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '50px' }}
                onClick={() => {
                  if (introStep < introSlides.length - 1) {
                    setIntroStep(introStep + 1);
                  } else {
                    setOnboardingPhase('questions');
                  }
                }}
              >
                {introStep < introSlides.length - 1 ? 'Continue' : 'Get Started'}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      );
    }

    const steps = [
      { num: 1, title: 'Basics', icon: UserIcon },
      { num: 2, title: 'Income', icon: Wallet },
      { num: 3, title: 'Expenses', icon: CreditCard },
      { num: 4, title: 'Goals', icon: Target },
      { num: 5, title: 'Personal', icon: Sparkles }
    ];

    const currencies = [
      { code: 'USD', symbol: '$', name: 'US Dollar' },
      { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
      { code: 'EUR', symbol: '€', name: 'Euro' },
      { code: 'GBP', symbol: '£', name: 'British Pound' },
      { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
    ];

    const currentCurrency = currencies.find(c => c.code === onboardingData.basics.currency) || currencies[0];


    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 5000,
        background: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: '2rem'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--bg-card) 100%)',
          opacity: 0.1,
          pointerEvents: 'none'
        }} />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="card"
          style={{
            maxWidth: '700px',
            width: '100%',
            padding: '3rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border)',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', fontWeight: 800 }}>Welcome to Aura Budget</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Let's set up your profile for better insights</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
            {steps.map(s => (
              <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: onboardingStep === s.num ? 'var(--primary)' : onboardingStep > s.num ? 'var(--bg-hover)' : 'transparent',
                  color: onboardingStep === s.num ? 'white' : onboardingStep > s.num ? 'var(--primary)' : 'var(--text-secondary)',
                  border: onboardingStep === s.num ? 'none' : '1px solid var(--border)',
                  transition: 'all 0.3s ease'
                }}>
                  {onboardingStep > s.num ? <Check size={18} /> : <s.icon size={18} />}
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: onboardingStep === s.num ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.title}</span>
              </div>
            ))}
          </div>


          <AnimatePresence mode="wait">
            {onboardingStep === 1 && (
              <motion.div key="step1" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>The Basics</h2>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label>What should we call you?</label>
                  <input
                    type="text"
                    value={onboardingData.basics.preferredName}
                    onChange={(e) => setOnboardingData({ ...onboardingData, basics: { ...onboardingData.basics, preferredName: e.target.value } })}
                    placeholder="Preferred Name"
                    style={{ padding: '1.25rem', fontSize: '1.1rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label>What's your primary occupation?</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    {[
                      { id: 'employee', label: 'Employee', icon: Briefcase },
                      { id: 'student', label: 'Student', icon: GraduationCap },
                      { id: 'other', label: 'Other', icon: UserIcon }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setOnboardingData({
                          ...onboardingData,
                          basics: { ...onboardingData.basics, occupation: opt.id, subOccupation: '' }
                        })}
                        style={{
                          padding: '1.5rem 1rem',
                          borderRadius: '16px',
                          border: onboardingData.basics.occupation === opt.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: onboardingData.basics.occupation === opt.id ? 'var(--primary-light)' : 'var(--bg-card)',
                          color: onboardingData.basics.occupation === opt.id ? 'var(--primary)' : 'var(--text-primary)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <opt.icon size={24} />
                        <span style={{ fontWeight: 600 }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {onboardingData.basics.occupation && onboardingData.basics.occupation !== 'other' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="form-group" style={{ marginBottom: '2rem' }}>
                    <label>
                      {onboardingData.basics.occupation === 'student' ? 'Currently studying?' : 'What kind of work?'}
                    </label>
                    <input
                      type="text"
                      value={onboardingData.basics.subOccupation}
                      onChange={(e) => setOnboardingData({ ...onboardingData, basics: { ...onboardingData.basics, subOccupation: e.target.value } })}
                      placeholder={onboardingData.basics.occupation === 'student' ? 'e.g. Computer Science, High School' : 'e.g. Software Engineer, Sales'}
                      style={{ padding: '1rem' }}
                    />
                  </motion.div>
                )}

                <div className="form-group">
                  <label>Preferred Currency</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                    {currencies.map(curr => (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => setOnboardingData({ ...onboardingData, basics: { ...onboardingData.basics, currency: curr.code } })}
                        style={{
                          padding: '1rem 0.5rem',
                          borderRadius: '12px',
                          border: onboardingData.basics.currency === curr.code ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: onboardingData.basics.currency === curr.code ? 'var(--primary-light)' : 'var(--bg-card)',
                          color: onboardingData.basics.currency === curr.code ? 'var(--primary)' : 'var(--text-primary)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{curr.symbol}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{curr.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {onboardingStep === 2 && (
              <motion.div key="step2" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Monthly Income</h2>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label>Estimated Monthly Income ({currentCurrency.symbol})</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-secondary)' }}>{currentCurrency.symbol}</span>
                    <input
                      type="number"
                      value={onboardingData.income.monthly}
                      onChange={(e) => setOnboardingData({ ...onboardingData, income: { ...onboardingData.income, monthly: e.target.value } })}
                      placeholder="e.g. 5000"
                      style={{ padding: '1.25rem 1.25rem 1.25rem 2.5rem', fontSize: '1.2rem' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Income Consistency</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {[
                      { id: 'fixed', label: 'Fixed Salary' },
                      { id: 'variable', label: 'Variable/Gig' },
                      { id: 'mixed', label: 'Mixed' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setOnboardingData({ ...onboardingData, income: { ...onboardingData.income, type: opt.id } })}
                        style={{
                          flex: 1,
                          padding: '1rem',
                          borderRadius: '12px',
                          border: onboardingData.income.type === opt.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: onboardingData.income.type === opt.id ? 'var(--primary-light)' : 'var(--bg-card)',
                          color: onboardingData.income.type === opt.id ? 'var(--primary)' : 'var(--text-primary)',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '2rem' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Monthly Savings Goal</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{onboardingData.income.savingsTarget}%</span>
                  </label>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>How much of your income are you willing to save monthly?</p>
                  <input
                    type="range"
                    min="1"
                    max="90"
                    value={onboardingData.income.savingsTarget}
                    onChange={(e) => setOnboardingData({ ...onboardingData, income: { ...onboardingData.income, savingsTarget: parseInt(e.target.value) } })}
                    style={{ width: '100%', height: '6px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    <span>1% (Minimal)</span>
                    <span>90% (Aggressive)</span>
                  </div>
                </div>
              </motion.div>
            )}

            {onboardingStep === 3 && (
              <motion.div key="step3" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Your Expenses</h2>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label>Typical Expense Style</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[
                      { id: 'fixed', label: 'Essential Heavy', desc: 'Mostly Rent, Bills, Meds' },
                      { id: 'variable', label: 'Lifestyle Heavy', desc: 'Travel, Dine-out, Shopping' },
                      { id: 'mixed', label: 'Balanced', desc: 'Mix of both' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setOnboardingData({ ...onboardingData, expenses: { ...onboardingData.expenses, type: opt.id } })}
                        style={{
                          padding: '1.25rem',
                          borderRadius: '16px',
                          border: onboardingData.expenses.type === opt.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: onboardingData.expenses.type === opt.id ? 'var(--primary-light)' : 'var(--bg-card)',
                          textAlign: 'left',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: onboardingData.expenses.type === opt.id ? 'var(--primary)' : 'var(--text-primary)' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '1.5rem', background: onboardingData.expenses.hasLoans ? 'var(--primary-light)' : 'var(--bg-hover)', borderRadius: '16px', border: onboardingData.expenses.hasLoans ? '1px solid var(--primary)' : '1px solid transparent', transition: 'all 0.2s' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                    <div
                      onClick={() => setOnboardingData({ ...onboardingData, expenses: { ...onboardingData.expenses, hasLoans: !onboardingData.expenses.hasLoans } })}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        border: '2px solid ' + (onboardingData.expenses.hasLoans ? 'var(--primary)' : 'var(--text-muted)'),
                        background: onboardingData.expenses.hasLoans ? 'var(--primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}
                    >
                      {onboardingData.expenses.hasLoans && <Check size={16} />}
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, display: 'block' }}>Loans or Active EMIs?</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Check this if you have recurring debt payments</span>
                    </div>
                  </label>
                </div>

                {onboardingData.expenses.hasLoans && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label>Briefly describe your loans</label>
                    <input
                      type="text"
                      value={onboardingData.expenses.loanDetails}
                      onChange={(e) => setOnboardingData({ ...onboardingData, expenses: { ...onboardingData.expenses, loanDetails: e.target.value } })}
                      placeholder="e.g. Home Loan, College Debt, Credit Card"
                      style={{ padding: '1rem' }}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

            {onboardingStep === 4 && (
              <motion.div key="step4" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Financial Goals</h2>
                <div className="form-group">
                  <label>Choose a Priority</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                      { id: 'save', label: 'Build Savings', icon: Coins },
                      { id: 'debt', label: 'Pay Off Debt', icon: CreditCard },
                      { id: 'invest', label: 'Start Investing', icon: Sparkles },
                      { id: 'spend', label: 'Monitor Spending', icon: Wallet }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setOnboardingData({ ...onboardingData, goals: { ...onboardingData.goals, shortTerm: opt.label } })}
                        style={{
                          padding: '1.25rem',
                          borderRadius: '16px',
                          border: onboardingData.goals.shortTerm === opt.label ? '2px solid var(--primary)' : '1px solid var(--border)',
                          background: onboardingData.goals.shortTerm === opt.label ? 'var(--primary-light)' : 'var(--bg-card)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          cursor: 'pointer'
                        }}
                      >
                        <opt.icon size={20} color={onboardingData.goals.shortTerm === opt.label ? 'var(--primary)' : 'var(--text-secondary)'} />
                        <span style={{ fontWeight: 600 }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>What's a major life goal you're working toward?</label>
                  <input
                    type="text"
                    value={onboardingData.goals.longTerm}
                    onChange={(e) => setOnboardingData({ ...onboardingData, goals: { ...onboardingData.goals, longTerm: e.target.value } })}
                    placeholder="e.g. Retirement, Buying a Home, Marriage"
                    style={{ padding: '1rem' }}
                  />
                </div>
              </motion.div>
            )}

            {onboardingStep === 5 && (
              <motion.div key="step5" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Personalization</h2>
                <div className="form-group">
                  <label>Finally, how can Aura Budget best serve you?</label>
                  <textarea
                    rows="5"
                    value={onboardingData.personalization.preferences}
                    onChange={(e) => setOnboardingData({ ...onboardingData, personalization: { ...onboardingData.personalization, preferences: e.target.value } })}
                    placeholder="Tell us a bit about your financial style..."
                    style={{ width: '100%', padding: '1.25rem', borderRadius: '16px', background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.5 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '3.5rem' }}>
            {onboardingStep > 1 && (
              <button className="btn" style={{ flex: 1, padding: '1.25rem', background: 'var(--bg-hover)' }} onClick={() => setOnboardingStep(onboardingStep - 1)}>Back</button>
            )}
            {onboardingStep < 5 ? (
              <button
                className="btn btn-primary"
                style={{ flex: 2, padding: '1.25rem' }}
                onClick={() => setOnboardingStep(onboardingStep + 1)}
                disabled={onboardingStep === 1 && !onboardingData.basics.preferredName}
              >
                Continue
              </button>
            ) : (
              <button className="btn btn-primary" style={{ flex: 2, padding: '1.25rem' }} onClick={submitOnboarding}>Finish Setup</button>
            )}
          </div>

        </motion.div>
      </div>
    );
  };

  const renderPreferencesModal = () => (
    <div className="modal-overlay" onClick={() => setShowPreferences(false)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-content"
        style={{ maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto', padding: '2.5rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Preferences</h2>
          <button onClick={() => setShowPreferences(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Basics</h3>
            <div className="form-group">
              <label>What should we call you?</label>
              <input
                type="text"
                value={onboardingData.basics.preferredName}
                onChange={(e) => setOnboardingData({ ...onboardingData, basics: { ...onboardingData.basics, preferredName: e.target.value } })}
              />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select
                value={onboardingData.basics.currency}
                onChange={(e) => setOnboardingData({ ...onboardingData, basics: { ...onboardingData.basics, currency: e.target.value } })}
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Income & Expenses</h3>
            <div className="form-group">
              <label>Monthly Income</label>
              <input
                type="number"
                value={onboardingData.income.monthly}
                onChange={(e) => setOnboardingData({ ...onboardingData, income: { ...onboardingData.income, monthly: e.target.value } })}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Monthly Savings Goal</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{onboardingData.income.savingsTarget}%</span>
              </label>
              <input
                type="range"
                min="1"
                max="90"
                value={onboardingData.income.savingsTarget}
                onChange={(e) => setOnboardingData({ ...onboardingData, income: { ...onboardingData.income, savingsTarget: parseInt(e.target.value) } })}
                style={{ width: '100%', height: '6px', accentColor: 'var(--primary)', cursor: 'pointer', marginTop: '0.5rem' }}
              />
            </div>
            <div className="form-group">
              <label>Occupation</label>
              <select
                value={onboardingData.basics.occupation}
                onChange={(e) => setOnboardingData({ ...onboardingData, basics: { ...onboardingData.basics, occupation: e.target.value } })}
              >
                <option value="employee">Salaried Employee</option>
                <option value="freelancer">Freelancer/Self-employed</option>
                <option value="student">Student</option>
                <option value="unemployed">Between Jobs</option>
              </select>
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Goals & Style</h3>
            <div className="form-group">
              <label>Long-term Goal</label>
              <input
                type="text"
                value={onboardingData.goals.longTerm}
                onChange={(e) => setOnboardingData({ ...onboardingData, goals: { ...onboardingData.goals, longTerm: e.target.value } })}
                placeholder="e.g. Retirement, Buying a Home"
              />
            </div>
            <div className="form-group">
              <label>Your Financial Style</label>
              <textarea
                rows="3"
                value={onboardingData.personalization.preferences}
                onChange={(e) => setOnboardingData({ ...onboardingData, personalization: { ...onboardingData.personalization, preferences: e.target.value } })}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </section>
        </div>

        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowPreferences(false)}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={updatePreferences}>Save Changes</button>
        </div>
      </motion.div>
    </div>
  );



  return (

    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="logo" style={{ position: 'relative' }}>
          <div style={{ padding: '6px', background: 'var(--primary)', borderRadius: '8px', color: 'white', flexShrink: 0 }}>
            <Wallet size={20} />
          </div>
          <span>Aura Budget</span>
          <div onClick={toggleSidebar} style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '50%', padding: '4px', display: 'flex', zIndex: 10, boxShadow: 'var(--shadow)', transition: 'all 0.2s ease' }}>
            {isCollapsed ? <ChevronRight size={14} /> : <ArrowRightLeft size={14} style={{ transform: 'rotate(180deg)' }} />}
          </div>
        </div>

        <nav className="nav-list">
          <SidebarItem icon={LayoutDashboard} label="Overview" />
          <SidebarItem icon={Sparkles} label="Insights" />
          <SidebarItem icon={History} label="Diary" />
          <SidebarItem icon={ChartIcon} label="Budgets" />
          <SidebarItem icon={Target} label="Goals" />
          <SidebarItem icon={Calendar} label="Subs" />
          <SidebarItem icon={ArrowRightLeft} label="Transactions" />

          <SidebarItem icon={Users} label="Collaboration" />
          <SidebarItem icon={TrendingUp} label="Investments" />
          <SidebarItem icon={BarChart2} label="Forecast" />
        </nav>



        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', background: 'transparent', border: 'none', color: '#ef4444' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-wrapper">
        <header className="header">
          <div className="search-bar-placeholder" style={{ flex: 1 }}></div>
          <div
            onClick={toggleTheme}
            style={{
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              background: 'var(--bg-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              style={{ color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px', borderRadius: '50%', background: showSettingsMenu ? 'var(--bg-hover)' : 'transparent', display: 'flex', transition: 'all 0.2s' }}
            >
              <Settings size={20} />
            </div>

            <AnimatePresence>
              {showSettingsMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    width: '200px',
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow)',
                    border: '1px solid var(--border)',
                    zIndex: 100,
                    overflow: 'hidden',
                    padding: '0.5rem'
                  }}
                >
                  <button className="dropdown-item" onClick={() => { alert('Notifications Coming Soon!'); setShowSettingsMenu(false); }}>
                    <Bell size={18} />
                    <span>Alert</span>
                  </button>
                  <button className="dropdown-item" onClick={() => { setShowResetModal(true); setShowSettingsMenu(false); }}>
                    <RotateCcw size={18} />
                    <span>Reset</span>
                  </button>

                  <button className="dropdown-item" onClick={() => { exportTransactionsToPDF(); setShowSettingsMenu(false); }}>
                    <Download size={18} />
                    <span>Export PDF</span>
                  </button>
                  <button className="dropdown-item" onClick={() => { setShowPreferences(true); setShowSettingsMenu(false); }}>
                    <Sliders size={18} />
                    <span>Preferences</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="user-profile">
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {displayName.charAt(0)}
            </div>
            {!isCollapsed && <span>{displayName}</span>}
          </div>
        </header>

        <div className="content-container">
          <div className="page-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>{activeTab}</h1>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {/* AI Budget builder is inline in the Budgets tab */}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAddForm && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Add Transaction</h2>
                <button onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-primary)' }}>×</button>
              </div>
              <form onSubmit={addTransaction}>
                <div className="form-group"><label>Title</label><input type="text" placeholder="e.g. Salary" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                <div className="form-group"><label>Amount ({currencySymbol})</label><input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div><label>Type</label><select value={type} onChange={(e) => setType(e.target.value)}><option value="expense">Expense</option><option value="income">Income</option></select></div>
                  <div><label>Category</label><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="Food">Food</option><option value="Rent">Rent</option><option value="Salary">Salary</option><option value="Entertainment">Entertainment</option><option value="Other">Other</option></select></div>
                </div>
                {rooms.length > 0 && (
                  <div className="form-group">
                    <label>Share with Room (Optional)</label>
                    <select id="collab-select">
                      <option value="">Personal Only</option>
                      {rooms.map(room => (
                        <option key={room._id} value={room._id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>Save Transaction</button>


              </form>
            </motion.div>
          </div>
        )}

        {showBudgetForm && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Set Category Budget</h2>
                <button onClick={() => setShowBudgetForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-primary)' }}>×</button>
              </div>
              <form onSubmit={selectedRoom ? proposeRoomBudget : handleSetBudget}>


                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Food">Food</option><option value="Rent">Rent</option><option value="Salary">Salary</option><option value="Entertainment">Entertainment</option><option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group"><label>Monthly Limit ({currencySymbol})</label><input type="number" placeholder="e.g. 500" value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>Save Budget</button>
              </form>
            </motion.div>
          </div>
        )}

        {showGoalForm && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Create New Goal</h2>
                <button onClick={() => setShowGoalForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-primary)' }}>×</button>
              </div>
              <form onSubmit={addGoal}>
                <div className="form-group">
                  <label>Goal Title</label>
                  <input type="text" placeholder="e.g. Save for a Car" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Target Amount ({currencySymbol})</label>
                  <input type="number" placeholder="0.00" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Initial Amount Saved (Optional)</label>
                  <input type="number" placeholder="0.00" value={goalCurrent} onChange={(e) => setGoalCurrent(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>Create Goal</button>
              </form>
            </motion.div>
          </div>
        )}
        {showSubForm && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Track New Subscription</h2>
                <button onClick={() => setShowSubForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-primary)' }}>×</button>
              </div>
              <form onSubmit={addSubscription}>
                <div className="form-group">
                  <label>Service Name</label>
                  <input type="text" placeholder="e.g. Netflix, Spotify" value={subName} onChange={(e) => setSubName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input type="number" step="0.01" placeholder="0.00" value={subAmount} onChange={(e) => setSubAmount(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Billing Cycle</label>
                  <select value={subFrequency} onChange={(e) => setSubFrequency(e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Next Billing Date</label>
                  <input type="date" value={subDate} onChange={(e) => setSubDate(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>Save Subscription</button>
              </form>
            </motion.div>
          </div>
        )}
        {showInvestmentForm && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem' }}>Add Investment Asset</h2>
                <button onClick={() => setShowInvestmentForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-primary)' }}>×</button>
              </div>
              <form onSubmit={addInvestment}>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Search Stock / Asset</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="e.g. AAPL, TSLA, BTC..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => searchStocks(searchQuery)}
                      disabled={isSearching}
                    >
                      {isSearching ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '100%',
                      marginTop: '0.25rem',
                      background: 'var(--bg-card)',
                      borderRadius: '8px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      border: '1px solid var(--border)',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      zIndex: 20
                    }}>
                      {searchResults.map((s, i) => (
                        <div
                          key={`${s.symbol}-${i}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssetName(s.name);
                            setSearchQuery(s.symbol);
                            setSelectedSymbol(s.symbol);
                            setSearchResults([]);
                            fetchLivePrice(s.symbol);
                          }}
                          className="search-result-item"
                          style={{
                            padding: '0.75rem',
                            cursor: 'pointer',
                            borderBottom: i === searchResults.length - 1 ? 'none' : '1px solid var(--border)',
                            fontSize: '0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong style={{ color: 'var(--primary)' }}>{s.symbol}</strong>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.type}</span>
                          </div>
                          <span style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchError && <p style={{ color: 'var(--color-expense)', fontSize: '0.75rem', marginTop: '0.5rem' }}>{searchError}</p>}
                </div>

                <div className="form-group">
                  <label>Asset Name</label>
                  <input type="text" placeholder="e.g. Apple Inc. or Bitcoin" value={assetName} onChange={(e) => setAssetName(e.target.value)} required />
                </div>
                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Shares Purchased</label>
                    <input type="number" step="0.001" placeholder="0.00" value={shares} onChange={(e) => setShares(e.target.value)} required />
                  </div>
                  <div>
                    <label>Avg. Buy Price ($)</label>
                    <input type="number" step="0.01" placeholder="0.00" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Live Market Price ($)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="number"
                      placeholder="Auto-fetched"
                      value={currentAssetPrice}
                      readOnly
                      style={{ background: 'var(--bg-hover)', cursor: 'not-allowed', flex: 1 }}
                      required
                    />
                    {isPriceLoading && <RefreshCw size={20} className="animate-spin" color="var(--primary)" />}
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Market data updates automatically.
                  </p>
                </div>
                <div className="form-group">
                  <label>Asset Type</label>
                  <select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
                    <option value="Stock">Stock</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Gold">Gold</option>
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}
                  disabled={isPriceLoading || !currentAssetPrice}
                >
                  {isPriceLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Fetching Live Price...</span>
                    </div>
                  ) : 'Track Asset'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
        {showResetModal && (
          <div className="modal-overlay" style={{ zIndex: 6000 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-content">
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ background: '#fee2e2', color: '#ef4444', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <RotateCcw size={24} />
                </div>
                <h2>Reset Account</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  This will permanently delete all your transactions, budgets, subscriptions, and onboarding data. This action cannot be undone.
                </p>
              </div>

              <form onSubmit={handleResetAccount}>
                <div className="form-group">
                  <label>Type <strong>RESET</strong> to confirm</label>
                  <input
                    type="text"
                    placeholder="RESET"
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Account Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowResetModal(false)}>Cancel</button>
                  <button type="submit" className="btn" style={{ flex: 1, background: '#ef4444', color: 'white' }}>Reset Everything</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {showOnboarding && renderOnboarding()}
        {showPreferences && renderPreferencesModal()}
      </AnimatePresence>



    </div>
  );
}

export default App;
