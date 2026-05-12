import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, serverTimestamp, query, orderBy, addDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Borrowing, ReturnRecord } from '../../types';
import { Repeat, CheckCircle, Clock, AlertCircle, Search, Loader2, ArrowRight } from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { logActivity } from '../../lib/logger';

export default function BorrowingsTab() {
  const { profile } = useAuth();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredBorrowings = borrowings.filter(b => {
    if (filter === 'active') return b.status === 'borrowed' || b.status === 'overdue';
    if (filter === 'completed') return b.status === 'returned';
    return true;
  });

  const fetchBorrowings = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'borrowings'), orderBy('createdAt', 'desc')));
      setBorrowings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Borrowing)));
    } catch (error) {
      console.error("Error fetching borrowings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  const handleReturn = async (borrowing: Borrowing) => {
    try {
      setLoading(true);
      // 1. Update borrowing status
      await updateDoc(doc(db, 'borrowings', borrowing.id), {
        status: 'returned',
        updatedAt: serverTimestamp()
      });

      // 2. Create return record
      await addDoc(collection(db, 'returns'), {
        borrowingId: borrowing.id,
        returnDate: serverTimestamp(),
        penalty: 0,
        createdAt: serverTimestamp()
      });

      // 3. Update book availability
      const bookRef = doc(db, 'books', borrowing.bookId);
      const bookSnap = await getDoc(bookRef);
      if (bookSnap.exists()) {
        await updateDoc(bookRef, {
          available: bookSnap.data().available + 1
        });
      }

      // 4. Log Activity
      await logActivity(
        profile?.uid || 'system',
        profile?.name || 'Admin',
        'Pengembalian Buku',
        'admin',
        `Menyelesaikan pengembalian: ${borrowing.bookTitle} oleh ${borrowing.userName}`,
        borrowing.id
      );

      fetchBorrowings();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'return_process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Logistik Peminjaman</h2>
           <p className="text-slate-500 font-medium">Manajemen distribusi dan siklus buku digital.</p>
        </div>
        <div className="flex items-center space-x-3 p-1.5 bg-white border border-slate-100 rounded-2xl">
           <button 
              onClick={() => setFilter('all')}
              className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors", filter === 'all' ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 hover:text-slate-900")}
            >
              Semua
            </button>
           <button 
              onClick={() => setFilter('active')}
              className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors", filter === 'active' ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 hover:text-slate-900")}
            >
              Aktif
            </button>
           <button 
              onClick={() => setFilter('completed')}
              className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors", filter === 'completed' ? "bg-indigo-600 text-white shadow-xl" : "text-slate-500 hover:text-slate-900")}
            >
              Selesai
            </button>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-7 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Dokumentasi Transaksi</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Peminjam</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none text-center">Tenggat Waktu</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none text-center">Status</th>
                <th className="px-10 py-7 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none text-right">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {loading && borrowings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-indigo-500" />
                    <span className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Sinkronisasi logistik...</span>
                  </td>
                </tr>
              ) : filteredBorrowings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">
                    Belum ada riwayat sirkulasi pustaka.
                  </td>
                </tr>
              ) : filteredBorrowings.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-10 py-7">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 bg-white border border-slate-100 text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:border-indigo-500/30 transition-all">
                        <Repeat className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg group-hover:text-indigo-400 transition-colors uppercase tracking-tight leading-none mb-2">{b.bookTitle}</p>
                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest leading-none bg-white px-2 py-0.5 rounded border border-slate-100">TXID: {b.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex flex-col">
                       <span className="text-slate-900 font-bold mb-1 leading-none">{b.userName}</span>
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Identitas User</span>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center justify-center space-x-3 text-slate-500 font-medium bg-white/50 py-2 px-4 rounded-xl border border-slate-100">
                      <Clock className={cn("w-4 h-4", b.status === 'overdue' ? 'text-rose-500' : 'text-amber-500')} />
                      <span className="text-sm font-bold tracking-tight">{b.dueDate?.toDate ? formatDate(b.dueDate.toDate()) : '—'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <span className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl",
                      b.status === 'returned' 
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                        : b.status === 'overdue' 
                        ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {b.status === 'borrowed' ? 'Aktif' : b.status === 'returned' ? 'Selesai' : 'Terlambat'}
                    </span>
                  </td>
                  <td className="px-10 py-7 text-right">
                    {b.status === 'borrowed' && (
                      <button 
                        onClick={() => handleReturn(b)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 flex items-center space-x-2 ml-auto"
                      >
                        <span>Selesaikan</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
