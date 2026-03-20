-- =============================================
-- 北邮升学就业平台 - 数据库初始化脚本
-- 请在Supabase控制台的SQL Editor中执行此脚本
-- =============================================

-- 1. 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建表结构

-- 用户资料表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- 实名认证表
CREATE TABLE IF NOT EXISTS verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  real_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  school TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 帖子表
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  target_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating DECIMAL(2,1) CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建自动更新时间的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. 创建触发器
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_verifications_updated_at ON verifications;
CREATE TRIGGER update_verifications_updated_at BEFORE UPDATE ON verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. 创建用户注册触发器（自动创建profile）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. 启用行级安全
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 7. 创建安全策略

-- profiles表策略
CREATE POLICY "所有人可查看用户资料" ON profiles FOR SELECT USING (true);
CREATE POLICY "用户可创建自己的资料" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "用户可更新自己的资料" ON profiles FOR UPDATE USING (auth.uid() = id);

-- verifications表策略
CREATE POLICY "用户可查看自己的认证状态" ON verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户可提交认证申请" ON verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- posts表策略
CREATE POLICY "所有人可查看帖子" ON posts FOR SELECT USING (true);
CREATE POLICY "登录用户可发布帖子" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户可更新自己的帖子" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用户可删除自己的帖子" ON posts FOR DELETE USING (auth.uid() = user_id);

-- 8. 插入测试数据（可选）
-- INSERT INTO posts (user_id, category, target_name, content, rating)
-- VALUES ('00000000-0000-0000-0000-000000000000', '导师信息', '测试导师', '这是一条测试信息，导师非常负责。', 4.5);

-- =============================================
-- 执行完成后，请检查：
-- 1. Table Editor中是否有profiles, verifications, posts三张表
-- 2. Authentication中是否有用户
-- =============================================