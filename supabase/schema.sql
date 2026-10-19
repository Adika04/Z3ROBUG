-- ============================================================================
-- UTP Codefest 2026: JKR Road Hazard Reporting System
-- Supabase PostgreSQL schema
--
-- `reports` is the frontend/backend integration table. Its column names and
-- status values intentionally match the fields used by the React app and the
-- Telegram ingestion service.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Reference entities
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.road_users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    telegram_username TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'EN'
        CHECK (preferred_language IN ('BM', 'EN')),
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'JKR Officer'
        CHECK (role IN ('Admin', 'JKR Officer', 'Viewer')),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- ---------------------------------------------------------------------------
-- Frontend-compatible report table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY DEFAULT ('JKR-' || floor(random() * 9000 + 1000)::text),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    road_name TEXT NOT NULL,
    area TEXT NOT NULL DEFAULT 'Kuala Lumpur',

    -- Names and values consumed by the frontend/backend.
    severity_score INTEGER NOT NULL CHECK (severity_score BETWEEN 1 AND 5),
    issue_type TEXT NOT NULL DEFAULT 'Pothole',
    ai_justification TEXT,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'Submitted'
        CHECK (status IN ('Submitted', 'Assessed', 'In Progress', 'Resolved', 'Closed')),
    telegram_chat_id BIGINT,
    reporter_name TEXT DEFAULT 'Citizen Reporter',
    history JSONB NOT NULL DEFAULT '["Submitted"]'::jsonb,

    -- Relationships and additional attributes from the normalized design.
    user_id UUID REFERENCES public.road_users(user_id) ON DELETE SET NULL,
    assigned_staff_id UUID REFERENCES public.staff_users(id) ON DELETE SET NULL,
    location_source TEXT
        CHECK (location_source IS NULL OR location_source IN ('geotag', 'shared pin')),
    road_type TEXT
        CHECK (road_type IS NULL OR road_type IN ('highway', 'standard', 'suburban')),
    description TEXT,
    resolved_at TIMESTAMPTZ
);

-- These ALTER statements make the script safe to apply to an existing
-- frontend-compatible `reports` table that predates the normalized fields.
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ
    NOT NULL DEFAULT timezone('utc'::text, now());
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS user_id UUID
    REFERENCES public.road_users(user_id) ON DELETE SET NULL;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS assigned_staff_id UUID
    REFERENCES public.staff_users(id) ON DELETE SET NULL;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS location_source TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS road_type TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- Report detail entities
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.report_images (
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id TEXT NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    telegram_file_id TEXT,
    storage_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.ai_assessments (
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id TEXT NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    severity_score INTEGER NOT NULL CHECK (severity_score BETWEEN 1 AND 5),
    priority_level TEXT NOT NULL
        CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
    justification TEXT,
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.report_status_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id TEXT NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff_users(id) ON DELETE SET NULL,
    status TEXT NOT NULL
        CHECK (status IN ('Submitted', 'Assessed', 'In Progress', 'Resolved', 'Closed')),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    note TEXT
);

CREATE TABLE IF NOT EXISTS public.notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id TEXT REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.road_users(user_id) ON DELETE SET NULL,
    message_sent TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------------
-- Indexes and automatic timestamps
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports(status);
CREATE INDEX IF NOT EXISTS reports_area_idx ON public.reports(area);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS report_status_history_report_idx
    ON public.report_status_history(report_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS ai_assessments_report_idx
    ON public.ai_assessments(report_id, assessed_at DESC);

CREATE OR REPLACE FUNCTION public.set_report_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reports_set_updated_at ON public.reports;
CREATE TRIGGER reports_set_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.set_report_updated_at();

-- ---------------------------------------------------------------------------
-- Realtime, seed data, and access policies
-- ---------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'reports'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
    END IF;
END
$$;

INSERT INTO public.staff_users (email, full_name, role, is_active)
VALUES
    ('ahmad.faizal@jkr.gov.my', 'Ahmad Faizal', 'Admin', true),
    ('nur.aisyah@jkr.gov.my', 'Nur Aisyah', 'JKR Officer', true),
    ('hakim@jkr.gov.my', 'Muhammad Hakim', 'JKR Officer', true),
    ('siti.farhana@jkr.gov.my', 'Siti Farhana', 'Viewer', true)
ON CONFLICT (email) DO NOTHING;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.road_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read reports" ON public.reports;
DROP POLICY IF EXISTS "Public insert reports" ON public.reports;
DROP POLICY IF EXISTS "Public update reports" ON public.reports;
CREATE POLICY "Public read reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Public insert reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update reports" ON public.reports FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read staff" ON public.staff_users;
CREATE POLICY "Public read staff" ON public.staff_users FOR SELECT USING (true);
