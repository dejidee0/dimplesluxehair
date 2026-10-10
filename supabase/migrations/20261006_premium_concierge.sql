/*
  Premium rebuild additions
  - First-class purchasable variants
  - Curated complete looks
  - Private concierge consultation requests

  Run in staging first after reconciling the production schema against the
  existing migrations. This migration deliberately does not alter orders,
  payments, or existing product records.
*/

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku text UNIQUE,
  title text,
  length text,
  colour text,
  texture text,
  price numeric(10, 2),
  compare_at_price numeric(10, 2),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  weight text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(is_active);

CREATE TABLE IF NOT EXISTS complete_looks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  hero_image_url text,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS complete_look_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complete_look_id uuid NOT NULL REFERENCES complete_looks(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id uuid REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(complete_look_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_complete_look_items_look_id ON complete_look_items(complete_look_id);

CREATE TABLE IF NOT EXISTS hair_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_texture text,
  preferred_length text,
  preferred_colour text,
  desired_look text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consultation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  desired_look text,
  preferred_texture text,
  preferred_length text,
  budget text,
  contact_preference text,
  reference_image_urls text[] NOT NULL DEFAULT ARRAY[]::text[],
  notes text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'contacted', 'resolved', 'closed')),
  staff_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_user_id ON consultation_requests(user_id);

CREATE OR REPLACE FUNCTION set_premium_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
FOR EACH ROW EXECUTE FUNCTION set_premium_updated_at();

DROP TRIGGER IF EXISTS update_complete_looks_updated_at ON complete_looks;
CREATE TRIGGER update_complete_looks_updated_at BEFORE UPDATE ON complete_looks
FOR EACH ROW EXECUTE FUNCTION set_premium_updated_at();

DROP TRIGGER IF EXISTS update_hair_profiles_updated_at ON hair_profiles;
CREATE TRIGGER update_hair_profiles_updated_at BEFORE UPDATE ON hair_profiles
FOR EACH ROW EXECUTE FUNCTION set_premium_updated_at();

DROP TRIGGER IF EXISTS update_consultation_requests_updated_at ON consultation_requests;
CREATE TRIGGER update_consultation_requests_updated_at BEFORE UPDATE ON consultation_requests
FOR EACH ROW EXECUTE FUNCTION set_premium_updated_at();

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE complete_looks ENABLE ROW LEVEL SECURITY;
ALTER TABLE complete_look_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hair_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active variants are visible to everyone"
  ON product_variants FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Active complete looks are visible to everyone"
  ON complete_looks FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Complete look items are visible with active looks"
  ON complete_look_items FOR SELECT TO public USING (
    EXISTS (SELECT 1 FROM complete_looks WHERE complete_looks.id = complete_look_items.complete_look_id AND complete_looks.is_active = true)
  );

CREATE POLICY "Users can manage their own hair profile"
  ON hair_profiles FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their consultation requests"
  ON consultation_requests FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins manage premium rebuild data"
  ON product_variants FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true)) WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true));

CREATE POLICY "Admins manage complete looks"
  ON complete_looks FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true)) WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true));

CREATE POLICY "Admins manage complete look items"
  ON complete_look_items FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true)) WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true));

CREATE POLICY "Admins manage consultation requests"
  ON consultation_requests FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true)) WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true));
