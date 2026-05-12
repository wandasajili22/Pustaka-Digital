import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Twitter, Github, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 group text-white">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transform transition-transform group-hover:rotate-12">
                <BookOpen className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">Pustaka <span className="text-blue-600">Digital</span></span>
            </Link>
            <p className="text-gray-400 leading-relaxed max-w-xs">
              Membangun masa depan literasi melalui teknologi digital yang inovatif, transparan, dan mudah diakses.
            </p>
            <div className="flex space-x-4">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all">
                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8">Pintasan</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/" className="hover:text-blue-500 transition-colors">Beranda</Link></li>
              <li><Link to="/catalog" className="hover:text-blue-500 transition-colors">Katalog Buku</Link></li>
              <li><Link to="/auth" className="hover:text-blue-500 transition-colors">Masuk Anggota</Link></li>
              <li><Link to="/#about" className="hover:text-blue-500 transition-colors">Tentang Kami</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8">Pusat Bantuan</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-blue-500 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Aturan Peminjaman</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-blue-500 transition-colors">Syarat & Ketentuan</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8">Kontak</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <span>support@pustakadigital.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-500" />
                <span>+62 21 555 0123</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                <span>Jl. Literasi No. 42, Jakarta</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Pustaka Digital. All rights reserved.
          </p>
          <div className="flex space-x-8 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Digital Library</a>
            <a href="#" className="hover:text-white transition-colors">Premium SaaS</a>
            <a href="#" className="hover:text-white transition-colors">Education First</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
