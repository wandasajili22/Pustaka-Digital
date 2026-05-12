import { collection, addDoc, getDocs, query, where, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CATEGORIES = [
  { name: 'Teknologi', description: 'Buku tentang perkembangan teknologi digital dan pemrograman' },
  { name: 'Bisnis', description: 'Panduan bisnis, startup, dan manajemen keuangan' },
  { name: 'Sains', description: 'Ilmu pengetahuan alam dan eksplorasi dunia' },
  { name: 'Sejarah', description: 'Catatan sejarah dunia dan peradaban' },
  { name: 'Pengembangan Diri', description: 'Buku untuk meningkatkan produktivitas dan kepribadian' },
  { name: 'Psikologi', description: 'Memahami perilaku dan pikiran manusia' },
  { name: 'Sastra', description: 'Novel dan karya sastra klasik maupun kontemporer' }
];

const BOOKS = [
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    categoryName: 'Pengembangan Diri',
    description: 'Cara yang sangat mudah dan terbukti untuk membangun kebiasaan baik dan menghilangkan kebiasaan buruk.',
    isbn: '978-0735211292',
    stock: 15,
    available: 15,
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
    publishedYear: 2018,
  },
  {
    title: 'The 7 Habits of Highly Effective People',
    author: 'Stephen R. Covey',
    categoryName: 'Pengembangan Diri',
    description: 'Sebuah pendekatan holistik, terpadu, dan berpusat pada prinsip untuk memecahkan masalah pribadi dan profesional.',
    isbn: '978-1982137205',
    stock: 10,
    available: 10,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    publishedYear: 1989,
  },
  {
    title: 'The Intelligent Investor',
    author: 'Benjamin Graham',
    categoryName: 'Bisnis',
    description: 'Buku klasik tentang investasi bernilai yang telah membantu jutaan orang mencapai tujuan keuangan mereka.',
    isbn: '978-0060555665',
    stock: 8,
    available: 8,
    coverUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=800&q=80',
    publishedYear: 1949,
  },
  {
    title: 'How to Win Friends and Influence People',
    author: 'Dale Carnegie',
    categoryName: 'Pengembangan Diri',
    description: 'Cara-cara praktis untuk meningkatkan keterampilan komunikasi dan hubungan antarmanusia.',
    isbn: '978-0671027032',
    stock: 12,
    available: 12,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    publishedYear: 1936,
  },
  {
    title: 'Brief Answers to the Big Questions',
    author: 'Stephen Hawking',
    categoryName: 'Sains',
    description: 'Pandangan Hawking tentang tantangan terbesar yang dihadapi umat manusia dan masa depan planet kita.',
    isbn: '978-1444727685',
    stock: 7,
    available: 7,
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    publishedYear: 2018,
  },
  {
    title: 'Principles',
    author: 'Ray Dalio',
    categoryName: 'Bisnis',
    description: 'Prinsip-prinsip hidup dan kerja yang membantu menciptakan Bridgewater Associates.',
    isbn: '978-1501124020',
    stock: 9,
    available: 9,
    coverUrl: 'https://images.unsplash.com/photo-1592492152222-d3962e7b7302?w=800&q=80',
    publishedYear: 2017,
  },
  {
    title: 'Filosofi Teras',
    author: 'Henry Manampiring',
    categoryName: 'Pengembangan Diri',
    description: 'Filsafat Stoikisme untuk membantu kita menghadapi kekhawatiran dan membangun ketangguhan mental.',
    isbn: '978-6024125189',
    stock: 20,
    available: 20,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    publishedYear: 2018,
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    categoryName: 'Pengembangan Diri',
    description: 'Aturan untuk sukses yang terfokus dalam dunia yang penuh gangguan.',
    isbn: '978-1455586691',
    stock: 12,
    available: 12,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    publishedYear: 2016,
  },
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    categoryName: 'Bisnis',
    description: 'Pelajaran abadi tentang kekayaan, ketamakan, dan kebahagiaan.',
    isbn: '978-0857197689',
    stock: 18,
    available: 18,
    coverUrl: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=800&q=80',
    publishedYear: 2020,
  },
  {
    title: 'Range',
    author: 'David Epstein',
    categoryName: 'Pengembangan Diri',
    description: 'Mengapa spesialis generalis menang di dunia yang terspesialisasi.',
    isbn: '978-0735214484',
    stock: 11,
    available: 11,
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
    publishedYear: 2019,
  },
  {
    title: 'Thinking in Systems',
    author: 'Donella Meadows',
    categoryName: 'Sains',
    description: 'Sebuah pengantar klasik tentang berpikir sistemik untuk memecahkan masalah kompleks.',
    isbn: '978-1603580557',
    stock: 10,
    available: 10,
    coverUrl: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&q=80',
    publishedYear: 2008,
  },
  {
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    categoryName: 'Teknologi',
    description: 'Buku wajib bagi siapa pun yang tertarik pada desain produk dan pengalaman pengguna.',
    isbn: '978-0465050659',
    stock: 13,
    available: 13,
    coverUrl: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?w=800&q=80',
    publishedYear: 1988,
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    categoryName: 'Sejarah',
    description: 'Sejarah singkat umat manusia dari zaman batu hingga masa kini.',
    isbn: '978-0062316097',
    stock: 25,
    available: 25,
    coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&q=80',
    publishedYear: 2011,
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    categoryName: 'Teknologi',
    description: 'Panduan praktis tentang seni menulis kode yang bersih dan profesional.',
    isbn: '978-0132350884',
    stock: 10,
    available: 10,
    coverUrl: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=800&q=80',
    publishedYear: 2008,
  },
  {
    title: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    categoryName: 'Bisnis',
    description: 'Apa yang orang kaya ajarkan kepada anak-anak mereka tentang uang yang tidak diajarkan oleh orang miskin dan kelas menengah.',
    isbn: '978-1612680194',
    stock: 20,
    available: 20,
    coverUrl: 'https://images.unsplash.com/photo-1544716278-e8a1005ca62c?w=800&q=80',
    publishedYear: 1997,
  },
  {
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    categoryName: 'Bisnis',
    description: 'Salah satu buku keuangan pribadi yang paling laris sepanjang masa.',
    isbn: '978-1585424337',
    stock: 15,
    available: 15,
    coverUrl: 'https://images.unsplash.com/photo-1592492152222-d3962e7b7302?w=800&q=80',
    publishedYear: 1937,
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    categoryName: 'Psikologi',
    description: 'Bagaimana pikiran kita bekerja dan bagaimana kita membuat keputusan.',
    isbn: '978-0374275631',
    stock: 10,
    available: 10,
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
    publishedYear: 2011,
  },
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    categoryName: 'Bisnis',
    description: 'Bagaimana wirausahawan masa kini menggunakan inovasi terus-menerus untuk menciptakan bisnis yang sukses.',
    isbn: '978-0307887894',
    stock: 8,
    available: 8,
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
    publishedYear: 2011,
  },
  {
    title: 'Grit',
    author: 'Angela Duckworth',
    categoryName: 'Psikologi',
    description: 'Kekuatan gairah dan ketekunan untuk mencapai kesuksesan jangka panjang.',
    isbn: '978-1501111105',
    stock: 14,
    available: 14,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    publishedYear: 2016,
  },
  {
    title: 'Start with Why',
    author: 'Simon Sinek',
    categoryName: 'Bisnis',
    description: 'Bagaimana pemimpin besar menginspirasi semua orang untuk mengambil tindakan.',
    isbn: '978-1591846444',
    stock: 12,
    available: 12,
    coverUrl: 'https://images.unsplash.com/photo-1553484771-047a44eee27b?w=800&q=80',
    publishedYear: 2009,
  },
  {
    title: 'Zero to One',
    author: 'Peter Thiel',
    categoryName: 'Bisnis',
    description: 'Catatan tentang startup, atau bagaimana membangun masa depan.',
    isbn: '978-0804139298',
    stock: 10,
    available: 10,
    coverUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
    publishedYear: 2014,
  },
  {
    title: 'Man\'s Search for Meaning',
    author: 'Viktor Frankl',
    categoryName: 'Psikologi',
    description: 'Seorang narapidana kamp konsentrasi menemukan harapan di tengah penderitaan yang luar biasa.',
    isbn: '978-0807014295',
    stock: 15,
    available: 15,
    coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=800&q=80',
    publishedYear: 1946,
  },
  {
    title: 'Pulang',
    author: 'Leila S. Chudori',
    categoryName: 'Fiksi',
    description: 'Sebuah novel tentang cinta, persahabatan, dan pengkhianatan selama masa-masa sulit dalam sejarah Indonesia.',
    isbn: '978-9799105158',
    stock: 15,
    available: 12,
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
    publishedYear: 2012,
  },
  {
    title: 'Filosofi Teras',
    author: 'Henry Manampiring',
    categoryName: 'Psikologi',
    description: 'Panduan praktis tentang filsafat Stoisisme dalam kehidupan sehari-hari.',
    isbn: '978-6020619033',
    stock: 25,
    available: 20,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    publishedYear: 2018,
  },
  {
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    categoryName: 'Fiksi',
    description: 'Menceritakan tentang hilangnya aktivis mahasiswa pada tahun 1998.',
    isbn: '978-6024246938',
    stock: 18,
    available: 15,
    coverUrl: 'https://images.unsplash.com/photo-1543004218-ee14110497f8?w=800&q=80',
    publishedYear: 2017,
  },
  {
    title: 'Bumi',
    author: 'Tere Liye',
    categoryName: 'Fiksi',
    description: 'Petualangan fantasi tiga remaja di dunia paralel.',
    isbn: '978-6020301129',
    stock: 30,
    available: 28,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    publishedYear: 2014,
  }
];

export async function seedDummyData() {
  try {
    const catDocs = await getDocs(collection(db, 'categories'));
    const bookDocs = await getDocs(collection(db, 'books'));
    
    // If we already have a significant amount of data, don't re-seed
    if (catDocs.size >= CATEGORIES.length && bookDocs.size >= BOOKS.length) return;

    console.log('Seeding dummy data...');

    // 1. Seed Categories
    const categoryMap: Record<string, string> = {};
    for (const cat of CATEGORIES) {
      const q = query(collection(db, 'categories'), where('name', '==', cat.name));
      const existing = await getDocs(q);
      
      let catId: string;
      if (existing.empty) {
        try {
          const docRef = await addDoc(collection(db, 'categories'), {
            ...cat,
            createdAt: serverTimestamp()
          });
          catId = docRef.id;
        } catch (e) {
          console.warn('Skipping category seeding due to permissions or error');
          continue;
        }
      } else {
        catId = existing.docs[0].id;
      }
      categoryMap[cat.name] = catId;
    }

    // 2. Seed Books
    for (const bookInfo of BOOKS) {
      const q = query(collection(db, 'books'), where('title', '==', bookInfo.title));
      const existing = await getDocs(q);
      
      if (existing.empty) {
        try {
          const { categoryName, ...bookData } = bookInfo;
          await addDoc(collection(db, 'books'), {
            ...bookData,
            categoryId: categoryMap[categoryName] || Object.values(categoryMap)[0],
            createdAt: serverTimestamp()
          });
        } catch (e) {
          console.warn('Skipping book seeding due to permissions or error');
          continue;
        }
      }
    }

    console.log('Dummy data seeding check complete.');
  } catch (err) {
    console.error('Seeding was skipped or failed:', err);
  }
}
