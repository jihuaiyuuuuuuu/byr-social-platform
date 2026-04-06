-- 台球比赛平台数据库 - Supabase PostgreSQL
-- 复制以下所有SQL到 Supabase Dashboard > SQL Editor 执行

-- 1. 赛事表
CREATE TABLE tournament (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single_elim', 'double_elim', 'group_round', 'points')),
  max_players INT NOT NULL,
  current_players INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'registration', 'drawing', 'ongoing', 'finished')),
  prize TEXT,
  description TEXT,
  start_time TIMESTAMPTZ,
  location TEXT,
  creator_id BIGINT,
  create_time TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 报名表
CREATE TABLE enroll (
  id BIGSERIAL PRIMARY KEY,
  tournament_id BIGINT NOT NULL REFERENCES tournament(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'rejected')),
  create_time TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- 3. 比赛房间
CREATE TABLE room (
  id BIGSERIAL PRIMARY KEY,
  tournament_id BIGINT NOT NULL UNIQUE REFERENCES tournament(id) ON DELETE CASCADE,
  room_code TEXT UNIQUE,
  current_round INT DEFAULT 1,
  create_time TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 选手在房间
CREATE TABLE player_in_room (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT NOT NULL REFERENCES room(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL,
  status TEXT DEFAULT 'in' CHECK (status IN ('in', 'eliminated', 'win')),
  lose_count INT DEFAULT 0,
  total_score INT DEFAULT 0,
  UNIQUE(room_id, user_id)
);

-- 5. 单场对阵
CREATE TABLE match (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT NOT NULL REFERENCES room(id) ON DELETE CASCADE,
  round INT NOT NULL,
  player_a_id BIGINT,
  player_b_id BIGINT,
  winner_id BIGINT,
  stage TEXT DEFAULT 'group' CHECK (stage IN ('group', 'winner', 'loser', 'final')),
  group_name TEXT,
  is_bye INT DEFAULT 0,
  status TEXT DEFAULT 'ready' CHECK (status IN ('ready', 'playing', 'finished')),
  create_time TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 比分
CREATE TABLE score (
  id BIGSERIAL PRIMARY KEY,
  match_id BIGINT NOT NULL REFERENCES match(id) ON DELETE CASCADE,
  score_a INT DEFAULT 0,
  score_b INT DEFAULT 0,
  judge_id BIGINT NOT NULL,
  create_time TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 分组
CREATE TABLE group_info (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT NOT NULL REFERENCES room(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  UNIQUE(room_id, group_name)
);

-- 8. 小组成绩
CREATE TABLE group_score (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES group_info(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL,
  win INT DEFAULT 0,
  lose INT DEFAULT 0,
  score INT DEFAULT 0,
  UNIQUE(group_id, user_id)
);

-- 9. 排名
CREATE TABLE ranking (
  id BIGSERIAL PRIMARY KEY,
  room_id BIGINT NOT NULL REFERENCES room(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL,
  rank INT,
  UNIQUE(room_id, user_id)
);

-- 启用RLS
ALTER TABLE tournament ENABLE ROW LEVEL SECURITY;
ALTER TABLE enroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE room ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_in_room ENABLE ROW LEVEL SECURITY;
ALTER TABLE match ENABLE ROW LEVEL SECURITY;
ALTER TABLE score ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_score ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking ENABLE ROW LEVEL SECURITY;

-- 公开读写策略
CREATE POLICY "public_all" ON tournament FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON enroll FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON room FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON player_in_room FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON match FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON score FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON group_info FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON group_score FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON ranking FOR ALL USING (true) WITH CHECK (true);