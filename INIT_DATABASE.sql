-- 最简单的数据库初始化脚本

-- 创建profiles表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建公开可见策略（允许所有人查看）
CREATE POLICY "允许所有人查看profiles" ON profiles FOR SELECT USING (true);

-- 创建自动创建profile的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 当auth.users有新用户时自动创建profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 确保auth.users可以触发这个函数
GRANT usage ON SCHEMA public TO anon;
GRANT all ON profiles TO anon;
GRANT all ON profiles TO authenticated;
GRANT all ON FUNCTION public.handle_new_user TO anon;
GRANT all ON FUNCTION public.handle_new_user TO authenticated;