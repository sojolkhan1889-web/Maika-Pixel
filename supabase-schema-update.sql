-- =================================================================================
-- MAIKA PIXEL - SUPABASE DATABASE SCHEMA UPDATE
-- Run this script in your Supabase SQL Editor to create the tables for Orders, Customers, and Incomplete Orders.
-- =================================================================================

-- 1. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
  pixel_id TEXT,
  customer_name TEXT,
  phone TEXT,
  email TEXT,
  total TEXT,
  status TEXT DEFAULT 'Processing', -- Processing, Confirmed, Delivered, Cancelled
  fb_status TEXT DEFAULT 'Pending', -- Pending, Sent, Failed
  origin TEXT DEFAULT 'Website',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  total_orders INTEGER DEFAULT 0,
  success_orders INTEGER DEFAULT 0,
  cancelled_orders INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(seller_id, phone)
);

-- 3. Incomplete Orders Table
CREATE TABLE IF NOT EXISTS public.incomplete_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
  pixel_id TEXT,
  customer_name TEXT,
  phone TEXT,
  email TEXT,
  product_name TEXT,
  total TEXT,
  status TEXT DEFAULT 'Pending', -- Pending, Recovered, Lost
  last_contacted TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
