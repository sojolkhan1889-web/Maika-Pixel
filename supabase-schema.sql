-- =================================================================================
-- MAIKA PIXEL - SUPABASE DATABASE SCHEMA
-- Run this script in your Supabase SQL Editor to create the necessary tables.
-- =================================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Sellers Table (Extends Auth or acts as standalone user table)
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  company TEXT,
  role TEXT DEFAULT 'seller', -- 'admin' or 'seller'
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Pixels Table
CREATE TABLE IF NOT EXISTS public.pixels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pixel_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  events JSONB DEFAULT '{"PageView": true, "ViewContent": true, "AddToCart": true, "InitiateCheckout": true, "Purchase": true, "Lead": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Event Logs Table (High Volume Table)
CREATE TABLE IF NOT EXISTS public.event_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pixel_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB,
  status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE UNIQUE,
  fraud_settings JSONB DEFAULT '{"check11Digits": true, "blockPhone": true, "blockEmail": true, "blockIp": true, "restrictMultiple": true, "restrictHours": 24, "restrictLimit": 2, "errorPhone": ""}',
  facebook_settings JSONB DEFAULT '{"enableCapi": true, "sendImmediate": false, "successPercent": 80, "enableOrderFlow": true, "enableTestEvent": false, "enableAddToCart": false, "enableInitiateCheckout": false}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE UNIQUE,
  plan_name TEXT DEFAULT 'free',
  event_limit INTEGER DEFAULT 1000,
  events_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Row Level Security (RLS) is disabled by default for these tables.
-- Since the backend uses the Service Role Key, it bypasses RLS anyway.
-- If you plan to query directly from the frontend, you will need to enable RLS and write policies.
