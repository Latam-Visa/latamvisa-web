-- Crear tabla para los perfiles/leads
CREATE TABLE flight_strategy_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    edad INTEGER,
    nacionalidad TEXT,
    otra_ciudadania TEXT,
    pais_residencia TEXT,
    ciudad_origen TEXT,
    visas_vigentes JSONB, -- Array de strings con los multiselect
    destino TEXT,
    proposito TEXT,
    mes_viaje TEXT,
    duracion TEXT,
    prioridades TEXT,
    presupuesto TEXT,
    step_completed INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para las respuestas de IA y tracking del embudo
CREATE TABLE flight_strategy_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES flight_strategy_leads(id) ON DELETE CASCADE,
    ai_response JSONB NOT NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    consultation_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar RLS (Row Level Security) para que la API de backend pueda insertar
ALTER TABLE flight_strategy_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_strategy_responses ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad: Permitir inserción y lectura al rol de servicio, anon puede insertar
CREATE POLICY "Allow anon insert leads" ON flight_strategy_leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon update leads" ON flight_strategy_leads FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert responses" ON flight_strategy_responses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow service role full access leads" ON flight_strategy_leads FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service role full access responses" ON flight_strategy_responses FOR ALL TO service_role USING (true);

-- Crear tabla para las aplicaciones a Visa USA
CREATE TABLE visa_applications_usa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Optional si se integra autenticación después
    status TEXT DEFAULT 'pending',
    data JSONB NOT NULL,
    pdf_url TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE visa_applications_usa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role full access visa_applications_usa" ON visa_applications_usa FOR ALL TO service_role USING (true);

-- Crear tabla para el board de Ideas & Tareas del panel de admin
CREATE TABLE IF NOT EXISTS public.admin_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'General',
  status text NOT NULL DEFAULT 'idea',        -- idea | por_hacer | en_progreso | hecho
  priority text NOT NULL DEFAULT 'media',     -- alta | media | baja
  position int NOT NULL DEFAULT 0,            -- orden dentro de cada columna
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;

-- Sin políticas: no hay lectura/escritura pública. Todo el acceso es server-side
-- vía la service role key (el service role bypassea RLS por diseño).

INSERT INTO public.admin_tasks (title, category, status, priority) VALUES
  ('Crear chatbot con opción de hablar con un humano en WhatsApp', 'Chatbot', 'idea', 'alta'),
  ('Manejar accesos de correos y partes en la parte de admin', 'Admin', 'idea', 'alta'),
  ('Sueños con LATAM', 'Producto', 'idea', 'media'),
  ('Crear sección de Voluntariados', 'Producto', 'idea', 'media'),
  ('Crear sección de Labs', 'Producto', 'idea', 'media'),
  ('Crear sección de Finanzas', 'Producto', 'idea', 'media'),
  ('Crear App', 'Producto', 'idea', 'baja');
