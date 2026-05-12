export type UserRole = 'admin' | 'member';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string;
  createdAt: any;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  isbn: string;
  stock: number;
  available: number;
  coverUrl: string;
  publishedYear: number;
  createdAt: any;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: any;
}

export interface Borrowing {
  id: string;
  userId: string;
  userName: string;
  bookId: string;
  bookTitle: string;
  coverUrl?: string;
  borrowDate: any;
  dueDate: any;
  status: 'borrowed' | 'returned' | 'overdue';
  createdAt: any;
}

export interface ReturnRecord {
  id: string;
  borrowingId: string;
  returnDate: any;
  penalty: number;
  notes?: string;
  createdAt: any;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: any;
}
