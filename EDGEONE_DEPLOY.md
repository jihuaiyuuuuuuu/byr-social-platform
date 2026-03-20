# 腾讯云EdgeOne Pages 部署指南

## 🎁 免费套餐说明

EdgeOne Pages 提供免费套餐：
- 100GB/月流量
- 无限站点数量
- 免费SSL证书
- 全球CDN加速
- 国内访问速度快

## 🚀 部署步骤

### 第一步：注册腾讯云账号（已完成可跳过）

1. 访问：https://cloud.tencent.com/
2. 点击右上角"注册"
3. 使用手机号/微信注册
4. **必须完成实名认证**（需要身份证）

### 第二步：开通EdgeOne服务

1. 登录腾讯云控制台：https://console.cloud.tencent.com/
2. 在顶部搜索框输入 "EdgeOne"
3. 点击进入EdgeOne控制台
4. 点击"立即使用"或"开通服务"
5. 选择"基础版"（免费套餐）
6. 点击"开通"

### 第三步：创建Pages项目

1. 在EdgeOne控制台左侧菜单点击"Pages"
2. 点击"创建项目"
3. 选择"从Git导入"
4. 点击"连接GitHub"
5. 授权腾讯云访问你的GitHub账号
6. 选择仓库：`jihuaiyuuuuuuu/byr-social-platform`
7. 点击"下一步"

### 第四步：配置构建参数

```
项目名称: byr-social-platform
分支: master
框架预设: Vite
构建命令: npm install && npm run build
输出目录: dist
根目录: /
Node.js 版本: 18
```

### 第五步：配置环境变量（重要！）

在"环境变量"部分，添加以下两个变量：

| 变量名 | 值 |
|-------|---|
| `VITE_SUPABASE_URL` | `https://vwprtadvnmzcaboqwoks.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cHJ0YWR2bm16Y2Fib3F3b2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDY1NDcsImV4cCI6MjA4ODYyMjU0N30.Q_g7E8q4TaPQ3UbzbiHJsRJQYOtJACwIGH8oNYhBhBU` |

### 第六步：开始部署

1. 点击"开始部署"
2. 等待部署完成（约2-3分钟）
3. 部署成功后，会获得一个类似 `https://xxxx.edgeone.app` 的访问地址

## 📋 部署配置文件

项目根目录已创建 `edgeone.config.js`：

```javascript
module.exports = {
  buildCommand: 'npm install && npm run build',
  outputDirectory: 'dist',
  rootDirectory: '.',
  framework: 'vite',
  
  environment: {
    VITE_SUPABASE_URL: 'https://vwprtadvnmzcaboqwoks.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
}
```

## 🔧 常见问题

### 问题1：构建失败
- 检查Node.js版本是否为18+
- 检查package.json中的build脚本
- 查看部署日志获取具体错误

### 问题2：环境变量不生效
- 确保变量名以 `VITE_` 开头
- 修改环境变量后需要**重新部署**

### 问题3：部署后页面空白
- 检查vite.config.js中的base路径配置
- 当前已配置为：`base: '/byr-social-platform/'`

### 问题4：国内访问慢
- EdgeOne在国内有加速节点，比GitHub Pages快很多
- 确保选择了正确的加速区域

## ✅ 验证部署成功

1. 访问部署后的 `*.edgeone.app` 域名
2. 测试以下功能：
   - 页面正常加载
   - 用户注册/登录
   - 发布测试帖子
   - 从Supabase查看数据是否正确保存

## 📱 绑定自定义域名（可选）

1. 在EdgeOne控制台进入项目
2. 点击"域名管理"
3. 点击"添加域名"
4. 输入你的域名（如 `byr.example.com`）
5. 按照提示配置DNS解析

## 💡 部署技巧

1. **自动部署**：配置后，每次推送到GitHub的master分支都会自动触发部署
2. **预览部署**：可以配置分支预览功能
3. **回滚版本**：在部署历史中可以快速回滚到任意版本
4. **缓存配置**：可以在EdgeOne控制台配置缓存策略

## 🆘 问题排查

如果部署遇到问题：
1. 查看部署日志（控制台→项目→部署历史→日志）
2. 检查环境变量是否正确配置
3. 本地运行 `npm run build` 确认能正常构建
4. 确认Supabase项目状态正常

完成以上步骤后，你的北邮升学就业平台就会在EdgeOne上成功部署了！