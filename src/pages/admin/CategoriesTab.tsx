import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Category } from '../../types';
import { Plus, Edit2, Trash2, Layers, X, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { logActivity } from '../../lib/logger';

export default function CategoriesTab() {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'categories'));
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (editingCat) {
        await updateDoc(doc(db, 'categories', editingCat.id), { ...data });
        await logActivity(
          profile?.uid || 'system',
          profile?.name || 'Admin',
          'Modifikasi Kategori',
          'admin',
          `Update kategori: ${data.name}`,
          editingCat.id
        );
      } else {
        const docRef = await addDoc(collection(db, 'categories'), { ...data, createdAt: serverTimestamp() });
        await logActivity(
          profile?.uid || 'system',
          profile?.name || 'Admin',
          'Manifestasi Kategori',
          'admin',
          `Menambahkan kategori baru: ${data.name}`,
          docRef.id
        );
      }
      setIsModalOpen(false);
      reset();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const catToDelete = categories.find(c => c.id === id);
      await deleteDoc(doc(db, 'categories', id));
      await logActivity(
        profile?.uid || 'system',
        profile?.name || 'Admin',
        'Eliminasi Kategori',
        'admin',
        `Menghapus kategori: ${catToDelete?.name || id}`,
        id
      );
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
        <div>
           <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Arsitektur Kategori</h2>
           <p className="text-slate-500 font-medium text-lg mt-2">Klasifikasi semantik untuk pengarsipan literatur digital.</p>
        </div>
        <button 
          onClick={() => { setEditingCat(null); reset(); setIsModalOpen(true); }}
          className="w-full xl:w-auto flex items-center justify-center space-x-3 px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all group"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
          <span>Tambah Klasifikasi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading && categories.length === 0 ? (
          <div className="col-span-full py-32 text-center">
             <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6 text-indigo-500 opacity-50" />
             <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Mengakses basis metadata...</p>
          </div>
        ) : categories.length === 0 ? (
           <div className="col-span-full admin-card p-24 text-center border-dashed border-2 border-slate-100">
             <Layers className="w-16 h-16 text-slate-700 mx-auto mb-6 animate-pulse" />
             <p className="text-slate-500 font-bold uppercase tracking-[0.2em]">Belum ada struktur kategori terdefinisi.</p>
           </div>
        ) : categories.map(cat => (
          <motion.div 
            layout
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-card p-10 flex flex-col group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
               <Sparkles className="w-16 h-16 text-indigo-400 rotate-12" />
            </div>
            
            <div className="w-16 h-16 bg-white border border-slate-100 text-indigo-400 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5 transition-all">
              <Layers className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-display font-bold text-slate-900 mb-3 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{cat.name}</h4>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium line-clamp-3 h-[60px]">{cat.description || 'Tidak ada deskripsi semantik terdefinisi untuk kategori ini.'}</p>
            
            <div className="flex gap-3 mt-auto">
              <button 
                onClick={() => { setEditingCat(cat); setValue('name', cat.name); setValue('description', cat.description); setIsModalOpen(true); }}
                className="flex-1 py-4 bg-white border border-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xl"
              >
                Modifikasi
              </button>
              <button 
                onClick={() => handleDelete(cat.id)}
                className="flex-1 py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-xl"
              >
                Eliminasi
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-white/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-xl rounded-[48px] p-12 shadow-2xl shadow-slate-200/50 border border-slate-100"
            >
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h3 className="text-3xl font-display font-bold text-slate-900 tracking-tight leading-none">{editingCat ? 'Modifikasi Struktur' : 'Klasifikasi Baru'}</h3>
                  <p className="text-slate-500 font-medium text-sm mt-3">Definisikan skema klasifikasi secara presisi.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 transition-all text-slate-500"
                >
                   <X className="w-7 h-7" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Nomenklatur Kategori</label>
                  <input {...register('name')} className="w-full px-8 py-5 bg-white border border-slate-100 focus:border-indigo-500/50 text-slate-900 rounded-3xl outline-hidden font-bold transition-all placeholder:text-slate-400" placeholder="e.g. Metafisika & Filosofi" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Deskripsi Semantik</label>
                  <textarea {...register('description')} rows={5} className="w-full px-8 py-6 bg-white border border-slate-100 focus:border-indigo-500/50 text-slate-900 rounded-3xl outline-hidden font-bold transition-all resize-none placeholder:text-slate-400" placeholder="Uraikan esensi dari klasifikasi ini..." />
                </div>
                <div className="flex space-x-6">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-white border border-slate-100 text-slate-500 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">Diskard</button>
                   <button className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl shadow-indigo-600/30 uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all active:scale-95">{editingCat ? 'Sinkronisasi' : 'Manifestasi'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
