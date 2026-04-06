// 数据库连接测试脚本
// 注意：此脚本需要在浏览器环境中运行，或使用Node.js + Supabase客户端

import { createClient } from '@supabase/supabase-js';

// 配置信息
const SUPABASE_URL = 'https://vwprtadvnmzcaboqwoks.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cHJ0YWR2bm16Y2Fib3F3b2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDY1NDcsImV4cCI6MjA4ODYyMjU0N30.Q_g7E8q4TaPQ3UbzbiHJsRJQYOtJACwIGH8oNYhBhBU';

// 创建客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 测试函数
async function testDatabase() {
  console.log('=== 开始测试数据库连接 ===\n');

  // 1. 测试连接
  console.log('1. 测试Supabase连接...');
  try {
    const { data, error } = await supabase.from('posts').select('count', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42P01') {
        console.log('   ❌ 错误：posts表不存在，请先在Supabase控制台执行SQL脚本');
        console.log('   💡 提示：请在Supabase SQL Editor中运行 INIT_DATABASE.sql');
      } else {
        console.log('   ❌ 错误：', error.message);
      }
    } else {
      console.log('   ✅ 连接成功，posts表存在');
    }
  } catch (e) {
    console.log('   ❌ 连接失败：', e.message);
  }

  // 2. 测试用户认证状态
  console.log('\n2. 测试用户认证状态...');
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    console.log('   ✅ 当前已登录，用户ID:', user.id);
  } else {
    console.log('   ℹ️ 当前未登录，这是正常状态');
  }

  // 3. 检查表结构（需要已登录用户）
  console.log('\n3. 检查表结构...');
  const tables = ['profiles', 'verifications', 'posts'];
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(0);
      if (error && error.code === '42P01') {
        console.log(`   ❌ ${table} 表不存在`);
      } else {
        console.log(`   ✅ ${table} 表存在`);
      }
    } catch (e) {
      console.log(`   ⚠️ ${table} 检查失败:`, e.message);
    }
  }

  console.log('\n=== 测试完成 ===');
  console.log('\n💡 下一步：');
  console.log('   1. 如果表不存在，请在Supabase控制台执行 INIT_DATABASE.sql');
  console.log('   2. 表创建完成后，可在前端测试注册和发布功能');
}

// 在浏览器中运行时自动执行
if (typeof window !== 'undefined') {
  testDatabase();
}

// 导出函数供其他地方使用
export { testDatabase, supabase };