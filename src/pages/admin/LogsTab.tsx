import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { History, User, Book as BookIcon, Calendar, Loader2, Activity as ActivityIcon, Ghost, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate, cn } from '../../lib/utils';

export default function LogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(
          collection(db, 'logs'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const snap = await getDocs(q);
        setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                <ActivityIcon className="w-5 h-5 text-indigo-400 animate-pulse" />
             </div>
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Live System Feed</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight leading-none">Aktivitas Sistem</h1>
          <p className="text-slate-500 font-medium mt-3">Monitor investigasi setiap pergerakan data dalam ekosistem.</p>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-7 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Analisis Aktivitas</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Subjek/Entitas</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Sinkronisasi Waktu</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none text-right">Parameter Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 text-indigo-500 opacity-50" />
                    <span className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs leading-none">Mengenkripsi data...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <Ghost className="w-12 h-12 text-slate-800 mx-auto mb-6" />
                    <span className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Anomali: Tidak ada aktivitas tercatat.</span>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={log.id} 
                    className="hover:bg-slate-50 transition-all group"
                  >
                    <td className="px-10 py-7">
                      <div className="flex items-center space-x-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-all group-hover:scale-105",
                          log.type === 'admin' 
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        )}>
                          {log.type === 'admin' ? <ShieldCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg group-hover:text-indigo-400 transition-colors uppercase tracking-tight leading-none mb-2">
                             {log.action}
                          </p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none bg-white px-2 py-0.5 rounded border border-slate-100 inline-block">
                             {log.details || 'System Operation'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center space-x-4">
                        <div className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-slate-900 font-bold leading-none mb-1">{log.userName || 'Root User'}</span>
                           <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">Entitas Pengguna</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center space-x-3 text-slate-500 font-medium bg-white/50 py-2.5 px-4 rounded-2xl border border-slate-100 w-fit">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold leading-none tracking-tight">{log.createdAt?.toDate ? formatDate(log.createdAt.toDate()) : 'Synchronizing...'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <span className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border bg-emerald-50/50 text-emerald-600 border-emerald-200">
                        BERHASIL
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
