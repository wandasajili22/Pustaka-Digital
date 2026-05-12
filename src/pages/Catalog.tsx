import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Book, Category } from '../types';
import { Search, Filter, BookIcon, ArrowRight, Loader2, BookOpen, X, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';
import { cn, formatDate } from '../lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { logActivity } from '../lib/logger';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const booksSnap = await getDocs(query(collection(db, 'books'), orderBy('createdAt', 'desc')));
        const catsSnap = await getDocs(collection(db, 'categories'));
        
        const cats = catsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
        setCategories(cats);
        setBooks(booksSnap.docs.map(d => {
          const data = d.data();
          const cat = cats.find(c => c.id === data.categoryId);
          return { id: d.id, ...data, categoryName: cat?.name } as Book;
        }));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'catalog_data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBorrow = async () => {
    if (!user || !profile || !selectedBook) {
      navigate('/auth');
      return;
    }

    if (selectedBook.available <= 0) return;

    setIsBorrowing(true);
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // 7 days loan

      // 1. Create borrowing record
      await addDoc(collection(db, 'borrowings'), {
        userId: user.uid,
        userName: profile.name,
        bookId: selectedBook.id,
        bookTitle: selectedBook.title,
        coverUrl: selectedBook.coverUrl,
        status: 'borrowed',
        borrowDate: serverTimestamp(),
        dueDate: dueDate,
        createdAt: serverTimestamp()
      });

      // 2. Update book availability
      await updateDoc(doc(db, 'books', selectedBook.id), {
        available: selectedBook.available - 1
      });

      // 3. Log Activity
      await logActivity(
        user.uid,
        profile.name,
        'Peminjaman Buku',
        'user',
        `Meminjam: ${selectedBook.title}`,
        selectedBook.id
      );

      alert('Berhasil meminjam buku! Silakan cek dashboard Anda.');
      setSelectedBook(null);
      setBooks(books.map(b => b.id === selectedBook.id ? { ...b, available: b.available - 1 } : b));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'borrowings');
    } finally {
      setIsBorrowing(false);
    }
  };

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || b.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const catalogContent = (
    <div className={cn("flex-1 px-4 max-w-7xl mx-auto w-full relative", !user && "pt-32 pb-24 px-8")}>
      {/* Background Decorative Blob */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-violet-400/5 blur-[120px] rounded-full" />
      
      {/* Page Header */}
      <div className="mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3 mb-4"
        >
           <div className="w-1.5 h-6 bg-violet-400 rounded-full" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Arsip Global</span>
        </motion.div>
        <h1 className="text-5xl font-display font-bold tracking-tight mb-6 text-slate-950">
          Eksplorasi <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-500">Pustaka Digital</span>
        </h1>
        <p className="text-slate-500 text-xl max-w-3xl font-medium leading-relaxed">
          Temukan koleksi literatur terbaik yang dikurasi secara profesional untuk memperluas cakrawala pengetahuan Anda.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-6 mb-16">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-violet-500 transition-colors" />
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari buku, penulis, atau topik..." 
            className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[32px] shadow-2xl shadow-slate-200/20 text-lg font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
        <div className="flex items-center overflow-x-auto pb-4 lg:pb-0 scrollbar-hide -mx-2 px-2">
           <div className="p-1.5 bg-white rounded-[32px] border border-slate-100 flex items-center space-x-1 shadow-sm">
              <button 
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  "px-7 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedCategory === 'all' 
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-xl shadow-blue-600/20" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                Semua Bidang
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-7 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    selectedCategory === cat.id 
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-xl shadow-blue-600/20" 
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {cat.name}
                </button>
              ))}
           </div>
        </div>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Menyiapkan Koleksi...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[28px] md:rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
            <BookIcon className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Buku Tidak Ditemukan</h3>
          <p className="text-gray-500 mb-8 px-4">Coba gunakan kata kunci lain atau periksa kategori Anda.</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredBooks.map((book) => (
            <motion.div 
              key={book.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[32px] md:rounded-[40px] border border-gray-100 shadow-sm shadow-gray-200/50 overflow-hidden group cursor-pointer"
              onClick={() => setSelectedBook(book)}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img 
                  src={book.coverUrl || 'https://images.unsplash.com/photo-1543004218-ee14110497f8?w=800&q=80'} 
                  alt={book.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-blue-600 text-[10px] font-black uppercase rounded-lg shadow-sm">
                    {book.categoryName}
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <h3 className="font-bold text-base md:text-lg mb-1 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">{book.title}</h3>
                <p className="text-xs md:text-sm text-gray-400 mb-4 md:mb-6 font-medium">{book.author}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Status</span>
                    <span className={cn(
                      "text-[10px] md:text-xs font-bold uppercase",
                      book.available > 0 ? "text-green-600" : "text-red-500"
                    )}>
                       {book.available > 0 ? `${book.available} Tersedia` : 'Habis Pinjam'}
                    </span>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-gray-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedBook(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto shrink-0">
                <img 
                  src={selectedBook.coverUrl || 'https://images.unsplash.com/photo-1543004218-ee14110497f8?w=800&q=80'} 
                  className="w-full h-full object-cover"
                  alt={selectedBook.title}
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                <div className="mb-6 md:mb-8">
                  <span className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-xl tracking-widest inline-block mb-4 md:mb-6">
                    {selectedBook.categoryName}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4">{selectedBook.title}</h2>
                  <p className="text-lg md:text-xl text-gray-500 font-medium">Buku oleh <span className="text-gray-900">{selectedBook.author}</span></p>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-10">
                  <div className="p-4 md:p-6 bg-gray-50 rounded-2xl md:rounded-3xl">
                    <div className="flex items-center space-x-3 text-gray-400 mb-2">
                       <Clock className="w-4 h-4" />
                       <span className="text-[10px] font-bold uppercase tracking-wider">Durasi</span>
                    </div>
                    <p className="font-bold text-base md:text-lg">7 Hari</p>
                  </div>
                  <div className="p-4 md:p-6 bg-gray-50 rounded-2xl md:rounded-3xl">
                    <div className="flex items-center space-x-3 text-gray-400 mb-2">
                       <Calendar className="w-4 h-4" />
                       <span className="text-[10px] font-bold uppercase tracking-wider">Terbit</span>
                    </div>
                    <p className="font-bold text-base md:text-lg">{selectedBook.publishedYear}</p>
                  </div>
                </div>

                <div className="mb-8 md:mb-12">
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 md:mb-4">Sinopsis Buku</h4>
                   <p className="text-sm md:text-gray-600 leading-relaxed overflow-y-auto max-h-40 md:max-h-32 pr-2">
                     {selectedBook.description || 'Tidak ada deskripsi tersedia untuk buku ini.'}
                   </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <button 
                    onClick={handleBorrow}
                    disabled={selectedBook.available <= 0 || isBorrowing}
                    className="flex-1 px-6 md:px-8 py-4 md:py-5 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-3 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                  >
                    {isBorrowing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                        <span>{selectedBook.available > 0 ? 'Pinjam Sekarang' : 'Stok Kosong'}</span>
                      </>
                    )}
                  </button>
                  <div className="px-6 py-4 md:py-5 bg-white border border-gray-100 rounded-2xl text-center flex sm:flex-col items-center sm:items-center justify-between sm:justify-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase leading-none sm:mb-1">Tersedia</span>
                    <span className="font-black text-lg md:text-xl text-gray-900 leading-none">{selectedBook.available}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  if (user) {
    return (
      <DashboardLayout>
        {catalogContent}
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {catalogContent}
      </main>
      <Footer />
    </div>
  );
}
