// EdgeOne Pages 配置文件
// 用于腾讯云EdgeOne部署时自动识别

module.exports = {
  // 构建配置
  build: {
    command: 'npm install && npm run build',
    outputDir: 'dist',
    rootDir: '.',
    nodeVersion: '18'
  },

  // 环境变量（部署时需要在EdgeOne控制台重新配置）
  env: {
    VITE_SUPABASE_URL: 'https://vwprtadvnmzcaboqwoks.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cHJ0YWR2bm16Y2Fib3F3b2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDY1NDcsImV4cCI6MjA4ODYyMjU0N30.Q_g7E8q4TaPQ3UbzbiHJsRJQYOtJACwIGH8oNYhBhBU'
  },

  // 路由配置（SPA应用）
  routes: [
    {
      src: '.*',
      dest: '/index.html',
      status: 200
    }
  ],

  // 缓存配置
  cache: {
    enable: true,
    ttl: 86400,
    cacheControl: 'public, max-age=86400'
  }
}
