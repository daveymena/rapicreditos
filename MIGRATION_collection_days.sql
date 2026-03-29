-- Ejecutar en: Supabase Dashboard > SQL Editor
-- Agrega el campo "días para primer cobro" a la tabla loans

ALTER TABLE public.loans
ADD COLUMN IF NOT EXISTS collection_start_days INTEGER DEFAULT 1;

COMMENT ON COLUMN public.loans.collection_start_days IS 'Días desde el desembolso hasta la primera cuota de cobro';
