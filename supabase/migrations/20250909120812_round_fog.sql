/*
  # Create initial database schema for Dimplesluxe e-commerce

  1. New Tables
    - `categories` - Product categories (Human Hair, Body Waves, etc.)
    - `products` - All product information
    - `product_images` - Product image URLs
    - `orders` - Customer orders
    - `order_items` - Individual items within orders
    - `payments` - Payment transaction records
    - `wishlists` - Customer wishlists
    - `reviews` - Product reviews and ratings
    - `admin_users` - Admin user accounts
    - `currency_rates` - Exchange rate tracking

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for customer and admin access
    - Secure admin-only operations

  3. Features
    - Support for multiple currencies (GBP/NGN)
    - Product categorization with subcategories
    - Order tracking and status management
    - Payment method tracking
    - Review system with ratings
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id),
  image_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  price decimal(10,2) NOT NULL DEFAULT 0,
  original_price decimal(10,2),
  category_id uuid REFERENCES categories(id),
  subcategory_id uuid REFERENCES categories(id),
  stock integer DEFAULT 0,
  lengths text[], -- Array of available lengths
  colors text[], -- Array of available colors
  textures text[], -- Array of hair textures
  weight text,
  origin_country text DEFAULT 'Brazil',
  is_featured boolean DEFAULT false,
  is_new boolean DEFAULT false,
  is_sale boolean DEFAULT false,
  is_active boolean DEFAULT true,
  meta_title text,
  meta_description text,
  rating decimal(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  shipping_cost decimal(10,2) DEFAULT 0,
  tax decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'GBP' CHECK (currency IN ('GBP', 'NGN')),
  exchange_rate decimal(10,4) DEFAULT 1,
  
  -- Customer information
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  
  -- Billing address
  billing_address_line1 text NOT NULL,
  billing_address_line2 text,
  billing_city text NOT NULL,
  billing_state text,
  billing_postcode text NOT NULL,
  billing_country text NOT NULL,
  
  -- Shipping address
  shipping_address_line1 text NOT NULL,
  shipping_address_line2 text,
  shipping_city text NOT NULL,
  shipping_state text,
  shipping_postcode text NOT NULL,
  shipping_country text NOT NULL,
  
  -- Delivery
  shipping_method text DEFAULT 'standard',
  tracking_number text,
  notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  product_slug text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  selected_length text,
  selected_color text,
  created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  payment_intent_id text,
  provider text NOT NULL CHECK (provider IN ('stripe', 'paystack', 'apple_pay')),
  method text, -- card, bank_transfer, etc.
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled')),
  provider_fee decimal(10,2) DEFAULT 0,
  failure_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_verified boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) UNIQUE,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions text[] DEFAULT ARRAY['read', 'write'],
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Currency rates table
CREATE TABLE IF NOT EXISTS currency_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency text DEFAULT 'GBP',
  target_currency text DEFAULT 'NGN',
  rate decimal(10,4) NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(base_currency, target_currency, date)
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Categories: Public read, admin write
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Categories manageable by admin"
  ON categories FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- Products: Public read, admin write
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Products manageable by admin"
  ON products FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- Product images: Public read, admin write
CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Product images manageable by admin"
  ON product_images FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- Orders: Users see own orders, admins see all
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- Order items: Same as orders
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all order items"
  ON order_items FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- Payments: Users see own payments, admins see all
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all payments"
  ON payments FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- Wishlists: Users manage own wishlists
CREATE POLICY "Users can manage own wishlists"
  ON wishlists FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Reviews: Users manage own reviews, public can read approved
CREATE POLICY "Approved reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "Users can manage own reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- Admin users: Only super admins can manage
CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true
  ));

-- Currency rates: Public read, admin write
CREATE POLICY "Currency rates are viewable by everyone"
  ON currency_rates FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage currency rates"
  ON currency_rates FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  ));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);