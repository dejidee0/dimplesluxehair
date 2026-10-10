/*
  # Seed initial data for Dimplesluxe

  1. Categories and subcategories
  2. Sample products with images
  3. Currency rates
  4. Admin user setup
*/

-- Insert categories
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
  ('Human Hair', 'human-hair', 'Premium 100% virgin human hair bundles', NULL, 1),
  ('Body Waves Bundles', 'body-waves', 'Soft and bouncy body wave hair bundles', NULL, 2),
  ('Curly Bundles', 'curly-bundles', 'Natural curly hair bundles with defined curls', NULL, 3),
  ('Kinky Hair', 'kinky-hair', 'Textured kinky hair for natural looks', NULL, 4),
  ('Synthetics', 'synthetics', 'High-quality synthetic hair extensions', NULL, 5);

-- Get category IDs for subcategories
DO $$
DECLARE
  kinky_id uuid;
  synthetic_id uuid;
BEGIN
  SELECT id INTO kinky_id FROM categories WHERE slug = 'kinky-hair';
  SELECT id INTO synthetic_id FROM categories WHERE slug = 'synthetics';
  
  -- Insert subcategories
  INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
    ('Afro Kinky Twist', 'afro-kinky-twist', 'Natural afro kinky twist hair', kinky_id, 1),
    ('Afro Kinky Bulk', 'afro-kinky-bulk', 'Bulk afro kinky hair for braiding', kinky_id, 2),
    ('Prestreched Extensions', 'prestreched-extensions', 'Ready-to-use prestreched synthetic extensions', synthetic_id, 1),
    ('French Curls', 'french-curls', 'Elegant French curl synthetic hair', synthetic_id, 2);
END $$;

-- Insert sample products
DO $$
DECLARE
  human_hair_id uuid;
  body_wave_id uuid;
  curly_id uuid;
  kinky_twist_id uuid;
  prestretched_id uuid;
BEGIN
  SELECT id INTO human_hair_id FROM categories WHERE slug = 'human-hair';
  SELECT id INTO body_wave_id FROM categories WHERE slug = 'body-waves';
  SELECT id INTO curly_id FROM categories WHERE slug = 'curly-bundles';
  SELECT id INTO kinky_twist_id FROM categories WHERE slug = 'afro-kinky-twist';
  SELECT id INTO prestretched_id FROM categories WHERE slug = 'prestreched-extensions';
  
  -- Human Hair Products
  INSERT INTO products (name, slug, description, short_description, price, original_price, category_id, stock, lengths, colors, textures, is_featured, is_new, rating, review_count) VALUES
    ('Premium Brazilian Straight Bundle', 'brazilian-straight-bundle', 'Luxurious 100% virgin Brazilian human hair with natural luster and shine. Perfect for achieving sleek, straight styles that can be curled or waved as desired. This premium bundle offers exceptional quality and longevity.', 'Luxurious 100% virgin human hair with natural luster', 89.99, 119.99, human_hair_id, 25, ARRAY['14','16','18','20','22','24'], ARRAY['Natural Black','Dark Brown','Medium Brown','Light Brown'], ARRAY['Straight'], true, true, 4.8, 128),
    
    ('Peruvian Deep Wave Bundle', 'peruvian-deep-wave-bundle', 'Beautiful deep wave texture that provides volume and movement. Made from high-quality Peruvian virgin hair that holds curls well and maintains its pattern after washing.', 'Beautiful deep wave texture with volume and movement', 129.99, 159.99, human_hair_id, 18, ARRAY['16','18','20','22'], ARRAY['Natural Black','Dark Brown','Medium Brown'], ARRAY['Deep Wave'], true, false, 4.9, 89),
    
    ('Malaysian Loose Wave Bundle', 'malaysian-loose-wave-bundle', 'Soft, natural loose waves that blend seamlessly with your natural hair. This Malaysian virgin hair offers incredible softness and natural movement.', 'Soft, natural loose waves for seamless blending', 109.99, NULL, human_hair_id, 22, ARRAY['14','16','18','20','22'], ARRAY['Natural Black','Dark Brown','Medium Brown','Honey Blonde'], ARRAY['Loose Wave'], false, false, 4.7, 64);
  
  -- Body Wave Products  
  INSERT INTO products (name, slug, description, short_description, price, original_price, category_id, stock, lengths, colors, textures, is_featured, is_sale, rating, review_count) VALUES
    ('Body Wave Bundle Set (3 Bundles)', 'body-wave-bundle-set', 'Complete set of 3 body wave bundles for a full head installation. Soft, bouncy waves that maintain their pattern wash after wash. Perfect for achieving that effortless beachy wave look.', 'Complete 3-bundle set with soft, bouncy waves', 149.99, 199.99, body_wave_id, 15, ARRAY['16','18','20'], ARRAY['Natural Black','Dark Brown','Medium Brown','Light Brown','Honey Blonde'], ARRAY['Body Wave'], true, true, 4.8, 156),
    
    ('Premium Body Wave Single Bundle', 'premium-body-wave-single', 'Single premium body wave bundle perfect for adding volume or length. Beautiful wave pattern that can be styled in multiple ways.', 'Single premium bundle with beautiful wave pattern', 79.99, 99.99, body_wave_id, 30, ARRAY['14','16','18','20','22','24'], ARRAY['Natural Black','Dark Brown','Medium Brown','Light Brown'], ARRAY['Body Wave'], false, false, 4.6, 73);
  
  -- Curly Bundle Products
  INSERT INTO products (name, slug, description, short_description, price, original_price, category_id, stock, lengths, colors, textures, is_featured, rating, review_count) VALUES
    ('Kinky Curly Natural Bundle', 'kinky-curly-natural-bundle', 'Perfect for achieving that natural, voluminous curly look. These curls are defined, bouncy, and maintain their shape beautifully. Ideal for protective styling and natural hair matching.', 'Perfect natural, voluminous curly look', 119.99, NULL, curly_id, 8, ARRAY['14','16','18','20'], ARRAY['Natural Black','Dark Brown','Medium Brown'], ARRAY['Kinky Curly'], true, false, 4.9, 92),
    
    ('Spiral Curly Bundle', 'spiral-curly-bundle', 'Tight spiral curls that provide maximum volume and texture. These curls are perfect for creating bold, statement looks and blend beautifully with natural 4A-4C hair types.', 'Tight spiral curls for maximum volume', 139.99, 169.99, curly_id, 12, ARRAY['16','18','20','22'], ARRAY['Natural Black','Dark Brown'], ARRAY['Spiral Curly'], false, true, 4.7, 45);
  
  -- Kinky Hair Products
  INSERT INTO products (name, slug, description, short_description, price, original_price, category_id, subcategory_id, stock, lengths, colors, textures, rating, review_count) VALUES
    ('Afro Kinky Twist Hair', 'afro-kinky-twist', 'Perfect for protective styling, this kinky twist hair offers a natural texture that blends seamlessly with natural hair. Easy to install and maintain.', 'Perfect kinky twist for protective styling', 69.99, 89.99, (SELECT id FROM categories WHERE slug = 'kinky-hair'), kinky_twist_id, 35, ARRAY['18','20','22','24'], ARRAY['Natural Black','Dark Brown','Medium Brown'], ARRAY['Kinky Twist'], 4.5, 134),
    
    ('Premium Afro Kinky Bulk Hair', 'afro-kinky-bulk', 'High-quality bulk kinky hair perfect for braiding and loc extensions. Provides natural texture and volume for protective hairstyles.', 'High-quality bulk hair for braiding', 59.99, NULL, (SELECT id FROM categories WHERE slug = 'kinky-hair'), (SELECT id FROM categories WHERE slug = 'afro-kinky-bulk'), 28, ARRAY['20','22','24','26'], ARRAY['Natural Black','Dark Brown'], ARRAY['Kinky'], 4.4, 87);
  
  -- Synthetic Products
  INSERT INTO products (name, slug, description, short_description, price, original_price, category_id, subcategory_id, stock, lengths, colors, textures, is_featured, rating, review_count) VALUES
    ('Synthetic Prestreched Extension', 'synthetic-prestreched-extension', 'Easy to install, lightweight synthetic extensions with natural movement. Pre-stretched for convenience and time-saving installation. Heat-resistant up to 180°C.', 'Lightweight synthetic extensions with natural movement', 29.99, 39.99, (SELECT id FROM categories WHERE slug = 'synthetics'), prestretched_id, 50, ARRAY['20','24','28'], ARRAY['Natural Black','Dark Brown','Medium Brown','Light Brown','Blonde','Red','Purple','Blue'], ARRAY['Straight'], true, false, 4.2, 203),
    
    ('French Curl Synthetic Bundle', 'french-curl-synthetic', 'Elegant French curl pattern in high-quality synthetic fiber. Perfect for achieving sophisticated curly styles without the commitment of human hair.', 'Elegant French curl in high-quality synthetic', 39.99, 49.99, (SELECT id FROM categories WHERE slug = 'synthetics'), (SELECT id FROM categories WHERE slug = 'french-curls'), 42, ARRAY['18','20','22'], ARRAY['Natural Black','Dark Brown','Medium Brown','Light Brown','Honey Blonde'], ARRAY['French Curl'], false, false, 4.3, 78);
END $$;

-- Insert product images
DO $$
DECLARE
  product_record RECORD;
  image_urls text[];
BEGIN
  FOR product_record IN SELECT id, name FROM products LOOP
    CASE 
      WHEN product_record.name LIKE '%Brazilian%' OR product_record.name LIKE '%Straight%' THEN
        image_urls := ARRAY[
          'https://images.pexels.com/photos/3992656/pexels-photo-3992656.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3992658/pexels-photo-3992658.jpeg?auto=compress&cs=tinysrgb&w=800'
        ];
      WHEN product_record.name LIKE '%Body Wave%' OR product_record.name LIKE '%Wave%' THEN
        image_urls := ARRAY[
          'https://images.pexels.com/photos/3992660/pexels-photo-3992660.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3992652/pexels-photo-3992652.jpeg?auto=compress&cs=tinysrgb&w=800'
        ];
      WHEN product_record.name LIKE '%Curly%' OR product_record.name LIKE '%Spiral%' THEN
        image_urls := ARRAY[
          'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3993451/pexels-photo-3993451.jpeg?auto=compress&cs=tinysrgb&w=800'
        ];
      WHEN product_record.name LIKE '%Kinky%' OR product_record.name LIKE '%Afro%' THEN
        image_urls := ARRAY[
          'https://images.pexels.com/photos/3992661/pexels-photo-3992661.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3992662/pexels-photo-3992662.jpeg?auto=compress&cs=tinysrgb&w=800'
        ];
      ELSE
        image_urls := ARRAY[
          'https://images.pexels.com/photos/3992652/pexels-photo-3992652.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/3992653/pexels-photo-3992653.jpeg?auto=compress&cs=tinysrgb&w=800'
        ];
    END CASE;
    
    -- Insert primary image
    INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
    VALUES (product_record.id, image_urls[1], product_record.name || ' - Primary Image', 0, true);
    
    -- Insert secondary image
    IF array_length(image_urls, 1) > 1 THEN
      INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
      VALUES (product_record.id, image_urls[2], product_record.name || ' - Secondary Image', 1, false);
    END IF;
  END LOOP;
END $$;

-- Insert initial currency rate
INSERT INTO currency_rates (base_currency, target_currency, rate, date) VALUES
  ('GBP', 'NGN', 1850.00, CURRENT_DATE);

-- Note: Admin users will be created via the application interface
-- This ensures proper authentication flow