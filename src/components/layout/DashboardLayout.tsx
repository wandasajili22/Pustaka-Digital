import React, { useState } from 'react';
import { 
  Users, 
  Book, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search, 
  User,
  LayoutDashboard,
  Layers,
  Repeat,
  History,
  ShieldCheck,
  ChevronLeft,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarItem {
  name: string;
  icon: any;
  path: string;
  role: 'admin' | 'user' | 'all';
}

const menuItems: SidebarItem[] = [
  { name: 'Sinergi Dashboard', icon: BarChart3, path: '/admin', role: 'admin' },
  { name: 'Arsip Pustaka', icon: Book, path: '/admin/books', role: 'admin' },
  { name: 'Sentral Anggota', icon: Users, path: '/admin/members', role: 'admin' },
  { name: 'Sirkulasi Buku', icon: Repeat, path: '/admin/borrowings', role: 'admin' },
  { name: 'Struktur Kategori', icon: Layers, path: '/admin/categories', role: 'admin' },
  { name: 'Log Investigasi', icon: History, path: '/admin/logs', role: 'admin' },
  
  { name: 'Pusat Baca', icon: LayoutDashboard, path: '/dashboard', role: 'user' },
  { name: 'Katalog Global', icon: BookOpen, path: '/catalog', role: 'user' },
  { name: 'Profil Saya', icon: User, path: '/profile', role: 'user' },
];

export default function DashboardLayout({ children, activeTab, onTabChange }: { children: React.ReactNode, activeTab?: string, onTabChange?: (tab: string) => void }) {
  const { profile, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = profile?.role === 'admin';

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const filteredMenu = menuItems.filter(item => 
    item.role === 'all' || (isAdmin ? item.role === 'admin' : item.role === 'user')
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-700 font-sans",
      "bg-slate-50 selection:bg-blue-100 selection:text-blue-600"
    )}>
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 z-50 transition-all duration-500 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "w-[320px] bg-white border-r border-slate-100 shadow-[20px_0_50px_rgba(0,0,0,0.02)]",
        "lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-8 pb-12 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transform transition-transform hover:rotate-12 bg-blue-600 shadow-[0_10px_30px_rgba(59,130,246,0.3)]"
              )}>
                <BookOpen className="text-white w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-black tracking-tighter leading-none text-slate-900">PUSTAKA</span>
                <span className="text-xs font-black tracking-[0.3em] uppercase text-blue-600">DIGITAL</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
            {filteredMenu.map((item) => {
              const isActive = location.pathname === item.path || activeTab === item.path.split('/').pop();
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    const isInternalTab = item.path.startsWith(location.pathname) || (location.pathname === '/admin' && item.path.startsWith('/admin'));
                    
                    if (onTabChange && isInternalTab) {
                      const parts = item.path.split('/');
                      const tab = (parts.length <= 2 || parts[parts.length - 1] === 'dashboard') 
                        ? 'dashboard' 
                        : parts[parts.length - 1];
                      onTabChange(tab);
                    } else {
                      navigate(item.path);
                    }
                  }}
                   className={cn(
                    "w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative",
                    isActive 
                      ? "bg-blue-50 text-blue-600 shadow-xl shadow-blue-500/5 font-bold"
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive ? "animate-pulse" : ""
                  )} />
                  <span className="text-sm font-bold tracking-tight uppercase">{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 mt-auto">
            <div className={cn(
              "p-6 rounded-[32px] border flex flex-col space-y-4 bg-slate-50 border-slate-100"
            )}>
              <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                    {profile?.name?.charAt(0) || 'U'}
                 </div>
                 <div className="flex flex-col min-w-0">
                    <p className="text-xs font-black uppercase truncate text-slate-900">{profile?.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{isAdmin ? 'Administrator' : 'Anggota Aktif'}</p>
                 </div>
              </div>
              <button 
                onClick={handleLogout}
                className={cn(
                  "w-full py-4 rounded-2xl flex items-center justify-center space-x-3 transition-all font-black text-[10px] uppercase tracking-widest bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 shadow-sm"
                )}
              >
                <LogOut className="w-4 h-4" />
                <span>TERMINASI SESI</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "transition-all duration-500",
        isSidebarOpen ? "ml-0" : "ml-0",
        "lg:ml-[320px]"
      )}>
        {/* Header */}
        <header className={cn(
          "h-24 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-2xl transition-all bg-slate-50/80 border-b border-slate-100"
        )}>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "w-12 h-12 flex items-center justify-center transition-all active:scale-95 text-slate-500 hover:text-slate-900 lg:hidden"
              )}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden md:flex items-center px-4 py-2.5 bg-slate-100/10 border border-slate-200/10 rounded-xl space-x-3 w-[400px]">
               <Search className="w-4 h-4 text-slate-500" />
               <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleGlobalSearch}
                placeholder="Identifikasi buku atau anggota..." 
                className={cn(
                  "bg-transparent border-none outline-hidden text-sm font-medium w-full text-slate-900 placeholder:text-slate-400"
                )}
               />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all bg-white border border-slate-100 text-slate-500 hover:text-blue-600 shadow-sm"
              )}>
                <Bell className="w-5 h-5" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              </button>
            </div>
            {isAdmin && (
              <div className="flex flex-col items-end mr-4">
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Status Sistem</span>
                 <span className="text-[10px] font-bold text-emerald-500 uppercase leading-none flex items-center">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
                    Operasional
                 </span>
              </div>
            )}
            <Link to="/profile" className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all overflow-hidden border-2 border-white hover:border-blue-100 shadow-xl"
            )}>
              <div className="w-full h-full flex items-center justify-center font-black bg-blue-600 text-white">
                {profile?.name?.charAt(0) || 'U'}
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 lg:p-12 relative overflow-hidden">
          {/* Background Blobs for specific vibes */}
             <div className="absolute top-0 right-0 -z-10 translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-50 rounded-full blur-[120px] pointer-events-none" />
          
          <motion.div
            key={location.pathname + activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
