-- Migration 008: Update Football icon to black and white soccer ball
-- Change from American Football emoji 🏈 to Soccer ball emoji ⚽

UPDATE sports 
SET icon = '⚽' 
WHERE slug = 'football';

