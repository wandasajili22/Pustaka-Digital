import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Borrowing, Book as BookType } from '../types';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Clock, Book as BookIcon, CheckCircle, AlertCircle, ArrowRight, Search, BookOpen, ChevronRight, Filter, MoreVertical, LogOut, Settings, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function UserDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [newBooks, setNewBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, 'borrowings'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setBorrowings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Borrowing)));

        // Fetch new arrivals
        const booksQ = query(collection(db, 'books'), orderBy('createdAt', 'desc'), limit(5));
        const booksSnap = await getDocs(booksQ);
        setNewBooks(booksSnap.docs.map(d => ({ id: d.id, ...d.data() } as BookType)));

      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'dashboard_data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const activeLoans = borrowings.filter(b => b.status === 'borrowed');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-12">
            {/* Welcome Banner */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-[48px] p-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white overflow-hidden shadow-2xl shadow-blue-500/20"
            >
              <div className="relative z-10 max-w-2xl">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="inline-block px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                    Koleksi Literasi Digital
                  </span>
                  <h2 className="text-5xl font-display font-bold mb-4 tracking-tighter leading-none">
                    Waktunya Membaca, {profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Sahabat Literasi'}!
                  </h2>
                  <p className="text-blue-100 text-lg font-medium leading-relaxed mb-10 opacity-90">
                    Kamu sedang meminjam <span className="text-white font-black underline decoration-yellow-400 decoration-4 underline-offset-4">{activeLoans.length} buku aktif</span>. Jelajahi ribuan literatur lainnya hari ini.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link 
                      to="/catalog"
                      className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-black/10 flex items-center space-x-2"
                    >
                      <Search className="w-5 h-5" />
                      <span>Eksplorasi Katalog</span>
                    </Link>
                  </div>
                </motion.div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl" />
              <BookOpen className="absolute right-12 bottom-12 w-48 h-48 text-white/10 -rotate-12 transition-transform duration-1000 group-hover:rotate-0" />
            </motion.div>

            {/* Quick Insights */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { label: 'Sedang Dipinjam', value: activeLoans.length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Total Koleksi Anda', value: borrowings.length, icon: BookIcon, color: 'text-violet-600', bg: 'bg-violet-50' },
                { label: 'Buku Selesai', value: borrowings.filter(b => b.status === 'returned').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="user-card p-8 flex items-center space-x-6 group"
                >
                  <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:-rotate-3", stat.bg, stat.color)}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                    <p className="text-4xl font-display font-bold text-slate-900">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* New Arrivals / Discovery */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-3xl font-display font-bold text-slate-900 tracking-tight flex items-center space-x-4">
                  <div className="w-2 h-10 bg-indigo-600 rounded-full" />
                  <span>Rekomendasi Untukmu</span>
                </h3>
                <Link to="/catalog" className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Jelajahi Semua</Link>
              </div>
              
              <div className="flex space-x-8 overflow-x-auto pb-8 pt-2 -mx-4 px-4 scrollbar-hide">
                {loading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="min-w-[280px] h-[400px] bg-slate-100 rounded-[40px] animate-pulse" />
                  ))
                ) : newBooks.length === 0 ? (
                  <div className="w-full py-12 text-center text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-[40px]">
                    Belum ada rekomendasi pustaka.
                  </div>
                ) : newBooks.map((book) => (
                  <motion.div 
                    whileHover={{ y: -10 }}
                    key={book.id} 
                    className="min-w-[280px] bg-white p-6 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-50 group cursor-pointer"
                    onClick={() => navigate('/catalog')}
                  >
                    <div className="aspect-[3/4] rounded-[32px] overflow-hidden mb-6 shadow-xl group-hover:shadow-indigo-500/20 transition-all">
                       <img 
                        src={book.coverUrl || 'https://images.unsplash.com/photo-1543004218-ee14110497f8?w=400&q=80'} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={book.title}
                        referrerPolicy="no-referrer"
                       />
                    </div>
                    <h4 className="font-display font-bold text-xl text-slate-900 mb-1 truncate px-2">{book.title}</h4>
                    <p className="text-slate-400 font-medium text-sm px-2 mb-4">{book.author}</p>
                    <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-50">
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">New</span>
                       <div className="flex items-center text-amber-500">
                          <Sparkles className="w-4 h-4 fill-current mr-1" />
                          <span className="text-xs font-black">4.9</span>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Content Discovery Section */}
            <div className="grid lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-3">
                    <div className="w-2 h-8 bg-blue-600 rounded-full" />
                    <span>Pinjaman Aktif</span>
                  </h3>
                  <button className="text-sm font-bold text-blue-600 hover:underline">Lihat Semua</button>
                </div>
                
                <div className="space-y-4">
                  {loading ? (
                    <div className="animate-pulse space-y-4">
                       {[1, 2].map(i => <div key={i} className="h-24 bg-slate-100 rounded-3xl" />)}
                    </div>
                  ) : activeLoans.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[48px] py-16 px-8 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
                        <BookOpen className="w-10 h-10 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-bold text-lg mb-2">Ingin baca buku apa hari ini?</p>
                      <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">Eksplorasi ribuan judul buku digital berkualitas yang tersedia di katalog kami.</p>
                      <Link to="/catalog" className="text-blue-600 font-black tracking-widest uppercase text-xs hover:tracking-[0.2em] transition-all">
                        Eksplorasi Katalog →
                      </Link>
                    </div>
                  ) : (
                    activeLoans.map(loan => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={loan.id} 
                        className="user-card p-6 flex items-center justify-between group cursor-pointer"
                      >
                         <div className="flex items-center space-x-6">
                          <div className="w-16 h-20 bg-slate-100 rounded-xl flex items-center justify-center shadow-lg shadow-black/5 overflow-hidden group-hover:scale-105 transition-transform">
                             {loan.coverUrl ? (
                               <img src={loan.coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                             ) : (
                               <BookIcon className="w-8 h-8 text-slate-300" />
                             )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-none mb-2">{loan.bookTitle}</p>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-lg">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDate(loan.dueDate.toDate())}
                              </div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pinjam: {formatDate(loan.borrowDate.toDate())}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-indigo-500 flex items-center justify-center text-[10px] font-black text-indigo-600">
                               75%
                            </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-3">
                  <div className="w-2 h-8 bg-indigo-400 rounded-full" />
                  <span>Riwayat</span>
                </h3>
                <div className="user-card divide-y divide-slate-50 overflow-hidden">
                  {borrowings.filter(b => b.status === 'returned').length === 0 && !loading ? (
                    <div className="p-12 text-center text-slate-400 text-sm italic">
                      Belum ada jejak literasi yang tersimpan.
                    </div>
                  ) : (
                    borrowings.filter(b => b.status === 'returned').slice(0, 4).map(history => (
                      <div key={history.id} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group">
                        <div className="flex items-center space-x-4">
                           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <CheckCircle className="w-6 h-6" />
                           </div>
                           <div>
                              <p className="font-bold text-sm text-slate-900 mb-1">{history.bookTitle}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">
                                {formatDate(history.borrowDate.toDate())}
                              </p>
                           </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))
                  )}
                  {borrowings.filter(b => b.status === 'returned').length > 4 && (
                    <button className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:bg-slate-50 transition-all">
                      Lihat Semua Riwayat
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'borrowings':
        return (
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-display font-bold tracking-tight text-slate-900">Jejak Literasi</h1>
                <p className="text-slate-500 font-medium">Seluruh daftar buku yang pernah Anda sentuh.</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm transition-all">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {borrowings.length === 0 && !loading ? (
                <div className="user-card p-24 text-center">
                  <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest">Belum ada aktivitas ditemukan</p>
                </div>
              ) : (
                borrowings.map(b => (
                  <motion.div 
                    layout
                    key={b.id} 
                    className="user-card p-8 flex items-center justify-between group hover:border-blue-200"
                  >
                    <div className="flex items-center space-x-8">
                      <div className={cn(
                        "w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-black transition-all shadow-inner",
                        b.status === 'borrowed' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {b.bookTitle.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-2xl text-slate-950 mb-2 leading-none">{b.bookTitle}</h4>
                        <div className="flex items-center space-x-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-slate-200 mr-2" />
                            Pinjam: {formatDate(b.borrowDate.toDate())}
                          </div>
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-slate-200 mr-2" />
                            Tenggat: {formatDate(b.dueDate.toDate())}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-8">
                       <span className={cn(
                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border",
                        b.status === 'borrowed' ? "border-blue-500/20 bg-blue-500/10 text-blue-600" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                      )}>
                        {b.status === 'borrowed' ? 'Aktif' : 'Selesai'}
                      </span>
                      <button className="p-3 text-slate-300 hover:text-slate-900 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      default:
        return <div>Halaman tidak ditemukan.</div>;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
}
