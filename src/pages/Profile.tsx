import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { User, Mail, Shield, Calendar, Edit2, Loader2, Save, X, Camera, ShieldCheck, Crown } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Profile() {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: name,
        updatedAt: serverTimestamp()
      });
      setIsEditing(false);
      // Optional: Update local state instead of reload if possible
      window.location.reload(); 
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className={cn(
          "rounded-[48px] border overflow-hidden shadow-2xl transition-colors duration-500",
          isAdmin ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
        )}>
          {/* Header Banner */}
          <div className={cn(
            "h-64 relative overflow-hidden",
            isAdmin 
              ? "bg-gradient-to-br from-indigo-900 via-slate-900 to-[#0a0f1d]" 
              : "bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600"
          )}>
            <div className="absolute inset-0 opacity-20">
               <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
            </div>
            
            <div className="absolute -bottom-20 left-16">
              <div className={cn(
                "w-48 h-48 rounded-[48px] p-2 shadow-2xl",
                isAdmin ? "bg-slate-900" : "bg-white"
              )}>
                <div className={cn(
                  "w-full h-full rounded-[40px] flex items-center justify-center relative group",
                  isAdmin ? "bg-slate-950 border border-slate-800 text-indigo-400" : "bg-blue-50 border border-blue-100 text-blue-600"
                )}>
                  <User className="w-20 h-20" />
                  <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[40px] flex items-center justify-center text-white backdrop-blur-sm">
                     <Camera className="w-8 h-8" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-28 px-16 pb-16">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                   <h2 className={cn("text-4xl font-display font-bold tracking-tight", isAdmin ? "text-white" : "text-slate-900")}>{profile?.name}</h2>
                   {isAdmin && <Crown className="w-6 h-6 text-amber-500 fill-amber-500/20" />}
                </div>
                <p className="text-slate-500 font-medium text-lg">{profile?.email}</p>
                <div className="flex items-center space-x-2 mt-4">
                   <span className={cn(
                     "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
                     isAdmin ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-blue-50 text-blue-600 border-blue-100"
                   )}>
                      {isAdmin ? 'System Administrator' : 'Verified Member'}
                   </span>
                </div>
              </div>
              <div className="flex space-x-4">
                {isEditing ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className={cn(
                        "flex items-center space-x-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                        isAdmin ? "bg-slate-950 text-slate-500 border border-slate-800 hover:bg-slate-800" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      <X className="w-4 h-4" />
                      <span>Batal</span>
                    </button>
                    <button 
                      onClick={handleUpdate}
                      disabled={loading}
                      className="flex items-center space-x-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Sinkronisasi</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className={cn(
                      "flex items-center space-x-3 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95",
                      isAdmin ? "bg-indigo-600 text-white hover:bg-indigo-500" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/10"
                    )}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Modifikasi Profil</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <motion.div 
                whileHover={{ y: -5 }}
                className={cn(
                  "p-10 rounded-[40px] border transition-all group",
                  isAdmin ? "bg-slate-950/50 border-slate-800" : "bg-slate-50 border-transparent hover:border-blue-100"
                )}
              >
                <div className="flex items-center space-x-5 mb-8">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center",
                     isAdmin ? "bg-indigo-500/10 text-indigo-400" : "bg-blue-500/10 text-blue-600"
                   )}>
                      <User className="w-6 h-6" />
                   </div>
                   <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Data Personalia</span>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Identitas Lengkap</label>
                    {isEditing ? (
                      <input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className={cn(
                          "w-full px-6 py-4 rounded-2xl outline-hidden focus:ring-4 font-bold transition-all",
                          isAdmin ? "bg-slate-900 text-white border-transparent focus:ring-indigo-500/10" : "bg-white border text-slate-900 border-slate-100 focus:ring-blue-100"
                        )}
                        placeholder="Nama Lengkap"
                      />
                    ) : (
                      <p className={cn("text-xl font-bold leading-none", isAdmin ? "text-white" : "text-slate-900")}>{profile?.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Surat Elektronik</label>
                    <div className="flex items-center space-x-3">
                       <Mail className="w-4 h-4 text-slate-600" />
                       <p className="font-medium text-slate-500">{profile?.email}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className={cn(
                  "p-10 rounded-[40px] border transition-all group",
                  isAdmin ? "bg-slate-950/50 border-slate-800" : "bg-slate-50 border-transparent hover:border-blue-100"
                )}
              >
                <div className="flex items-center space-x-5 mb-8">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center",
                     isAdmin ? "bg-emerald-500/10 text-emerald-400" : "bg-green-500/10 text-green-600"
                   )}>
                      <ShieldCheck className="w-6 h-6" />
                   </div>
                   <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Otoritas & Registrasi</span>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Hak Akses Sistem</label>
                    <div className="flex items-center justify-between">
                       <p className={cn("text-xl font-bold capitalize", isAdmin ? "text-white" : "text-slate-900")}>{profile?.role}</p>
                       <span className={cn(
                         "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                         isAdmin ? "bg-indigo-500/20 text-indigo-400" : "bg-green-100 text-green-700"
                       )}>Aktif</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Timestamp Registrasi</label>
                    <div className="flex items-center space-x-3 text-slate-500">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="font-medium text-base">Terdaftar pada {profile?.createdAt?.toDate ? formatDate(profile.createdAt.toDate()) : 'Baru saja'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
