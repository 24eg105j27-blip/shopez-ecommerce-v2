-- Add required categories: Watches, Phones, Shoes, Headphones
INSERT INTO categories (category_name, category_image) VALUES
  ('Watches', 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Phones', 'https://images.pexels.com/photos/6157078/pexels-photo-6157078.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Shoes', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400'),
  ('Headphones', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400')
ON CONFLICT DO NOTHING;

-- Add 10 products across those 4 categories
INSERT INTO products (product_name, description, category_id, brand, price, discount_price, stock, images, rating, featured)
SELECT 'Chronograph Smart Watch', 'Premium stainless steel smart watch with heart rate monitor, GPS tracking, and 5-day battery life. Water resistant to 50m.', c.id, 'TimeTech', 12999.00, 8499.00, 35, ARRAY['https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg?auto=compress&cs=tinysrgb&w=600'], 4.60, true
FROM categories c WHERE c.category_name = 'Watches'
UNION ALL
SELECT 'Classic Leather Watch', 'Elegant genuine leather strap watch with sapphire crystal glass and Japanese quartz movement.', c.id, 'TimeTech', 4999.00, 3299.00, 50, ARRAY['https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg?auto=compress&cs=tinysrgb&w=600'], 4.30, false
FROM categories c WHERE c.category_name = 'Watches'
UNION ALL
SELECT 'Sport Digital Watch', 'Rugged sports watch with stopwatch, alarm, backlight, and shock resistance. Perfect for outdoor adventures.', c.id, 'FitTime', 2499.00, 1699.00, 80, ARRAY['https://images.pexels.com/photos/937074/pexels-photo-937074.jpeg?auto=compress&cs=tinysrgb&w=600'], 4.10, true
FROM categories c WHERE c.category_name = 'Watches'
UNION ALL
SELECT 'Galaxy Ultra Phone', 'Flagship smartphone with 200MP camera, 6.8 inch AMOLED display, Snapdragon processor, and 5000mAh battery.', c.id, 'GalaxyPro', 79999.00, 64999.00, 20, ARRAY['https://images.pexels.com/photos/6157078/pexels-photo-6157078.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600'], 4.80, true
FROM categories c WHERE c.category_name = 'Phones'
UNION ALL
SELECT 'Budget 5G Phone', 'Affordable 5G smartphone with 6.5 inch display, 48MP triple camera, and 4500mAh battery.', c.id, 'NovaPhone', 14999.00, 11999.00, 45, ARRAY['https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600'], 4.00, false
FROM categories c WHERE c.category_name = 'Phones'
UNION ALL
SELECT 'Classic Phone Pro', 'Premium smartphone with 108MP camera, 120Hz display, and wireless charging. Ultra-slim design.', c.id, 'NovaPhone', 54999.00, 42999.00, 25, ARRAY['https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=600'], 4.50, true
FROM categories c WHERE c.category_name = 'Phones'
UNION ALL
SELECT 'Air Max Running Shoes', 'Lightweight mesh running shoes with air cushioning technology and breathable design. Ultra comfortable.', c.id, 'SpeedStep', 6999.00, 4499.00, 60, ARRAY['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/242206/pexels-photo-242206.jpeg?auto=compress&cs=tinysrgb&w=600'], 4.40, true
FROM categories c WHERE c.category_name = 'Shoes'
UNION ALL
SELECT 'Casual Leather Sneakers', 'Premium leather sneakers with cushioned insole and durable rubber outsole. Versatile everyday style.', c.id, 'StyleCraft', 3499.00, 2499.00, 90, ARRAY['https://images.pexels.com/photos/2934330/pexels-photo-2934330.jpeg?auto=compress&cs=tinysrgb&w=600'], 4.20, false
FROM categories c WHERE c.category_name = 'Shoes'
UNION ALL
SELECT 'Noise-Cancel Wireless Headphones', 'Premium over-ear headphones with active noise cancellation, 30-hour battery, and deep bass.', c.id, 'SoundMax', 9999.00, 6499.00, 40, ARRAY['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/3735632/pexels-photo-3735632.jpeg?auto=compress&cs=tinysrgb&w=600'], 4.70, true
FROM categories c WHERE c.category_name = 'Headphones'
UNION ALL
SELECT 'Studio Monitor Earbuds', 'Professional in-ear monitors with balanced sound, IPX5 water resistance, and 8-hour playtime.', c.id, 'SoundMax', 4999.00, 3299.00, 55, ARRAY['https://images.pexels.com/photos/3735632/pexels-photo-3735632.jpeg?auto=compress&cs=tinysrgb&w=600'], 4.50, false
FROM categories c WHERE c.category_name = 'Headphones';
