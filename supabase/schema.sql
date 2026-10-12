-- =========================================================================
-- UTP Codefest 2026: JKR Road Hazard Reporting System
-- Supabase PostgreSQL Schema (Abrar's Deliverable)
-- =========================================================================

-- Enable PostGIS for geospatial analysis if desired
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Reports Table (Civic Road Hazard Incidents)
CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY DEFAULT ('JKR-' || floor(random() * 9000 + 1000)::text),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    road_name TEXT NOT NULL,
    area TEXT NOT NULL DEFAULT 'Kuala Lumpur',
    severity_score INTEGER NOT NULL CHECK (severity_score BETWEEN 1 AND 5),
    issue_type TEXT NOT NULL DEFAULT 'Pothole',
    ai_justification TEXT,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Assessed', 'In Progress', 'Resolved', 'Closed')),
    telegram_chat_id BIGINT,
    reporter_name TEXT DEFAULT 'Citizen Reporter',
    history JSONB DEFAULT '["Submitted"]'::jsonb
);

-- 2. Staff Accounts Table (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS public.staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'JKR Officer', 'Viewer')) DEFAULT 'JKR Officer',
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Enable Realtime Sync for Instant Dashboard Updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;

-- 4. Sample Seed Staff Users
INSERT INTO public.staff_users (email, full_name, role, is_active)
VALUES
    ('ahmad.faizal@jkr.gov.my', 'Ahmad Faizal', 'Admin', true),
    ('nur.aisyah@jkr.gov.my', 'Nur Aisyah', 'JKR Officer', true),
    ('hakim@jkr.gov.my', 'Muhammad Hakim', 'JKR Officer', true),
    ('siti.farhana@jkr.gov.my', 'Siti Farhana', 'Viewer', true)
ON CONFLICT (email) DO NOTHING;

-- 5. Row Level Security (RLS) Policies
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read & write for prototype / demo convenience:
CREATE POLICY "Public read reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Public insert reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update reports" ON public.reports FOR UPDATE USING (true);

CREATE POLICY "Public read staff" ON public.staff_users FOR SELECT USING (true);

