import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import DashboardLayout from '../components/layout/DashboardLayout';
import { 
  Book, Users, Repeat, History, ArrowUpRight, 
  ArrowDownRight, TrendingUp, Filter, Plus, 
  FileDown, Download, Share2, MoreVertical, ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Book as BookType, UserProfile, Borrowing, Category } from '../types';
import { cn, formatDate } from '../lib/utils';
import BooksTab from './admin/BooksTab';
import CategoriesTab from './admin/CategoriesTab';
import MembersTab from './admin/MembersTab';
import BorrowingsTab from './admin/BorrowingsTab';
import LogsTab from './admin/LogsTab';

// Export Helpers
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const CHART_DATA = [
  { name: 'Jan', value: 400, categories: 300 },
  { name: 'Feb', value: 300, categories: 200 },
  { name: 'Mar', value: 600, categories: 450 },
  { name: 'Apr', value: 800, categories: 600 },
  { name: 'May', value: 500, categories: 380 },
  { name: 'Jun', value: 900, categories: 700 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, accentColor }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="admin-card p-8 group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-slate-400">
      <Icon className="w-24 h-24 rotate-12" />
    </div>
    
    <div className="flex justify-between items-start mb-8 relative z-10">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 group-hover:border-indigo-200 transition-all shadow-inner", accentColor)}>
        <Icon className="w-7 h-7" />
      </div>
      <div className={cn(
        "flex items-center text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider",
        trend === 'up' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
      )}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
        {trendValue}%
      </div>
    </div>
    
    <div className="relative z-10">
      <h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-2">{title}</h3>
      <p className="text-4xl font-display font-bold tracking-tight text-slate-900">{value}</p>
    </div>
    
    <div className="mt-6 flex items-center space-x-2 relative z-10">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '70%' }}
          className={cn("h-full rounded-full", trend === 'up' ? "bg-emerald-500" : "bg-indigo-500")}
        />
      </div>
      <span className="text-[10px] font-bold text-slate-500">Live</span>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [shouldOpenBookModal, setShouldOpenBookModal] = useState(false);
  const [stats, setStats] = useState({
    books: 0,
    members: 0,
    borrowings: 0,
    categories: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksSnap, membersSnap, borrowingsSnap, categoriesSnap] = await Promise.all([
          getDocs(collection(db, 'books')),
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'borrowings')),
          getDocs(collection(db, 'categories'))
        ]);
        
        setStats({
          books: booksSnap.size,
          members: membersSnap.size,
          borrowings: borrowingsSnap.size,
          categories: categoriesSnap.size
        });

        // Recent activity from logs
        const recentQ = query(collection(db, 'logs'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(recentQ);
        setRecentActivities(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'admin_stats');
      }
    };
    fetchStats();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'books') {
      setShouldOpenBookModal(false);
    }
  };

  const exportToPDF = () => {
    const doc: any = new jsPDF();
    doc.text('Laporan Pustaka Digital', 14, 15);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 14, 22);
    
    const tableData = [
      ['Kategori', 'Jumlah'],
      ['Total Buku', stats.books.toString()],
      ['Total Anggota', stats.members.toString()],
      ['Total Peminjaman', stats.borrowings.toString()],
      ['Total Kategori', stats.categories.toString()]
    ];
    
    (doc as any).autoTable({
      head: [['Statistik', 'Data']],
      body: tableData,
      startY: 30,
      theme: 'grid'
    });
    
    doc.save('laporan-pustaka.pdf');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Statistik: 'Total Buku', Data: stats.books },
      { Statistik: 'Total Anggota', Data: stats.members },
      { Statistik: 'Total Peminjaman', Data: stats.borrowings },
      { Statistik: 'Total Kategori', Data: stats.categories },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, "laporan-pustaka.xlsx");
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-12 pb-20">
            {/* Header Actions */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
              <div>
                <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight mb-2">Pusat Kendali Admin</h1>
                <p className="text-slate-500 font-medium text-lg">Kelola ekosistem perpustakaan digital Anda dengan presisi.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <div className="flex items-center p-1.5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <button 
                    onClick={exportToPDF}
                    className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                    title="Export PDF"
                  >
                    <FileDown className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={exportToExcel}
                    className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                    title="Export Excel"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={() => {
                    setShouldOpenBookModal(true);
                    setActiveTab('books');
                  }}
                  className="flex-1 xl:flex-none flex items-center justify-center space-x-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all group"
                >
                  <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                  <span>Tambah Buku</span>
                </button>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              <StatCard 
                title="Buku Elektronik" 
                value={stats.books} 
                icon={Book} 
                trend="up" 
                trendValue={12} 
                accentColor="text-indigo-400"
              />
              <StatCard 
                title="Anggota Aktif" 
                value={stats.members} 
                icon={Users} 
                trend="up" 
                trendValue={5} 
                accentColor="text-sky-400"
              />
              <StatCard 
                title="Transaksi Pinjam" 
                value={stats.borrowings} 
                icon={Repeat} 
                trend="down" 
                trendValue={2} 
                accentColor="text-violet-400"
              />
              <StatCard 
                title="Kategori Literatur" 
                value={stats.categories} 
                icon={TrendingUp} 
                trend="up" 
                trendValue={8} 
                accentColor="text-emerald-400"
              />
            </div>

            {/* Advanced Analytics */}
            <div className="grid xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 admin-card p-10 h-[500px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                    <TrendingUp className="w-6 h-6 text-indigo-400" />
                  </div>
                </div>
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="font-display font-bold text-2xl text-slate-900 mb-1">Performa Literasi</h3>
                    <p className="text-slate-500 text-sm">Analisis tren peminjaman 6 bulan terakhir</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Buku</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 -ml-6 -mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA}>
                      <defs>
                        <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}} 
                        dy={20} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 11}} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          borderRadius: '16px', 
                          border: '1px solid #f1f5f9',
                          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'
                        }}
                        itemStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#6366f1" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#adminChartGrad)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="admin-card p-10 h-[500px] flex flex-col">
                <h3 className="font-display font-bold text-2xl text-slate-900 mb-2">Distribusi Kategori</h3>
                <p className="text-slate-500 text-sm mb-10">Popularitas genre buku</p>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={15} />
                      <Tooltip 
                         cursor={{fill: '#f8fafc', radius: 12}}
                         contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px' }}
                      />
                      <Bar dataKey="categories" radius={[8, 8, 0, 0]} barSize={32}>
                        {CHART_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#818cf8' : '#4f46e5'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Real-time Activity Feed */}
            <div className="admin-card overflow-hidden">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-bold text-2xl text-slate-900 mb-1">Aktivitas Sistem</h3>
                    <p className="text-slate-500 text-sm">Pemantauan real-time transaksi literasi</p>
                  </div>
                  <button className="p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <MoreVertical className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentActivities.length > 0 ? recentActivities.map((log, i) => (
                    <motion.div 
                      key={log.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-8 hover:bg-slate-50 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-6">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner border border-slate-100",
                          log.type === 'admin' ? "bg-indigo-500/10 text-indigo-500" : "bg-sky-500/10 text-sky-500"
                        )}>
                          {log.type === 'admin' ? <ShieldCheck className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold text-lg mb-1">{log.action}</p>
                          <div className="flex items-center space-x-3 text-slate-500 text-xs font-bold uppercase tracking-widest">
                            <span className="text-slate-400">{log.userName}</span>
                            <span>•</span>
                            <span>{log.createdAt?.toDate ? formatDate(log.createdAt.toDate()) : 'Baru saja'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:flex flex-col items-end">
                        <span className={cn(
                          "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                          log.type === 'admin' ? "border-indigo-500/20 text-indigo-500 bg-indigo-500/5" : "border-sky-500/20 text-sky-500 bg-sky-500/5"
                        )}>
                          {log.type === 'admin' ? 'Admin Ops' : 'User Activity'}
                        </span>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-[0.3em]">
                      Tidak ada aktivitas terbaru
                    </div>
                  )}
                </div>
                <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
                   <button 
                    onClick={() => setActiveTab('logs')}
                    className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-500 transition-colors"
                  >
                    Lihat Semua Aktivitas
                   </button>
                </div>
            </div>
          </div>
        );
      case 'books': return <BooksTab defaultOpenModal={shouldOpenBookModal} />;
      case 'categories': return <CategoriesTab />;
      case 'members': return <MembersTab />;
      case 'borrowings': return <BorrowingsTab />;
      case 'logs': return <LogsTab />;
      default: return <div>Tab {activeTab} coming soon...</div>;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderContent()}
    </DashboardLayout>
  );
}
