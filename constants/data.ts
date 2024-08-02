import { NavItem } from '@/types';

export type User = {
  id: number;
  name: string;
  product: string;
  verified: boolean;
  status: string;
};

export type Customer = {
  _id: string;
  name: string;
  phone: number;
  gender: string;
};

export type Product = {
  _id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  skuCode: number;
};

export type Invoice = {
  _id: string;
  invoiceNumber: number;
  customer: Customer;
  addedproduct: [Product];
  totalAmount: number;
  status: string; // paid or pending
  issueDate: Date;
  createdAt: string;
};

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string; // Consider using a proper date type if possible
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  longitude?: number; // Optional field
  latitude?: number; // Optional field
  job: string;
  profile_picture?: string | null; // Profile picture can be a string (URL) or null (if no picture)
};

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard'
  },
  {
    title: 'Invoice',
    href: '/dashboard/invoice',
    icon: 'invoice',
    label: 'invoice'
  },
  {
    title: 'Products',
    href: '/dashboard/product',
    icon: 'post',
    label: 'invoice'
  },
  {
    title: 'Customers',
    href: '/dashboard/customer',
    icon: 'user',
    label: 'customer'
  },
];
