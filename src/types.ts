import { User } from 'firebase/auth';

export type AdminRole = 'superadmin' | 'subadmin' | 'customer';

export interface AdminPermissions {
  overview: boolean;
  products: boolean;
  orders: boolean;
  vouchers: boolean;
  reports: boolean;
  pages: boolean;
  settings: boolean;
  approvals: boolean;
  admins: boolean;
}

export interface MappedUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  role: AdminRole;
  permissions?: AdminPermissions;
  createdAt?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  updatedAt?: number;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  id: string;
  type: 'product' | 'page' | 'footer' | 'home' | 'category';
  action: 'create' | 'update' | 'delete';
  targetId: string; // Document ID
  newData: any;
  requestBy: {
    uid: string;
    email: string;
  };
  requestDate: number;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewDate?: number;
  reason?: string;
}

export interface HeroSlide {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl: string;
}

export interface HomePageData {
  hero: HeroSlide; // Keep single for backwards compatibility if needed, but we'll prefer slides
  heroSlides: HeroSlide[];
  features: Array<{
    title: string;
    desc: string;
    icon: string;
  }>;
  banners: Array<{
    title: string;
    subtitle: string;
    cta: string;
    url: string;
    image: string;
    color: string;
  }>;
}

export interface StoreSettings {
  storeName?: string;
  storeLogoUrl?: string;
  headerLinks?: { label: string; url: string }[];
  signupDiscountPercentage: number;
  signupDiscountEnabled: boolean;
  paymentMethods: {
    bkash: string;
    nagad: string;
    upay: string;
    bank: string;
  };
}