import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, User, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';
import { logActivity } from '../lib/logger';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['member', 'admin']).default('member'),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
        await updateProfile(user, { displayName: data.name });
        
        // Create user profile in Firestore
        try {
          await setDoc(doc(db, 'users', user.uid), {
            name: data.name,
            email: data.email,
            role: data.role || 'member',
            createdAt: serverTimestamp(),
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}`);
        }

        // Log Registration
        await logActivity(
          user.uid,
          data.name,
          'Registrasi Anggota',
          'user',
          'Bergabung ke platform Pustaka Digital'
        );
      }
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message && err.message.includes('{')) {
        // Likely a FirestoreErrorInfo JSON
        setError('Terjadi kesalahan otorisasi basis data. Silakan coba lagi.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat otentikasi');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-100/40 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-white rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.06)] overflow-hidden border border-white/50 backdrop-blur-xl relative z-10"
      >
        <div className="p-10 md:p-14 text-center">
          <Link to="/" className="inline-flex flex-col items-center group mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-violet-600 rounded-[28px] flex items-center justify-center transform transition-transform group-hover:rotate-12 shadow-2xl shadow-blue-600/30">
              <BookOpen className="text-white w-8 h-8" />
            </div>
            <div className="mt-4 text-center">
              <span className="text-2xl font-display font-black tracking-tighter text-slate-900 block leading-none">PUSTAKA</span>
              <span className="text-[10px] font-black tracking-[0.4em] text-blue-600 uppercase">DIGITAL</span>
            </div>
          </Link>

          <div className="space-y-2 mb-12">
            <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900 leading-tight">
              {isLogin ? 'Selamat Datang' : 'Eksplorasi Dimulai'}
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              {isLogin ? 'Masuk ke hub literatur cerdas Anda.' : 'Bergabunglah dalam ekosistem baca modern.'}
            </p>
          </div>

          <div className="flex bg-slate-100/80 p-1.5 rounded-[24px] mb-10 border border-slate-200/50">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-[18px] transition-all",
                isLogin ? "bg-white text-blue-600 shadow-xl shadow-slate-200/50" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-[18px] transition-all",
                !isLogin ? "bg-white text-blue-600 shadow-xl shadow-slate-200/50" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Register
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-2xl font-bold uppercase tracking-wide"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0, y: -12 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -12 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identitas Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      {...register('name')}
                      className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-transparent focus:border-violet-200 focus:bg-white focus:ring-[12px] focus:ring-violet-500/5 rounded-2xl transition-all outline-hidden font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                      placeholder="Nama Anda"
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase tracking-tight">{errors.name.message as string}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Surat Elektronik</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  {...register('email')}
                  className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-transparent focus:border-violet-200 focus:bg-white focus:ring-[12px] focus:ring-violet-500/5 rounded-2xl transition-all outline-hidden font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                  placeholder="email@pustaka.id"
                />
              </div>
              {errors.email && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase tracking-tight">{errors.email.message as string}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kata Sandi</label>
                {isLogin && <button type="button" className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline transition-all">Reset?</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  {...register('password')}
                  type="password"
                  className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-transparent focus:border-violet-200 focus:bg-white focus:ring-[12px] focus:ring-violet-500/5 rounded-2xl transition-all outline-hidden font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-medium"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase tracking-tight">{errors.password.message as string}</p>}
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="role"
                  initial={{ opacity: 0, height: 0, y: -12 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -12 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Peran</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <select
                      {...register('role')}
                      className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border border-transparent focus:border-violet-200 focus:bg-white focus:ring-[12px] focus:ring-violet-500/5 rounded-2xl transition-all outline-hidden font-bold text-slate-900 appearance-none"
                    >
                      <option value="member">Customer / Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {errors.role && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase tracking-tight">{errors.role.message as string}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-3 shadow-[0_20px_40px_rgba(37,99,235,0.2)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 group mt-10"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Autentikasi' : 'Konfirmasi'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <AnimatePresence mode="wait">
              {isLogin && (
                <motion.div
                  key="demo-creds"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl"
                >
                  <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-3">Akun Demo (Opsional)</p>
                  <div className="space-y-2 text-xs font-medium text-slate-600">
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-800">Admin</span>
                      <span className="font-mono text-[10px] text-slate-500">admin@pustaka.id / admin123</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-800">Customer</span>
                      <span className="font-mono text-[10px] text-slate-500">user@pustaka.id / user123</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </form>

          <p className="mt-12 text-[11px] text-slate-400 font-bold uppercase tracking-widest">
            {isLogin ? "Belum memiliki identitas?" : "Sudah teridentifikasi?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-blue-600 hover:text-violet-600 transition-colors"
            >
              {isLogin ? 'Daftar' : 'Login'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
