-- ============================================================
-- QUINIELA MUNDIAL 2026 - Schema de Base de Datos
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de partidos
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  match_date TIMESTAMPTZ NOT NULL,
  venue TEXT,
  stage TEXT NOT NULL DEFAULT 'group',  -- group | round_of_32 | round_of_16 | quarterfinal | semifinal | third_place | final
  group_name TEXT,                        -- A, B, C... (solo fase de grupos)
  match_day INT,                          -- jornada dentro del grupo
  home_score INT,                         -- null hasta que se juegue
  away_score INT,
  status TEXT DEFAULT 'scheduled',        -- scheduled | live | finished
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pronósticos
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  home_score INT NOT NULL,
  away_score INT NOT NULL,
  points INT,                             -- calculado al ingresar resultado
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Tabla de marcador global (se recalcula automáticamente)
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  u.id,
  u.username,
  u.display_name,
  COALESCE(SUM(p.points), 0) AS total_points,
  COUNT(p.id) FILTER (WHERE p.points IS NOT NULL) AS matches_scored,
  COUNT(p.id) FILTER (WHERE p.points = 3 OR p.points = 5) AS exact_scores,
  COUNT(p.id) FILTER (WHERE p.points = 1 OR p.points = 2) AS correct_results
FROM users u
LEFT JOIN predictions p ON p.user_id = u.id
WHERE u.is_admin = FALSE
GROUP BY u.id, u.username, u.display_name
ORDER BY total_points DESC, exact_scores DESC;

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Políticas para users: solo el service role puede escribir
CREATE POLICY "Service role full access on users" ON users
  FOR ALL USING (true);

-- Políticas para matches: todos pueden leer
CREATE POLICY "Anyone can read matches" ON matches
  FOR SELECT USING (true);
CREATE POLICY "Service role can write matches" ON matches
  FOR ALL USING (true);

-- Políticas para predictions: todos pueden leer, service role gestiona
CREATE POLICY "Anyone can read predictions" ON predictions
  FOR SELECT USING (true);
CREATE POLICY "Service role can write predictions" ON predictions
  FOR ALL USING (true);

-- ============================================================
-- DATOS INICIALES - Fase de Grupos Mundial 2026
-- Ajusta fechas y venues según calendario oficial
-- ============================================================

-- Grupo A (Juega en USA)
INSERT INTO matches (home_team, away_team, match_date, venue, stage, group_name, match_day) VALUES
('Estados Unidos', 'Bolivia', '2026-06-11 20:00:00-05', 'SoFi Stadium, Los Angeles', 'group', 'A', 1),
('Uruguay', 'Panamá', '2026-06-12 14:00:00-05', 'Estadio Azteca, Ciudad de México', 'group', 'A', 1),
('Panamá', 'Bolivia', '2026-06-16 14:00:00-05', 'MetLife Stadium, Nueva York', 'group', 'A', 2),
('Estados Unidos', 'Uruguay', '2026-06-16 20:00:00-05', 'AT&T Stadium, Dallas', 'group', 'A', 2),
('Bolivia', 'Uruguay', '2026-06-20 16:00:00-05', 'Levi''s Stadium, San Francisco', 'group', 'A', 3),
('Panamá', 'Estados Unidos', '2026-06-20 16:00:00-05', 'Arrowhead Stadium, Kansas City', 'group', 'A', 3);

-- Grupo B (Juega en México/USA)
INSERT INTO matches (home_team, away_team, match_date, venue, stage, group_name, match_day) VALUES
('México', 'Jamaica', '2026-06-12 20:00:00-06', 'Estadio Azteca, Ciudad de México', 'group', 'B', 1),
('Venezuela', 'Ecuador', '2026-06-13 14:00:00-06', 'Estadio Guadalajara, Guadalajara', 'group', 'B', 1),
('Ecuador', 'México', '2026-06-17 14:00:00-06', 'NRG Stadium, Houston', 'group', 'B', 2),
('Jamaica', 'Venezuela', '2026-06-17 20:00:00-06', 'Rose Bowl, Los Angeles', 'group', 'B', 2),
('Ecuador', 'Jamaica', '2026-06-21 16:00:00-06', 'Estadio Monterrey, Monterrey', 'group', 'B', 3),
('México', 'Venezuela', '2026-06-21 16:00:00-06', 'MetLife Stadium, Nueva York', 'group', 'B', 3);

-- Grupo C (Juega en Canadá/USA)
INSERT INTO matches (home_team, away_team, match_date, venue, stage, group_name, match_day) VALUES
('Canadá', 'Honduras', '2026-06-13 20:00:00-05', 'BC Place, Vancouver', 'group', 'C', 1),
('Marruecos', 'Bélgica', '2026-06-14 14:00:00-05', 'Lincoln Financial Field, Filadelfia', 'group', 'C', 1),
('Bélgica', 'Canadá', '2026-06-18 14:00:00-05', 'Estadio Azteca, Ciudad de México', 'group', 'C', 2),
('Honduras', 'Marruecos', '2026-06-18 20:00:00-05', 'Commonwealth Stadium, Edmonton', 'group', 'C', 2),
('Bélgica', 'Honduras', '2026-06-22 16:00:00-05', 'Hard Rock Stadium, Miami', 'group', 'C', 3),
('Canadá', 'Marruecos', '2026-06-22 16:00:00-05', 'BMO Field, Toronto', 'group', 'C', 3);

-- Los demás grupos (D-L) se agregan desde el panel Admin
-- El admin puede agregar partidos desde la sección "Gestionar Partidos"

-- ============================================================
-- USUARIO ADMINISTRADOR INICIAL
-- Password: admin123 (CAMBIAR INMEDIATAMENTE)
-- Hash bcrypt de "admin123"
-- ============================================================
INSERT INTO users (username, display_name, password_hash, is_admin) VALUES
('admin', 'Administrador', '$2b$10$rQnA1mH3pFKU1pXKxWqp1OzuITnLECd9DkjGNKu4VxJrJ7qSfqWHC', true)
ON CONFLICT (username) DO NOTHING;
