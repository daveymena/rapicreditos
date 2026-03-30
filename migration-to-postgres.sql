-- =====================================================
-- RapiCréditos - Schema para PostgreSQL Propio (EasyPanel)
-- Sin dependencia de Supabase Auth
-- Ejecutar en: postgres://postgres:6715320D@164.68.122.5:5436/posgres-db
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA USERS (reemplaza auth.users de Supabase)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  business_name TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  email_confirmed BOOLEAN DEFAULT FALSE,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  subscription_status TEXT DEFAULT 'free',
  whatsapp_connected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- =====================================================
-- TABLA CLIENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  document_number TEXT,
  document_type TEXT DEFAULT 'CC',
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  occupation TEXT,
  monthly_income DECIMAL(15,2),
  reference_name TEXT,
  reference_phone TEXT,
  reference_relationship TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

-- =====================================================
-- TABLA LOANS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  loan_number TEXT NOT NULL DEFAULT '',
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  interest_type TEXT DEFAULT 'simple' CHECK (interest_type IN ('simple', 'compound')),
  total_interest DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  installments INTEGER NOT NULL,
  installment_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  paid_amount DECIMAL(15,2) DEFAULT 0,
  paid_installments INTEGER DEFAULT 0,
  remaining_amount DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'defaulted', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loans_user_id ON public.loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_client_id ON public.loans(client_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);

-- =====================================================
-- TABLA PAYMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  payment_number INTEGER NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  principal_portion DECIMAL(15,2) DEFAULT 0,
  interest_portion DECIMAL(15,2) DEFAULT 0,
  late_fee DECIMAL(15,2) DEFAULT 0,
  payment_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'transfer', 'mobile_payment', 'check', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'overdue')),
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON public.payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- =====================================================
-- TABLA REMINDERS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'reminder' CHECK (message_type IN ('reminder', 'collection', 'thank_you', 'overdue')),
  channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'sms', 'email')),
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_loan_id ON public.reminders(loan_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);

-- =====================================================
-- TABLA WHATSAPP_SESSIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  phone_number TEXT,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'qr_ready', 'connected', 'error')),
  qr_code TEXT,
  last_connected TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user_id ON public.whatsapp_sessions(user_id);

-- =====================================================
-- TABLA MESSAGES (conversaciones WhatsApp)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID,
  session_id UUID REFERENCES public.whatsapp_sessions(id) ON DELETE SET NULL,
  sender_type TEXT DEFAULT 'client' CHECK (sender_type IN ('client', 'agent', 'system')),
  content TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- updated_at automático
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_whatsapp_sessions_updated_at BEFORE UPDATE ON public.whatsapp_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Número de préstamo automático
CREATE OR REPLACE FUNCTION public.generate_loan_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.loan_number IS NULL OR NEW.loan_number = '' THEN
    NEW.loan_number := 'RC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_loan_number ON public.loans;
CREATE TRIGGER set_loan_number BEFORE INSERT ON public.loans FOR EACH ROW EXECUTE FUNCTION public.generate_loan_number();
