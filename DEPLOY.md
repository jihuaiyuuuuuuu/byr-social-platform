# EdgeOne 部署指南

## 前置条件

1. **腾讯云账号** - 已完成实名认证
2. **GitHub仓库** - 代码已推送到GitHub
3. **Supabase项目** - 已创建并执行database.sql

## 部署步骤

### 第一步：注册腾讯云并开通EdgeOne

1. 访问 https://cloud.tencent.com
2. 点击右上角"注册"，使用手机号注册
3. 完成实名认证（需要身份证号）

### 第二步：开通EdgeOne服务

1. 登录腾讯云控制台
2. 在顶部搜索框搜索"EdgeOne"
3. 点击进入，选择"立即使用"或"开通服务"
4. 选择免费套餐

### 第三步：创建Pages项目

1. 在EdgeOne控制台，点击 **Pages** → **创建项目**
2. 选择 **从Git导入**
3. 授权连接你的GitHub账号
4. 选择仓库：`jihuaiyuuuuuuu/byr-social-platform`
5. 配置选项：
   - **框架预设**：Vite
   - **构建命令**：`npm install && npm run build`
   - **输出目录**：`dist`
   - **根目录**：`.`
6. 点击 **开始部署**

### 第四步：配置环境变量

部署完成后，需要配置Supabase环境变量：

1. 进入项目 → **设置** → **环境变量**
2. 添加以下变量：

```
VITE_SUPABASE_URL=https://vwprtadvnmzmzcaboqwoks.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cHJ0YWR2bm16Y2Fib3F3b2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDY1NDcsImV4cCI6MjA4ODYyMjU0N30.Q_g7E8q4TaPQ3UbzbiHJsRJQYOtJACwIGH8oNYhBhBU
```

3. 保存后点击 **重新部署**

### 第五步：验证部署

1. 等待部署完成（约1-2分钟）
2. EdgeOne会生成一个 `*.edgeone.app` 的公网URL
3. 访问该URL，测试以下功能：
   - 首页浏览帖子
   - 注册/登录
   - 发布信息
   - 实名认证

## 常见问题

### 1. 构建失败
- 检查package.json中的scripts是否正确
- 确认Vite配置无误

### 2. 环境变量不生效
- 确保变量名与代码中使用的一致（VITE_前缀）
- 修改环境变量后需要重新部署

### 3. Supabase连接失败
- 检查Supabase项目是否正常运行
- 确认环境变量值是否正确
- 检查Supabase的RLS策略是否配置正确

## 项目信息

- **GitHub仓库**：https://github.com/jihuaiyuuuuuuu/byr-social-platform
- **Supabase项目**：https://vwprtadvnmzcaboqwoks.supabase.co
- **技术栈**：React + Vite + Supabase