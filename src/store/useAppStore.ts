import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  fbStatus: 'Pending' | 'Sent' | 'Failed';
  date: string;
  status: 'Processing' | 'Purchase' | 'Confirmed' | 'Delivered' | 'Cancelled' | 'Trash';
  total: string;
  origin: string;
}

export interface IncompleteOrder {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  productName: string;
  total: string;
  date: string;
  status: 'Pending' | 'Recovered' | 'Lost';
  lastContacted?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  company: string;
  avatar: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  marketingEmails: boolean;
  language: string;
  timezone: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  successOrders: number;
  cancelledOrders: number;
  isBlocked: boolean;
  blockedReason?: string;
  joinDate: string;
}

export interface Pixel {
  id: string;
  name: string;
  pixelId: string;
  accessToken: string;
  status: 'active' | 'inactive';
  events: {
    PageView: boolean;
    ViewContent: boolean;
    AddToCart: boolean;
    InitiateCheckout: boolean;
    Purchase: boolean;
    Lead: boolean;
  };
}

export interface EventLog {
  id: string;
  pixelId: string;
  eventName: string;
  eventData: any;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
}

export interface Settings {
  fraud: {
    check11Digits: boolean;
    blockPhone: boolean;
    blockEmail: boolean;
    blockIp: boolean;
    restrictMultiple: boolean;
    restrictHours: number;
    restrictLimit: number;
    errorPhone: string;
  };
  facebook: {
    enableCapi: boolean;
    sendImmediate: boolean;
    successPercent: number;
    enableOrderFlow: boolean;
    enableTestEvent: boolean;
    enableAddToCart: boolean;
    enableInitiateCheckout: boolean;
  };
}

interface AppState {
  orders: Order[];
  incompleteOrders: IncompleteOrder[];
  customers: Customer[];
  pixels: Pixel[];
  eventLogs: EventLog[];
  settings: Settings;
  subscriptionPlan: string;
  userProfile: UserProfile;
  userPreferences: UserPreferences;
  
  // Actions
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateIncompleteOrderStatus: (id: string, status: IncompleteOrder['status']) => void;
  deleteIncompleteOrder: (id: string) => void;
  updateLastContacted: (id: string) => void;
  toggleCustomerBlock: (phone: string) => void;
  addPixel: (pixel: Pixel) => void;
  deletePixel: (id: string) => void;
  togglePixelEvent: (pixelId: string, eventName: keyof Pixel['events']) => void;
  addEventLog: (log: Omit<EventLog, 'id' | 'timestamp'>) => void;
  clearEventLogs: () => void;
  updateSettings: (settings: Settings) => void;
  setSubscriptionPlan: (planId: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
}

const INITIAL_ORDERS: Order[] = [
  { id: '#ORD-7829', customerName: 'Rahim Uddin', phone: '01711223344', fbStatus: 'Sent', date: '2026-04-01 10:30 AM', status: 'Purchase', total: '৳ 2,450', origin: 'Facebook Ads' },
  { id: '#ORD-7828', customerName: 'Karim Hasan', phone: '01811223344', fbStatus: 'Pending', date: '2026-04-01 09:15 AM', status: 'Processing', total: '৳ 1,200', origin: 'Organic' },
  { id: '#ORD-7827', customerName: 'Jamil Ahmed', phone: '01911223344', fbStatus: 'Failed', date: '2026-04-01 08:45 AM', status: 'Cancelled', total: '৳ 3,500', origin: 'Google Ads' }
];

const INITIAL_INCOMPLETE_ORDERS: IncompleteOrder[] = [
  { id: '#INC-001', customerName: 'Sabbir Hossain', phone: '01711000001', email: 'sabbir@example.com', productName: 'Premium T-Shirt (Black, L)', total: '৳ 1,200', date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'Pending' },
  { id: '#INC-002', customerName: 'Nusrat Jahan', phone: '01811000002', email: 'nusrat@example.com', productName: 'Wireless Earbuds', total: '৳ 2,500', date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: 'Recovered', lastContacted: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: '#INC-003', customerName: 'Unknown User', phone: '01911000003', email: '', productName: 'Smart Watch', total: '৳ 3,500', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'Lost' },
  { id: '#INC-004', customerName: 'Faisal Ahmed', phone: '01611000004', email: 'faisal@example.com', productName: 'Running Shoes', total: '৳ 4,200', date: new Date(Date.now() - 1000 * 60 * 15).toISOString(), status: 'Pending' },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'CUST-001', name: 'Rahim Uddin', email: 'rahim@example.com', phone: '01711223344', totalOrders: 12, successOrders: 10, cancelledOrders: 2, isBlocked: false, joinDate: '2025-10-12' },
  { id: 'CUST-002', name: 'Karim Hasan', email: 'karim@example.com', phone: '01811223344', totalOrders: 5, successOrders: 1, cancelledOrders: 4, isBlocked: true, blockedReason: 'High cancellation rate', joinDate: '2026-01-05' },
  { id: 'CUST-003', name: 'Jamil Ahmed', email: 'jamil@example.com', phone: '01911223344', totalOrders: 24, successOrders: 24, cancelledOrders: 0, isBlocked: false, joinDate: '2025-08-22' }
];

const INITIAL_PIXELS: Pixel[] = [
  { id: '1', name: 'Main Website Pixel', pixelId: '102938475610293', accessToken: 'EAAB1234567890abcdef', status: 'active', events: { PageView: true, ViewContent: true, AddToCart: true, InitiateCheckout: true, Purchase: true, Lead: false } },
  { id: '2', name: 'Landing Page Pixel', pixelId: '987654321098765', accessToken: 'EAAB0987654321fedcba', status: 'inactive', events: { PageView: true, ViewContent: true, AddToCart: false, InitiateCheckout: false, Purchase: false, Lead: true } }
];

const INITIAL_EVENT_LOGS: EventLog[] = [
  { id: 'EVT-1001', pixelId: '102938475610293', eventName: 'Purchase', eventData: { customer_name: 'Rahim Uddin', email: 'rahim@example.com', phone: '01711223344', total_amount: '2450.00', currency: 'BDT', product_name: 'Premium T-Shirt', product_id: 'PROD_101', browser_id: 'fb.1.123456789', ip_address: '103.104.105.106', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), status: 'success' },
  { id: 'EVT-1002', pixelId: '102938475610293', eventName: 'AddToCart', eventData: { product_name: 'Premium T-Shirt', price: '2450.00', currency: 'BDT', product_id: 'PROD_101' }, timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), status: 'success' },
  { id: 'EVT-1003', pixelId: '102938475610293', eventName: 'PageView', eventData: { page_name: 'Home Page', page_id: 'home', browser_name: 'Chrome', ip_address: '103.104.105.106', user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'success' },
  { id: 'EVT-1004', pixelId: '987654321098765', eventName: 'Lead', eventData: { customer_name: 'Karim Hasan', email: 'karim@example.com', phone: '01811223344', browser_id: 'fb.1.987654321', ip_address: '114.115.116.117', user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' }, timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), status: 'failed' },
];

const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Admin User',
  email: 'admin@maikapixel.com',
  phone: '+8801711223344',
  company: 'Maika Pixel Inc.',
  avatar: '',
};

const INITIAL_USER_PREFERENCES: UserPreferences = {
  emailNotifications: true,
  marketingEmails: false,
  language: 'en',
  timezone: 'Asia/Dhaka',
};

const INITIAL_SETTINGS: Settings = {
  fraud: { check11Digits: true, blockPhone: true, blockEmail: true, blockIp: true, restrictMultiple: true, restrictHours: 24, restrictLimit: 2, errorPhone: '' },
  facebook: { enableCapi: true, sendImmediate: false, successPercent: 80, enableOrderFlow: true, enableTestEvent: false, enableAddToCart: false, enableInitiateCheckout: false }
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      orders: INITIAL_ORDERS,
      incompleteOrders: INITIAL_INCOMPLETE_ORDERS,
      customers: INITIAL_CUSTOMERS,
      pixels: INITIAL_PIXELS,
      eventLogs: INITIAL_EVENT_LOGS,
      settings: INITIAL_SETTINGS,
      subscriptionPlan: 'pro',
      userProfile: INITIAL_USER_PROFILE,
      userPreferences: INITIAL_USER_PREFERENCES,

      updateOrderStatus: (orderId, newStatus) => set((state) => ({
        orders: state.orders.map(o => {
          if (o.id === orderId) {
            const fbStatus = newStatus === 'Purchase' ? 'Sent' : o.fbStatus;
            return { ...o, status: newStatus, fbStatus };
          }
          return o;
        })
      })),

      updateIncompleteOrderStatus: (id, status) => set((state) => ({
        incompleteOrders: state.incompleteOrders.map(o => 
          o.id === id ? { ...o, status } : o
        )
      })),

      deleteIncompleteOrder: (id) => set((state) => ({
        incompleteOrders: state.incompleteOrders.filter(o => o.id !== id)
      })),

      updateLastContacted: (id) => set((state) => ({
        incompleteOrders: state.incompleteOrders.map(o => 
          o.id === id ? { ...o, lastContacted: new Date().toISOString() } : o
        )
      })),

      toggleCustomerBlock: (phone) => set((state) => ({
        customers: state.customers.map(c => c.phone === phone ? { ...c, isBlocked: !c.isBlocked } : c)
      })),

      addPixel: (pixel) => set((state) => ({
        pixels: [...state.pixels, pixel]
      })),

      deletePixel: (id) => set((state) => ({
        pixels: state.pixels.filter(p => p.id !== id)
      })),

      togglePixelEvent: (pixelId, eventName) => set((state) => ({
        pixels: state.pixels.map(p => p.id === pixelId ? {
          ...p, events: { ...p.events, [eventName]: !p.events[eventName] }
        } : p)
      })),

      addEventLog: (log) => set((state) => ({
        eventLogs: [{
          ...log,
          id: `EVT-${Date.now()}`,
          timestamp: new Date().toISOString()
        }, ...state.eventLogs]
      })),

      clearEventLogs: () => set({ eventLogs: [] }),

      updateSettings: (settings) => set({ settings }),
      
      setSubscriptionPlan: (planId) => set({ subscriptionPlan: planId }),

      updateUserProfile: (profile) => set((state) => ({
        userProfile: { ...state.userProfile, ...profile }
      })),

      updateUserPreferences: (prefs) => set((state) => ({
        userPreferences: { ...state.userPreferences, ...prefs }
      })),
    }),
    {
      name: 'maika-pixel-storage',
    }
  )
);
