
CREATE TABLE IF NOT EXISTS favorite_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session text NOT NULL,
  city_name text NOT NULL,
  country text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE favorite_cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_favorites" ON favorite_cities FOR SELECT TO anon USING (true);
CREATE POLICY "insert_favorites" ON favorite_cities FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "delete_favorites" ON favorite_cities FOR DELETE TO anon USING (true);
CREATE POLICY "update_favorites" ON favorite_cities FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS recent_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session text NOT NULL,
  city_name text NOT NULL,
  country text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  searched_at timestamptz DEFAULT now()
);

ALTER TABLE recent_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_recent" ON recent_searches FOR SELECT TO anon USING (true);
CREATE POLICY "insert_recent" ON recent_searches FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "delete_recent" ON recent_searches FOR DELETE TO anon USING (true);
CREATE POLICY "update_recent" ON recent_searches FOR UPDATE TO anon USING (true) WITH CHECK (true);
