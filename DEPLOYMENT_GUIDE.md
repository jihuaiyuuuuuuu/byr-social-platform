# 北邮升学就业平台部署指南

## 问题分析

经过检查，发现以下问题：
1. **系统未安装Node.js** - 无法执行npm命令
2. **GitHub仓库不存在** - `jihuaiyuuuuuuu/byr-social-platform` 仓库未创建
3. **部署配置需要优化** - 需要更简单的部署方案

## 解决方案

### 方法一：使用Vercel拖拽部署（推荐，最简便）

**步骤1：安装Node.js**
1. 下载Node.js：https://nodejs.org/zh-cn/download
2. 安装时选择默认选项
3. 安装完成后重启电脑

**步骤2：构建项目**
1. 打开命令行，进入项目目录：
   ```bash
   cd "c:\Users\jihua\Desktop\大二下\AI实训\AI class"
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 构建项目：
   ```bash
   npm run build
   ```
   构建完成后会生成 `dist` 文件夹

**步骤3：部署到Vercel**
1. 访问：https://vercel.com/dashboard
2. 点击 "Add New" → "Project"
3. 选择 "Drag and Drop"
4. 拖拽 `dist` 文件夹到浏览器中
5. 等待部署完成（约1-2分钟）
6. 获得部署URL（类似：`https://your-project.vercel.app`）

### 方法二：使用GitHub Pages

**步骤1：创建GitHub仓库**
1. 访问：https://github.com/new
2. 仓库名称：`byr-social-platform`
3. 勾选 "Add a README file"
4. 点击 "Create repository"

**步骤2：推送代码**
1. 打开命令行，进入项目目录：
   ```bash
   cd "c:\Users\jihua\Desktop\大二下\AI实训\AI class"
   ```
2. 推送代码：
   ```bash
   git push origin master
   ```
   按提示在浏览器中完成GitHub认证

**步骤3：启用GitHub Pages**
1. 进入仓库 → "Settings" → "Pages"
2. **Source**：选择 "GitHub Actions"
3. 点击 "Save"

**步骤4：配置Actions权限**
1. 进入 "Settings" → "Actions" → "General"
2. **Workflow permissions**：选择 "Read and write permissions"
3. 点击 "Save"

**步骤5：等待部署**
1. 进入 "Actions" 标签
2. 等待 "Deploy to GitHub Pages" 工作流完成
3. 部署完成后，访问 "Settings" → "Pages" 查看部署URL

### 方法三：使用Netlify

**步骤1：创建Netlify账户**
1. 访问：https://app.netlify.com/signup
2. 使用GitHub账号登录

**步骤2：部署项目**
1. 点击 "Add new site" → "Deploy manually"
2. 拖拽 `dist` 文件夹到浏览器中
3. 等待部署完成
4. 获得部署URL

## 环境变量配置

如果使用Vercel或Netlify，需要配置以下环境变量：

```
VITE_SUPABASE_URL=https://vwprtadvnmzcaboqwoks.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cHJ0YWR2bm16Y2Fib3F3b2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDY1NDcsImV4cCI6MjA4ODYyMjU0N30.Q_g7E8q4TaPQ3UbzbiHJsRJQYOtJACwIGH8oNYhBhBU
```

### Vercel配置
1. 进入项目 → "Settings" → "Environment Variables"
2. 添加上述变量
3. 点击 "Deploy" → "Redeploy"

### Netlify配置
1. 进入项目 → "Site settings" → "Environment variables"
2. 添加上述变量
3. 点击 "Deploys" → "Trigger deploy"

## 验证部署

部署完成后，访问部署URL，测试以下功能：
- 首页是否正常显示
- 注册/登录功能
- 发布信息功能
- 实名认证功能

## 常见问题

### 1. 构建失败
- 检查Node.js是否正确安装
- 检查package.json是否存在
- 尝试重新安装依赖：`npm install`

### 2. 部署后页面空白
- 检查Vite配置中的base路径
- 确保环境变量正确配置
- 检查浏览器控制台是否有错误

### 3. Supabase连接失败
- 检查Supabase项目是否正常运行
- 确认环境变量值是否正确
- 检查网络连接是否正常

## 技术支持

如果遇到问题，请提供以下信息：
1. 部署平台（Vercel/GitHub Pages/Netlify）
2. 部署URL
3. 具体错误信息
4. 浏览器控制台错误截图

我会帮你快速解决问题！