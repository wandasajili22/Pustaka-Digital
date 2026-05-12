import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile } from '../../types';
import { Users, Search, Mail, Calendar, User as UserIcon, Shield, Crown, Loader2, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../hooks/useAuth';
import { logActivity } from '../../lib/logger';

export default function MembersTab() {
  const { profile: adminProfile } = useAuth();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      setMembers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleToggleRole = async (member: UserProfile) => {
    if (member.uid === adminProfile?.uid) {
      alert("Anda tidak dapat mengubah peran Anda sendiri.");
      return;
    }

    const newRole = member.role === 'admin' ? 'member' : 'admin';
    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', member.uid), { role: newRole });
      await logActivity(
        adminProfile?.uid || 'system',
        adminProfile?.name || 'Admin',
        'Manajemen Peran',
        'admin',
        `Mengubah peran ${member.name} menjadi ${newRole}`,
        member.uid
      );
      fetchMembers();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (member: UserProfile) => {
    if (member.uid === adminProfile?.uid) {
      alert("Anda tidak dapat menghapus akun Anda sendiri.");
      return;
    }

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'users', member.uid));
      await logActivity(
        adminProfile?.uid || 'system',
        adminProfile?.name || 'Admin',
        'Penghapusan Anggota',
        'admin',
        `Menghapus anggota: ${member.name}`,
        member.uid
      );
      fetchMembers();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-[450px] group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Identifikasi anggota..." 
            className="w-full pl-14 pr-8 py-4 bg-white border border-slate-100 rounded-2xl outline-hidden focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>
        <div className="bg-white border border-slate-100 px-6 py-4 rounded-2xl flex items-center space-x-4 shadow-xl">
          <div className="flex -space-x-3">
             {members.slice(0, 3).map((m, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-500">
                   {m.name.charAt(0)}
                </div>
             ))}
             {members.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] font-black text-slate-900">
                   +{members.length - 3}
                </div>
             )}
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Total Entitas: {members.length}</span>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Anggota Perpustakaan</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Kredensial</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none text-center">Hak Akses</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Registrasi</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none text-right">Parameter Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {loading && members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                     <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-indigo-500" />
                     <span className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Mengunduh data user...</span>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center text-slate-500 italic font-medium">
                    Entitas tidak ditemukan dalam basis data.
                  </td>
                </tr>
              ) : filteredMembers.map(member => (
                <tr key={member.uid} className="hover:bg-slate-50 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 bg-white border border-slate-100 text-indigo-400 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 group-hover:border-indigo-500/50 transition-all">
                         <UserIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg group-hover:text-indigo-400 transition-colors uppercase tracking-tight leading-none mb-1">{member.name}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">UID: {member.uid.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-2 text-slate-500 font-medium whitespace-nowrap">
                      <Mail className="w-4 h-4 text-slate-600" />
                      <span>{member.email}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className="flex justify-center">
                       <button 
                        onClick={() => handleToggleRole(member)}
                        className={cn(
                         "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100",
                         member.role === 'admin' 
                           ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                           : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                       )}
                        disabled={member.uid === adminProfile?.uid}
                       >
                        {member.role === 'admin' ? <Crown className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                        <span>{member.role === 'admin' ? 'Administrator' : 'Anggota'}</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <p className="text-slate-900 font-bold text-sm mb-1 leading-none">
                        {member.createdAt?.toDate ? formatDate(member.createdAt.toDate()) : 'Recent'}
                      </p>
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">Terdaftar</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => handleDeleteMember(member)}
                      disabled={member.uid === adminProfile?.uid}
                      className="p-3 bg-white border border-slate-100 text-slate-500 rounded-xl hover:text-rose-500 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed group/del"
                    >
                      <Trash2 className="w-4 h-4 transition-transform group-hover/del:scale-110" />
                    </button>
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
