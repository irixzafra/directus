-- ===========================================
-- Business OS - Schema Initialization
-- Basado en Highlander ATS Data Architecture
-- ===========================================

-- Schema para n8n (separado)
CREATE SCHEMA IF NOT EXISTS n8n;

-- Extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Para búsqueda fuzzy

-- ===========================================
-- 1. CORE: Tenants y Usuarios
-- ===========================================

-- Organizaciones/Empresas (Multi-tenancy)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perfiles de usuario
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user', -- admin, manager, user, recruiter
    department TEXT,
    job_title TEXT,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relación Usuario-Tenant (para multi-tenancy)
CREATE TABLE IF NOT EXISTS user_tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- owner, admin, member
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tenant_id)
);

-- ===========================================
-- 2. ATS: Applicant Tracking System
-- ===========================================

-- Etapas del pipeline de selección
CREATE TABLE IF NOT EXISTS pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    stage_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    stage_type TEXT DEFAULT 'custom', -- new, screening, interview, offer, hired, rejected
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ofertas de trabajo
CREATE TABLE IF NOT EXISTS job_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    department TEXT,
    location TEXT,
    location_type TEXT DEFAULT 'on-site', -- remote, hybrid, on-site
    employment_type TEXT DEFAULT 'full-time', -- full-time, part-time, contract, internship
    salary_min DECIMAL(12,2),
    salary_max DECIMAL(12,2),
    salary_currency TEXT DEFAULT 'EUR',
    experience_level TEXT, -- junior, mid, senior, lead
    status TEXT DEFAULT 'draft', -- draft, published, paused, closed
    published_at TIMESTAMPTZ,
    closes_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidatos (pool de talento)
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    phone TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    resume_url TEXT,
    avatar_url TEXT,
    current_company TEXT,
    current_title TEXT,
    location TEXT,
    years_experience INTEGER,
    skills TEXT[], -- Array de skills
    languages TEXT[],
    education JSONB DEFAULT '[]',
    work_history JSONB DEFAULT '[]',
    source TEXT, -- linkedin, referral, website, job_board
    source_details TEXT,
    tags TEXT[],
    rating INTEGER, -- 1-5 stars
    ai_score INTEGER, -- 0-100 AI matching score
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidaturas (aplicaciones a ofertas)
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    job_offer_id UUID REFERENCES job_offers(id) ON DELETE CASCADE,
    pipeline_stage_id UUID REFERENCES pipeline_stages(id),
    status TEXT DEFAULT 'new', -- new, in_review, interviewing, offer, hired, rejected, withdrawn
    assigned_to UUID REFERENCES profiles(id),
    cover_letter TEXT,
    match_score INTEGER, -- AI calculated
    rating INTEGER,
    rejection_reason TEXT,
    hired_at TIMESTAMPTZ,
    custom_fields JSONB DEFAULT '{}',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id, job_offer_id)
);

-- Entrevistas
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES profiles(id),
    interview_type TEXT DEFAULT 'video', -- phone, video, in-person, technical, panel
    scheduled_at TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 60,
    location TEXT,
    meeting_url TEXT,
    status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
    feedback TEXT,
    rating INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 3. CRM: Customer Relationship Management
-- ===========================================

-- Empresas/Cuentas
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT,
    industry TEXT,
    company_size TEXT, -- 1-10, 11-50, 51-200, 201-500, 500+
    logo_url TEXT,
    website TEXT,
    description TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    phone TEXT,
    email TEXT,
    linkedin_url TEXT,
    annual_revenue DECIMAL(15,2),
    employee_count INTEGER,
    founded_year INTEGER,
    status TEXT DEFAULT 'prospect', -- prospect, lead, customer, churned
    owner_id UUID REFERENCES profiles(id),
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contactos
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    phone TEXT,
    mobile TEXT,
    job_title TEXT,
    department TEXT,
    linkedin_url TEXT,
    is_primary BOOLEAN DEFAULT false,
    is_decision_maker BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active', -- active, inactive, unsubscribed
    owner_id UUID REFERENCES profiles(id),
    source TEXT,
    tags TEXT[],
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Oportunidades de venta
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    value DECIMAL(15,2),
    currency TEXT DEFAULT 'EUR',
    stage TEXT DEFAULT 'qualification', -- qualification, proposal, negotiation, closed_won, closed_lost
    probability INTEGER DEFAULT 20, -- 0-100
    expected_close_date DATE,
    actual_close_date DATE,
    owner_id UUID REFERENCES profiles(id),
    source TEXT,
    loss_reason TEXT,
    next_step TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actividades (llamadas, emails, reuniones)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    -- Polymorphic relation
    entity_type TEXT NOT NULL, -- company, contact, opportunity, candidate, application
    entity_id UUID NOT NULL,
    activity_type TEXT NOT NULL, -- call, email, meeting, note, task
    subject TEXT,
    description TEXT,
    outcome TEXT,
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    owner_id UUID REFERENCES profiles(id),
    participants JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 4. TASKS: Gestión de Tareas
-- ===========================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    -- Polymorphic relation
    entity_type TEXT, -- company, contact, opportunity, candidate, application
    entity_id UUID,
    assigned_to UUID REFERENCES profiles(id),
    created_by UUID REFERENCES profiles(id),
    tags TEXT[],
    checklist JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 5. COMMUNICATION: Mensajería
-- ===========================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    subject TEXT,
    conversation_type TEXT DEFAULT 'direct', -- direct, group, channel
    -- Polymorphic relation
    entity_type TEXT, -- candidate, company, contact
    entity_id UUID,
    last_message_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- text, file, system
    attachments JSONB DEFAULT '[]',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 6. WORKFLOWS: Automatizaciones
-- ===========================================

CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL, -- record_created, record_updated, scheduled, webhook
    trigger_config JSONB DEFAULT '{}',
    entity_type TEXT, -- candidates, applications, opportunities, etc.
    conditions JSONB DEFAULT '[]',
    actions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMPTZ,
    run_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'running', -- running, completed, failed
    trigger_data JSONB DEFAULT '{}',
    result JSONB DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ===========================================
-- 7. INTEGRATIONS: Conexiones Externas
-- ===========================================

CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    provider TEXT NOT NULL, -- slack, notion, gmail, calendar, linkedin
    status TEXT DEFAULT 'pending', -- pending, connected, error, disabled
    config JSONB DEFAULT '{}', -- Encrypted config
    credentials JSONB DEFAULT '{}', -- Encrypted credentials
    last_sync_at TIMESTAMPTZ,
    sync_error TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 8. AI: Prompts y Logs
-- ===========================================

CREATE TABLE IF NOT EXISTS ai_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT,
    user_prompt_template TEXT,
    model TEXT DEFAULT 'gpt-4',
    temperature DECIMAL(2,1) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    category TEXT, -- scoring, generation, analysis, extraction
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES ai_prompts(id),
    entity_type TEXT,
    entity_id UUID,
    input_tokens INTEGER,
    output_tokens INTEGER,
    cost_usd DECIMAL(10,6),
    response_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 9. AUDIT: Logs de Actividad
-- ===========================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL, -- create, update, delete, view, login, logout
    entity_type TEXT NOT NULL,
    entity_id UUID,
    entity_name TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 10. SETTINGS: Configuraciones del Sistema
-- ===========================================

CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- general, email, notifications, branding
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, category, key)
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT false,
    tenant_ids UUID[], -- NULL = global, otherwise specific tenants
    category TEXT,
    stage TEXT DEFAULT 'stable', -- alpha, beta, stable
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================

-- Tenant isolation indexes (critical for performance)
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_tenant ON job_offers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_candidates_tenant ON candidates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_applications_tenant ON applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_tenant ON companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_tenant ON opportunities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activities_tenant ON activities(tenant_id);

-- Status indexes (frequent filters)
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Search indexes
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_skills ON candidates USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies USING GIN(name gin_trgm_ops);

-- Activity/Timeline indexes
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- ===========================================
-- TRIGGERS: Auto-update timestamps
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trigger_update_%I ON %I;
            CREATE TRIGGER trigger_update_%I
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
        ', t, t, t, t);
    END LOOP;
END;
$$;

-- ===========================================
-- SEED DATA: Datos iniciales
-- ===========================================

-- Tenant de demo
INSERT INTO tenants (id, name, slug, settings) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Demo Company', 'demo', '{"plan": "pro", "max_users": 50}')
ON CONFLICT (slug) DO NOTHING;

-- Admin user
INSERT INTO profiles (id, tenant_id, email, first_name, last_name, role) VALUES
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'admin@business-os.local', 'Admin', 'User', 'admin')
ON CONFLICT DO NOTHING;

-- Default pipeline stages
INSERT INTO pipeline_stages (tenant_id, name, slug, color, stage_order, is_default, stage_type) VALUES
    ('00000000-0000-0000-0000-000000000001', 'New', 'new', '#6b7280', 0, true, 'new'),
    ('00000000-0000-0000-0000-000000000001', 'Screening', 'screening', '#3b82f6', 1, false, 'screening'),
    ('00000000-0000-0000-0000-000000000001', 'Interview', 'interview', '#8b5cf6', 2, false, 'interview'),
    ('00000000-0000-0000-0000-000000000001', 'Technical', 'technical', '#ec4899', 3, false, 'interview'),
    ('00000000-0000-0000-0000-000000000001', 'Offer', 'offer', '#f59e0b', 4, false, 'offer'),
    ('00000000-0000-0000-0000-000000000001', 'Hired', 'hired', '#22c55e', 5, false, 'hired'),
    ('00000000-0000-0000-0000-000000000001', 'Rejected', 'rejected', '#ef4444', 6, false, 'rejected')
ON CONFLICT DO NOTHING;

-- Feature flags
INSERT INTO feature_flags (key, description, is_enabled, category, stage) VALUES
    ('ai_scoring', 'Enable AI candidate scoring', true, 'ai', 'stable'),
    ('ai_content_generation', 'Enable AI content generation', true, 'ai', 'stable'),
    ('workflow_automation', 'Enable workflow automation', true, 'automation', 'stable'),
    ('integrations_slack', 'Enable Slack integration', true, 'integrations', 'stable'),
    ('integrations_notion', 'Enable Notion integration', true, 'integrations', 'beta'),
    ('social_engine', 'Enable social features', false, 'social', 'alpha')
ON CONFLICT DO NOTHING;

-- Default AI prompts
INSERT INTO ai_prompts (tenant_id, name, slug, description, system_prompt, user_prompt_template, category) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Candidate Match Score', 'candidate-match-score',
     'Calculate match score between candidate and job offer',
     'You are an expert recruiter. Analyze the candidate profile against the job requirements and provide a match score from 0-100 with detailed reasoning.',
     'Job Requirements:\n{{job_requirements}}\n\nCandidate Profile:\n{{candidate_profile}}\n\nProvide a JSON response with: { "score": number, "strengths": [], "gaps": [], "summary": "" }',
     'scoring'),
    ('00000000-0000-0000-0000-000000000001', 'Job Description Generator', 'job-description-generator',
     'Generate professional job descriptions',
     'You are a professional HR copywriter. Create compelling job descriptions that attract top talent.',
     'Create a job description for:\nTitle: {{title}}\nDepartment: {{department}}\nKey Requirements: {{requirements}}\n\nMake it professional, inclusive, and engaging.',
     'generation')
ON CONFLICT DO NOTHING;

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
DO $$
BEGIN
    RAISE NOTICE '✅ Business OS database initialized successfully!';
    RAISE NOTICE '📊 Tables created: tenants, profiles, job_offers, candidates, applications, companies, contacts, opportunities, tasks, workflows, etc.';
    RAISE NOTICE '🔐 Default tenant "demo" created with admin user';
    RAISE NOTICE '🚀 Ready to use with Directus!';
END $$;
