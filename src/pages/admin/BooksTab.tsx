import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Book, Category } from '../../types';
import { Plus, Search, Edit2, Trash2, Book as BookIcon, X, Loader2, Filter, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { logActivity } from '../../lib/logger';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const bookSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  author: z.string().min(1, 'Penulis wajib diisi'),
  categoryId: z.string().min(1, 'Kategori wajib diisi'),
  description: z.string(),
  isbn: z.string(),
  stock: z.number().min(0, 'Stok minimal 0'),
  coverUrl: z.string().url('URL cover tidak valid').or(z.string().length(0)),
  publishedYear: z.number(),
});

export default function BooksTab({ defaultOpenModal = false }: { defaultOpenModal?: boolean }) {
  const { profile } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(defaultOpenModal);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      stock: 1,
      publishedYear: new Date().getFullYear(),
    }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const booksSnap = await getDocs(query(collection(db, 'books'), orderBy('createdAt', 'desc')));
      const catsSnap = await getDocs(collection(db, 'categories'));
      
      const cats = catsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
      setCategories(cats);

      setBooks(booksSnap.docs.map(d => {
        const data = d.data();
        const cat = cats.find(c => c.id === data.categoryId);
        return { 
          id: d.id, 
          ...data, 
          categoryName: cat?.name || 'Uncategorized' 
        } as Book;
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (editingBook) {
        await updateDoc(doc(db, 'books', editingBook.id), {
          ...data,
          available: editingBook.available + (data.stock - editingBook.stock),
          updatedAt: serverTimestamp(),
        });
        await logActivity(
          profile?.uid || 'system',
          profile?.name || 'Admin',
          'Pembaruan Buku',
          'admin',
          `Update metadata buku: ${data.title}`,
          editingBook.id
        );
      } else {
        const docRef = await addDoc(collection(db, 'books'), {
          ...data,
          available: data.stock,
          createdAt: serverTimestamp(),
        });
        await logActivity(
          profile?.uid || 'system',
          profile?.name || 'Admin',
          'Penambahan Buku',
          'admin',
          `Menambahkan buku baru: ${data.title}`,
          docRef.id
        );
      }
      setIsModalOpen(false);
      setEditingBook(null);
      reset();
      fetchData();
    } catch (err) {
      handleFirestoreError(err, editingBook ? OperationType.UPDATE : OperationType.CREATE, 'books');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const bookToDelete = books.find(b => b.id === id);
      await deleteDoc(doc(db, 'books', id));
      await logActivity(
        profile?.uid || 'system',
        profile?.name || 'Admin',
        'Penghapusan Buku',
        'admin',
        `Menghapus buku: ${bookToDelete?.title || id}`,
        id
      );
      fetchData();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `books/${id}`);
    }
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    Object.keys(bookSchema.shape).forEach((key) => {
      setValue(key as any, (book as any)[key]);
    });
    setIsModalOpen(true);
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(books.map(({ categoryName, ...b }) => ({
      ID: b.id,
      Judul: b.title,
      Penulis: b.author,
      Kategori: categoryName,
      ISBN: b.isbn,
      Stok: b.stock,
      Tersedia: b.available,
      Tahun: b.publishedYear
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Buku");
    XLSX.writeFile(workbook, "Daftar_Buku.xlsx");
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
        <div className="relative w-full xl:w-[500px] group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari pustaka digital..." 
            className="w-full pl-14 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-hidden focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>
        <div className="flex items-center space-x-3 w-full xl:w-auto">
          <button 
            onClick={exportExcel}
            className="flex-1 xl:flex-none flex items-center justify-center space-x-3 px-8 py-4 bg-white border border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition-all text-slate-600 shadow-xl"
          >
            <Download className="w-5 h-5" />
            <span>Ekspor Excel</span>
          </button>
          <button 
            onClick={() => { setEditingBook(null); reset(); setIsModalOpen(true); }}
            className="flex-1 xl:flex-none flex items-center justify-center space-x-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
            <span>Tambah Buku</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Karya Sastra</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Klasifikasi</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Visibilitas</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ketersediaan</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-indigo-500" />
                    <span className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Sinkronisasi data...</span>
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center text-slate-500">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                      <BookIcon className="w-10 h-10 opacity-20" />
                    </div>
                    <span className="font-bold uppercase tracking-[0.3em] text-xs">Pustaka masih kosong</span>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center space-x-6">
                        <div className="relative group/cover">
                          <img 
                            src={book.coverUrl || 'https://images.unsplash.com/photo-1543004218-ee14110497f8?w=200&q=80'} 
                            className="w-14 h-20 object-cover rounded-xl shadow-2xl transition-transform group-hover/cover:scale-105"
                            alt={book.title}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover/cover:opacity-100 transition-opacity rounded-xl" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{book.title}</p>
                          <p className="text-sm text-slate-500 font-medium">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="px-4 py-1 bg-white border border-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest">{book.categoryName}</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className={cn(
                        "px-4 py-1 text-[10px] font-black rounded-lg uppercase tracking-widest border",
                        book.available > 0 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                          : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      )}>
                        {book.available > 0 ? 'Tersedia' : 'Habis'}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col max-w-[120px]">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-black text-slate-900">{book.available} <span className="text-slate-500 text-[10px]">/ {book.stock}</span></span>
                           <span className="text-[10px] font-black text-slate-500">{Math.round((book.available / book.stock) * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white rounded-full overflow-hidden border border-slate-100">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(book.available / book.stock) * 100}%` }}
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              book.available > 5 ? "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                            )}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={() => openEdit(book)}
                          className="p-3 bg-white border border-slate-100 text-slate-500 rounded-xl hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all shadow-xl"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(book.id)}
                          className="p-3 bg-white border border-slate-100 text-slate-500 rounded-xl hover:text-rose-500 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all shadow-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-white/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-white/30">
                <div>
                  <h3 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{editingBook ? 'Modifikasi Pustaka' : 'Manifesto Buku Baru'}</h3>
                  <p className="text-slate-500 font-medium mt-2">Pastikan metadata literatur akurat dan lengkap.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 transition-all text-slate-500">
                  <X className="w-7 h-7" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-12 space-y-10 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Judul Pustaka</label>
                    <input {...register('title')} className="w-full px-8 py-5 bg-white border border-slate-100 focus:border-indigo-500/50 text-slate-900 rounded-3xl outline-hidden font-bold transition-all placeholder:text-slate-400" placeholder="e.g. Filosofi Teras" />
                    {errors.title && <p className="text-xs text-rose-500 font-bold mt-2 ml-2 tracking-wide">{errors.title.message as string}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Penulis / Kreator</label>
                    <input {...register('author')} className="w-full px-8 py-5 bg-white border border-slate-100 focus:border-indigo-500/50 text-slate-900 rounded-3xl outline-hidden font-bold transition-all placeholder:text-slate-400" placeholder="e.g. Henry Manampiring" />
                    {errors.author && <p className="text-xs text-rose-500 font-bold mt-2 ml-2 tracking-wide">{errors.author.message as string}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Klasifikasi Kategori</label>
                    <div className="relative group">
                      <select {...register('categoryId')} className="w-full px-8 py-5 bg-white border border-slate-100 focus:border-indigo-500/50 text-slate-900 rounded-3xl outline-hidden font-bold transition-all appearance-none cursor-pointer">
                        <option value="" className="bg-white">Pilih Kategori</option>
                        {categories.map(c => <option key={c.id} value={c.id} className="bg-white">{c.name}</option>)}
                      </select>
                      <Filter className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                    </div>
                    {errors.categoryId && <p className="text-xs text-rose-500 font-bold mt-2 ml-2 tracking-wide">{errors.categoryId.message as string}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Stok</label>
                      <input type="number" {...register('stock', { valueAsNumber: true })} className="w-full px-8 py-5 bg-white border border-slate-100 focus:border-indigo-500/50 text-slate-900 rounded-3xl outline-hidden font-bold transition-all" />
                      {errors.stock && <p className="text-xs text-rose-500 font-bold mt-2 ml-2 tracking-wide">{errors.stock.message as string}</p>}
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Vibrasi Tahun</label>
                      <input type="number" {...register('publishedYear', { valueAsNumber: true })} className="w-full px-8 py-5 bg-white border border-slate-100 focus:border-indigo-500/50 text-slate-900 rounded-3xl outline-hidden font-bold transition-all" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Identifikasi ISBN</label>
                    <input {...register('isbn')} className="w-full px-8 py-5 bg-white border border-slate-100 focus:border-indigo-500/50 text-slate-900 rounded-3xl outline-hidden font-bold transition-all placeholder:text-slate-400" placeholder="e.g. 978-602-06-3317-6" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Visual Aset (URL)</label>
                    <input {...register('coverUrl')} className="w-full px-8 py-5 bg-white border border-slate-100 focus:border-indigo-500/50 text-slate-900 rounded-3xl outline-hidden font-bold transition-all placeholder:text-slate-400" placeholder="https://unsplash.com/your-image.jpg" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Semantik Deskripsi</label>
                  <textarea {...register('description')} rows={4} className="w-full px-8 py-6 bg-white border border-slate-100 focus:border-indigo-500/50 text-slate-900 rounded-3xl outline-hidden font-bold transition-all resize-none placeholder:text-slate-400" placeholder="Deskripsikan esensi dari buku ini secara mendalam..." />
                </div>

                <div className="pt-10 flex space-x-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-white border border-slate-100 text-slate-500 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">Diskard</button>
                  <button type="submit" disabled={loading} className="flex-[2] py-5 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl shadow-indigo-600/30 uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-900" /> : (editingBook ? 'Perbarui Manifesto' : 'Terbitkan Pustaka')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
