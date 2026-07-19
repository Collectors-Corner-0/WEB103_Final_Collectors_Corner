INSERT INTO users (username, email, password_hash)
VALUES
  ('demo_user', 'demo@example.com', 'demo-password-hash')
ON CONFLICT (username) DO NOTHING;

INSERT INTO user_profiles (user_id, display_name, bio, currently_enjoying)
SELECT id, 'Demo Collector', 'Default profile for development and testing.', 'Dune'
FROM users
WHERE username = 'demo_user'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO media (title, type, creator, description, is_user_generated)
VALUES
  ('Dune', 'book', 'Frank Herbert', 'Classic science fiction novel set on Arrakis.', FALSE),
  ('Spirited Away', 'movie', 'Hayao Miyazaki', 'Animated fantasy adventure film from Studio Ghibli.', FALSE),
  ('Kind of Blue', 'music', 'Miles Davis', 'Influential jazz album released in 1959.', FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO tags (name)
VALUES
  ('favorite'),
  ('rewatch'),
  ('wishlist')
ON CONFLICT (name) DO NOTHING;
