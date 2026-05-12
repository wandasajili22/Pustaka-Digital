import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Book, Users, Repeat, ArrowRight, ShieldCheck, Zap, Smartphone, Globe, Mail, MapPin, Phone, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const FeatureCard = ({ icon: Icon, title, desc, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    viewport={{ once: true }}
    className="p-6 md:p-8 bg-white rounded-3xl border border-blue-50 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
  >
    <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
      <Icon className="w-6 h-6 md:w-7 md:h-7" />
    </div>
    <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900 leading-tight">{title}</h3>
    <p className="text-gray-500 text-sm md:text-base leading-relaxed">{desc}</p>
  </motion.div>
);

export default function Landing() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs md:text-sm font-medium mb-6 md:mb-8">
              <Zap className="w-4 h-4" />
              <span>Sistem Perpustakaan Masa Depan</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 md:mb-8 tracking-tight">
              Akses Pengetahuan <br className="hidden md:block" />
              <span className="text-blue-600">Tanpa Batas</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-8 md:mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed md:leading-relaxed">
              Pustaka Digital adalah platform cerdas untuk memajukan literasi. Pinjam, baca, dan kelola koleksi buku Anda dengan lebih modern.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                Jelajahi Katalog
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-semibold hover:bg-gray-50 transition-all"
              >
                Gabung Sekarang
              </Link>
            </div>
          </motion.div>

          {/* Visual / Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <img 
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80" 
              alt="Digital Library Illustration" 
              className="relative z-10 w-full aspect-[4/3] object-cover rounded-[40px] shadow-2xl"
              referrerPolicy="no-referrer"
            />
            {/* Stats Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute -bottom-10 -left-10 z-20 bg-white p-8 rounded-3xl shadow-xl border border-blue-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Terverifikasi</p>
                  <p className="text-2xl font-bold">12.5k+ Anggota</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 text-center">
            {[
              { label: 'Total Buku', value: '5,000+' },
              { label: 'Anggota Aktif', value: '1,200+' },
              { label: 'Peminjaman', value: '15k+' },
              { label: 'Kepuasan', value: '98%' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/50 p-6 rounded-3xl border border-white md:bg-transparent md:p-0 md:rounded-none md:border-0 shadow-sm md:shadow-none">
                <p className="text-2xl md:text-5xl font-black text-blue-600 mb-1">{stat.value}</p>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] md:text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-20 md:py-32 px-6 bg-gray-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 tracking-tight">Koleksi <span className="text-blue-600">Populer</span></h2>
              <p className="text-lg md:text-xl text-gray-500 max-w-xl">
                Beberapa literatur pilihan yang paling banyak dicari oleh siswa dan mahasiswa saat ini.
              </p>
            </div>
            <Link 
              to="/catalog" 
              className="group inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-2xl border border-gray-200 font-bold hover:bg-gray-50 transition-all shadow-sm mx-auto md:mx-0"
            >
              <span>Lihat Semua Katalog</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Atomic Habits',
                author: 'James Clear',
                cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
                tag: 'Diri'
              },
              {
                title: 'Deep Work',
                author: 'Cal Newport',
                cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
                tag: 'Produktif'
              },
              {
                title: 'Clean Code',
                author: 'Robert C. Martin',
                cover: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&q=80',
                tag: 'Tekno'
              },
              {
                title: 'Psychology of Money',
                author: 'Morgan Housel',
                cover: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&q=80',
                tag: 'Bisnis'
              }
            ].map((book, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] rounded-[32px] overflow-hidden mb-6 shadow-xl shadow-gray-200/50">
                  <img 
                    src={book.cover} 
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-blue-600 rounded-lg shadow-sm">
                      {book.tag}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{book.title}</h3>
                <p className="text-gray-500 font-medium">{book.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-square rounded-[40px] md:rounded-[60px] overflow-hidden relative z-10 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&q=80" 
                  alt="Modern Library Space" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 md:-bottom-10 -right-10 w-32 h-32 md:w-64 md:h-64 bg-blue-600 rounded-[30px] md:rounded-[40px] -z-0 opacity-10"></div>
            </motion.div>

            <div className="order-1 lg:order-2">
              <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest mb-6">Tentang Kami</div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 tracking-tight">Dedikasi Kami untuk <span className="text-blue-600">Pendidikan</span></h2>
              <div className="space-y-4 md:space-y-6 text-gray-500 text-base md:text-lg leading-relaxed">
                <p>
                  Pustaka Digital didirikan dengan visi untuk merobohkan batasan akses informasi. Kami percaya bahwa pengetahuan adalah kunci utama kemajuan.
                </p>
                <p>
                  Dengan teknologi modern, kami menghubungkan ribuan pembaca dengan koleksi literatur berkualitas tinggi.
                </p>
                <div className="grid grid-cols-2 gap-4 md:gap-8 pt-6 md:pt-8">
                  <div className="border-l-4 border-blue-600 pl-4 md:pl-6">
                    <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Inovatif</h4>
                    <p className="text-xs md:text-sm">Selalu menggunakan teknologi terkini.</p>
                  </div>
                  <div className="border-l-4 border-blue-600 pl-4 md:pl-6">
                    <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Terpercaya</h4>
                    <p className="text-xs md:text-sm">Menjaga kualitas layanan terbaik.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Mengapa Memilih Kami?</h2>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
              Sistem perpustakaan kami dirancang untuk memberikan pengalaman terbaik bagi pengelola dan pembaca.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard 
              icon={Book} 
              title="Koleksi Terlengkap" 
              desc="Kami menyediakan berbagai genre buku dari fiksi hingga teknis terbaru."
              delay={0.1}
            />
            <FeatureCard 
              icon={Smartphone} 
              title="Akses Mobile" 
              desc="Pinjam buku favorit Anda kapan saja dan di mana saja melalui perangkat mobile."
              delay={0.2}
            />
            <FeatureCard 
              icon={Repeat} 
              title="Sirkulasi Mudah" 
              desc="Proses peminjaman dan pengembalian yang terotomasi dan transparan."
              delay={0.3}
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Keamanan Data" 
              desc="Data Anda aman bersama kami dengan sistem enkripsi tingkat tinggi."
              delay={0.4}
            />
            <FeatureCard 
              icon={Globe} 
              title="Digital First" 
              desc="Pendekatan digital yang meminimalisir penggunaan kertas dan lebih ramah lingkungan."
              delay={0.5}
            />
            <FeatureCard 
              icon={Zap} 
              title="Update Real-time" 
              desc="Dapatkan informasi stok buku dan status peminjaman secara real-time."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 md:py-32 px-4 md:px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-blue-600 rounded-[40px] md:rounded-[60px] p-6 sm:p-10 md:p-12 lg:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 relative z-10">
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-8 text-center lg:text-left leading-tight">Butuh Bantuan? <br className="hidden md:block" /> Hubungi Kami.</h2>
                <p className="text-blue-100 text-sm md:text-lg mb-8 md:mb-12 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                  Punya pertanyaan tentang layanan kami? Tim support kami siap membantu Anda selama 24/7 dengan pelayanan terbaik.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-8">
                  <div className="flex items-center space-x-4 md:space-x-6 text-white group bg-white/5 p-4 rounded-2xl md:bg-transparent md:p-0">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:bg-white/20 transition-all shrink-0">
                      <Mail className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-0.5">Email</p>
                      <p className="text-sm md:text-lg font-bold break-all">support@pustaka.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 md:space-x-6 text-white group bg-white/5 p-4 rounded-2xl md:bg-transparent md:p-0">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:bg-white/20 transition-all shrink-0">
                      <Phone className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-0.5">Telepon</p>
                      <p className="text-sm md:text-lg font-bold">+62 21 555 0123</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 md:space-x-6 text-white group bg-white/5 p-4 rounded-2xl md:bg-transparent md:p-0 sm:col-span-2 lg:col-span-1">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:bg-white/20 transition-all shrink-0">
                      <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-0.5">Lokasi</p>
                      <p className="text-sm md:text-lg font-bold">Jl. Literasi No. 42, Jakarta</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 sm:p-8 lg:p-12 shadow-2xl">
                {isSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 md:py-12"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <ShieldCheck className="w-8 h-8 md:w-10 md:h-10" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-4">Pesan Terkirim!</h3>
                    <p className="text-gray-500 mb-8 text-sm md:text-base px-2">Terima kasih telah menghubungi kami. Kami akan merespon pesan Anda secepatnya.</p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Kirim pesan lagi
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    <div>
                      <label className="block text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                      <input 
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        type="text" 
                        placeholder="Masukkan nama lengkap"
                        className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-hidden focus:bg-white focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Alamat Email</label>
                      <input 
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        type="email" 
                        placeholder="nama@email.com"
                        className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-hidden focus:bg-white focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Pesan Anda</label>
                      <textarea 
                        required
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        rows={4}
                        placeholder="Apa yang bisa kami bantu hari ini?"
                        className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-hidden focus:bg-white focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 transition-all resize-none font-medium text-sm md:text-base"
                      ></textarea>
                    </div>
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="w-full py-4 md:py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center space-x-3 text-sm md:text-base"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 md:w-5 md:h-5" />
                          <span>Kirim Pesan Sekarang</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Map Integration */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 md:mt-20 rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl h-[250px] sm:h-[300px] md:h-[400px] border border-white/10"
            >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126938.5670876121!2d106.7891244!3d-6.1753942!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e3fa73%3A0x70c536412f9ee800!2sJakarta%2C%20Daerah%20Khusus%20Ibukota%20Jakarta!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

