import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)]"
        >
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">Akses Dibatasi</h1>
          <p className="text-slate-400 mb-12 text-lg">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini hanya untuk administrator sistem.
          </p>
          
          <Link
            to="/dashboard"
            className="inline-flex items-center space-x-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
