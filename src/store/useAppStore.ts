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
  
  // API Loading States
  isLoadingPixels: boolean;
  isLoadingEvents: boolean;
  isLoadingOrders: boolean;
  isLoadingCustomers: boolean;
  isLoadingIncompleteOrders: boolean;
  isLoadingSettings: boolean;
  isLoadingSubscription: boolean;

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

  // Async API Actions
  fetchPixels: () => Promise<void>;
  createPixelAsync: (pixelData: any) => Promise<void>;
  deletePixelAsync: (id: string) => Promise<void>;
  fetchEventLogs: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  updateOrderStatusAsync: (id: string, status: Order['status']) => Promise<void>;
  fetchCustomers: () => Promise<void>;
  toggleCustomerBlockAsync: (id: string, currentStatus: boolean) => Promise<void>;
  fetchIncompleteOrders: () => Promise<void>;
  updateIncompleteOrderStatusAsync: (id: string, status: IncompleteOrder['status']) => Promise<void>;
  updateLastContactedAsync: (id: string) => Promise<void>;
  deleteIncompleteOrderAsync: (id: string) => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSettingsAsync: (settings: Settings) => Promise<void>;
  fetchSubscription: () => Promise<void>;
  upgradeSubscriptionAsync: (planId: string) => Promise<void>;
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
    (set, get) => ({
      orders: INITIAL_ORDERS,
      incompleteOrders: INITIAL_INCOMPLETE_ORDERS,
      customers: INITIAL_CUSTOMERS,
      pixels: INITIAL_PIXELS,
      eventLogs: INITIAL_EVENT_LOGS,
      settings: INITIAL_SETTINGS,
      subscriptionPlan: 'pro',
      userProfile: INITIAL_USER_PROFILE,
      userPreferences: INITIAL_USER_PREFERENCES,
      isLoadingPixels: false,
      isLoadingEvents: false,
      isLoadingOrders: false,
      isLoadingCustomers: false,
      isLoadingIncompleteOrders: false,
      isLoadingSettings: false,
      isLoadingSubscription: false,

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

      // Async API Actions
      fetchPixels: async () => {
        set({ isLoadingPixels: true });
        try {
          const res = await fetch('/api/pixels');
          const data = await res.json();
          if (data.success) {
            // Map backend data to frontend format
            const mappedPixels = data.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              pixelId: p.pixel_id,
              accessToken: p.access_token,
              status: p.status,
              events: p.events || { PageView: true, ViewContent: true, AddToCart: false, InitiateCheckout: false, Purchase: false, Lead: false }
            }));
            set({ pixels: mappedPixels });
          }
        } catch (error) {
          console.error('Failed to fetch pixels:', error);
        } finally {
          set({ isLoadingPixels: false });
        }
      },

      createPixelAsync: async (pixelData) => {
        try {
          const res = await fetch('/api/pixels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pixelData)
          });
          const data = await res.json();
          if (data.success) {
            // Re-fetch pixels to ensure sync
            await get().fetchPixels();
          }
        } catch (error) {
          console.error('Failed to create pixel:', error);
        }
      },

      deletePixelAsync: async (id) => {
        try {
          const res = await fetch(`/api/pixels/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            set((state) => ({ pixels: state.pixels.filter(p => p.id !== id) }));
          }
        } catch (error) {
          console.error('Failed to delete pixel:', error);
        }
      },

      fetchEventLogs: async () => {
        set({ isLoadingEvents: true });
        try {
          const res = await fetch('/api/events');
          const data = await res.json();
          if (data.success) {
            const mappedEvents = data.data.map((e: any) => ({
              id: e.id,
              pixelId: e.pixel_id,
              eventName: e.event_name,
              eventData: e.event_data,
              timestamp: e.created_at,
              status: e.status
            }));
            set({ eventLogs: mappedEvents });
          }
        } catch (error) {
          console.error('Failed to fetch event logs:', error);
        } finally {
          set({ isLoadingEvents: false });
        }
      },

      fetchOrders: async () => {
        set({ isLoadingOrders: true });
        try {
          const res = await fetch('/api/orders');
          const data = await res.json();
          if (data.success) {
            const mappedOrders = data.data.map((o: any) => ({
              id: o.id,
              customerName: o.customer_name,
              phone: o.phone,
              fbStatus: o.fb_status,
              date: o.created_at,
              status: o.status,
              total: o.total,
              origin: o.origin
            }));
            set({ orders: mappedOrders });
          }
        } catch (error) {
          console.error('Failed to fetch orders:', error);
        } finally {
          set({ isLoadingOrders: false });
        }
      },

      updateOrderStatusAsync: async (id, status) => {
        try {
          const res = await fetch(`/api/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          const data = await res.json();
          if (data.success) {
            set((state) => ({
              orders: state.orders.map(o => o.id === id ? { ...o, status: status as Order['status'] } : o)
            }));
          }
        } catch (error) {
          console.error('Failed to update order status:', error);
        }
      },

      fetchCustomers: async () => {
        set({ isLoadingCustomers: true });
        try {
          const res = await fetch('/api/customers');
          const data = await res.json();
          if (data.success) {
            const mappedCustomers = data.data.map((c: any) => ({
              id: c.id,
              name: c.name,
              email: c.email,
              phone: c.phone,
              totalOrders: c.total_orders,
              successOrders: c.success_orders,
              cancelledOrders: c.cancelled_orders,
              isBlocked: c.is_blocked,
              blockedReason: c.blocked_reason,
              joinDate: c.created_at
            }));
            set({ customers: mappedCustomers });
          }
        } catch (error) {
          console.error('Failed to fetch customers:', error);
        } finally {
          set({ isLoadingCustomers: false });
        }
      },

      toggleCustomerBlockAsync: async (id, currentStatus) => {
        try {
          const res = await fetch(`/api/customers/${id}/block`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isBlocked: !currentStatus })
          });
          const data = await res.json();
          if (data.success) {
            set((state) => ({
              customers: state.customers.map(c => c.id === id ? { ...c, isBlocked: !currentStatus } : c)
            }));
          }
        } catch (error) {
          console.error('Failed to update customer status:', error);
        }
      },

      fetchIncompleteOrders: async () => {
        set({ isLoadingIncompleteOrders: true });
        try {
          const res = await fetch('/api/incomplete-orders');
          const data = await res.json();
          if (data.success) {
            const mappedIncomplete = data.data.map((o: any) => ({
              id: o.id,
              customerName: o.customer_name,
              phone: o.phone,
              email: o.email,
              productName: o.product_name,
              total: o.total,
              date: o.created_at,
              status: o.status,
              lastContacted: o.last_contacted
            }));
            set({ incompleteOrders: mappedIncomplete });
          }
        } catch (error) {
          console.error('Failed to fetch incomplete orders:', error);
        } finally {
          set({ isLoadingIncompleteOrders: false });
        }
      },

      updateIncompleteOrderStatusAsync: async (id, status) => {
        try {
          const res = await fetch(`/api/incomplete-orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          const data = await res.json();
          if (data.success) {
            set((state) => ({
              incompleteOrders: state.incompleteOrders.map(o => o.id === id ? { ...o, status: status as IncompleteOrder['status'] } : o)
            }));
          }
        } catch (error) {
          console.error('Failed to update incomplete order status:', error);
        }
      },

      updateLastContactedAsync: async (id) => {
        try {
          const res = await fetch(`/api/incomplete-orders/${id}/contacted`, { method: 'PUT' });
          const data = await res.json();
          if (data.success) {
            set((state) => ({
              incompleteOrders: state.incompleteOrders.map(o => 
                o.id === id ? { ...o, lastContacted: data.data.last_contacted } : o
              )
            }));
          }
        } catch (error) {
          console.error('Failed to update last contacted time:', error);
        }
      },

      deleteIncompleteOrderAsync: async (id) => {
        try {
          const res = await fetch(`/api/incomplete-orders/${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            set((state) => ({
              incompleteOrders: state.incompleteOrders.filter(o => o.id !== id)
            }));
          }
        } catch (error) {
          console.error('Failed to delete incomplete order:', error);
        }
      },

      fetchSettings: async () => {
        set({ isLoadingSettings: true });
        try {
          const res = await fetch('/api/settings');
          const data = await res.json();
          if (data.success && data.data) {
            set({ settings: data.data });
          }
        } catch (error) {
          console.error('Failed to fetch settings:', error);
        } finally {
          set({ isLoadingSettings: false });
        }
      },

      updateSettingsAsync: async (newSettings) => {
        try {
          const res = await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSettings)
          });
          const data = await res.json();
          if (data.success) {
            set({ settings: data.data });
          }
        } catch (error) {
          console.error('Failed to update settings:', error);
        }
      },

      fetchSubscription: async () => {
        set({ isLoadingSubscription: true });
        try {
          const res = await fetch('/api/subscriptions');
          const data = await res.json();
          if (data.success && data.data) {
            set({ subscriptionPlan: data.data.plan });
          }
        } catch (error) {
          console.error('Failed to fetch subscription:', error);
        } finally {
          set({ isLoadingSubscription: false });
        }
      },

      upgradeSubscriptionAsync: async (planId) => {
        try {
          const res = await fetch('/api/subscriptions/upgrade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId })
          });
          const data = await res.json();
          if (data.success) {
            set({ subscriptionPlan: data.data.plan });
          }
        } catch (error) {
          console.error('Failed to upgrade subscription:', error);
        }
      }
    }),
    {
      name: 'maika-pixel-storage',
    }
  )
);
