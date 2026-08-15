-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Perfiles (suscriptores)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  notify boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sorteos
CREATE TABLE public.raffles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  details text,
  image_url text,
  ticket_price numeric(10,2) NOT NULL DEFAULT 5,
  status text NOT NULL DEFAULT 'activo',
  draw_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.raffles TO anon, authenticated;
GRANT ALL ON public.raffles TO service_role;
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "raffles public read" ON public.raffles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "raffles admin write" ON public.raffles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Premios
CREATE TABLE public.prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 1,
  name text NOT NULL,
  image_url text,
  winner_ticket_number int,
  winner_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.prizes TO anon, authenticated;
GRANT ALL ON public.prizes TO service_role;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prizes public read" ON public.prizes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "prizes admin write" ON public.prizes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Inscripciones
CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  dni text NOT NULL,
  full_name text NOT NULL,
  birth_date date,
  phone text,
  email text,
  quantity int NOT NULL DEFAULT 1,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  receipt_url text,
  status text NOT NULL DEFAULT 'pendiente',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
CREATE INDEX registrations_dni_idx ON public.registrations (dni);
GRANT SELECT, UPDATE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "registrations admin all" ON public.registrations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Tickets
CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  number int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (raffle_id, number)
);
GRANT SELECT ON public.tickets TO anon, authenticated;
GRANT ALL ON public.tickets TO service_role;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets public read" ON public.tickets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tickets admin write" ON public.tickets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Productos
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2),
  old_price numeric(10,2),
  image_url text,
  tag text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Datos de ejemplo
INSERT INTO public.raffles (title, description, details, ticket_price, status, draw_date) VALUES
('Gran Sorteo Laptop Gamer ASUS ROG', 'Participa por una laptop gamer de última generación y más premios tecnológicos.', 'Sorteo con 5 premios. Cada ticket cuesta S/ 5. La inscripción se valida tras la aprobación del comprobante de Yape. El sorteo se realizará en vivo por nuestras redes.', 5, 'activo', now() + interval '20 days');

INSERT INTO public.prizes (raffle_id, position, name) SELECT id, 1, 'Laptop Gamer ASUS ROG RTX 4060' FROM public.raffles;
INSERT INTO public.prizes (raffle_id, position, name) SELECT id, 2, 'Monitor Gamer 27" 165Hz' FROM public.raffles;
INSERT INTO public.prizes (raffle_id, position, name) SELECT id, 3, 'Teclado mecánico RGB + Mouse' FROM public.raffles;
INSERT INTO public.prizes (raffle_id, position, name) SELECT id, 4, 'Audífonos Gamer 7.1' FROM public.raffles;
INSERT INTO public.prizes (raffle_id, position, name) SELECT id, 5, 'Vale de compra S/ 300' FROM public.raffles;

INSERT INTO public.products (name, description, price, old_price, tag) VALUES
('Laptop HP Victus i5 RTX 3050', '16GB RAM · 512GB SSD · 144Hz', 3299.00, 3799.00, 'Oferta'),
('PC Gamer Ryzen 5 5600', 'RTX 4060 · 16GB · 1TB NVMe', 3899.00, 4299.00, 'Top ventas'),
('Monitor Samsung 24" 165Hz', 'Curvo · 1ms · FreeSync', 649.00, 799.00, 'Nuevo'),
('Impresora Epson L3250', 'Multifuncional · WiFi · Ecotank', 749.00, 849.00, 'Oferta'),
('SSD NVMe 1TB Kingston', 'Lectura 3500MB/s', 219.00, 279.00, 'Liquidación');
