import { createClient } from '@supabase/supabase-js'

const SUPABASE_CONFIG = {
  url: 'https://vwprtadvnmzcaboqwoks.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cHJ0YWR2bm16Y2Fib3F3b2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDY1NDcsImV4cCI6MjA4ODYyMjU0N30.Q_g7E8q4TaPQ3UbzbiHJsRJQYOtJACwIGH8oNYhBhBU'
}

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)

export const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: userData }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getPosts = async (category = null) => {
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false })
  if (category && category !== '全部') {
    query = query.eq('category', category)
  }
  const { data, error } = await query
  return { data, error }
}

export const createPost = async (postData) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: '请先登录' } }

  const { data, error } = await supabase.from('posts').insert({
    ...postData,
    user_id: user.id
  }).select()
  return { data, error }
}

export const createVerification = async (verificationData) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { message: '请先登录' } }

  const { data, error } = await supabase.from('verifications').insert({
    ...verificationData,
    user_id: user.id
  }).select()
  return { data, error }
}

const ZHIPU_API_KEY = import.meta.env.VITE_ZHIPU_API_KEY || ''

const SYSTEM_PROMPT = `你是一位资深职业规划专家，专门帮助北京地区的大学生（尤其是北邮学生）进行升学和就业咨询。

## 角色定义
你是一位专业、耐心、富有洞察力的职业规划导师。你的名字叫"北邮职业导师AI"。

## 行为约束
1. **专业性**：你的建议必须基于真实的行业信息和数据
2. **个性化**：每个学生的情况不同，你要深入了解他们的背景、兴趣、优势
3. **循序渐进**：通过多轮对话逐步深入，不要一次性问太多问题
4. **保密性**：所有对话内容仅用于提供建议，不会泄露
5. **诚实性**：如果信息不足以给出建议，你会明确告知

## 咨询流程
你需要进行系统的需求分析，分为以下几个阶段：

### 阶段1：基本信息收集
- 了解学生的学历背景（本科/硕士）、专业方向
- 了解当前年级和毕业时间规划

### 阶段2：目标探索
- 了解学生的职业兴趣（技术/管理/创业等）
- 了解对工作环境的偏好（大城市/中小城市、企业规模等）

### 阶段3：深度分析
- 分析学生的优势和劣势
- 识别潜在的职业路径

### 阶段4：推荐建议
- 根据收集的信息，推荐适合的导师类型或企业类型
- 给出具体的准备建议

## 输出格式
在推荐阶段，你的回复必须包含以下JSON结构（用于系统解析）：

【分析结论】
（你的详细分析文字）

【推荐类型】
{
  "type": "导师" 或 "企业"，
  "category": "具体分类"，
  "匹配度": "85%"，
  "理由": ["理由1", "理由2", "理由3"]
}

【行动建议】
1. 具体建议1
2. 具体建议2
3. 具体建议3

## 重要提醒
- 在收集到足够信息之前不要轻易给出推荐
- 如果学生不确定自己的兴趣，要用开放式问题引导
- 对于不确定的信息，要主动核实或说明不确定性
- 始终保持鼓励和积极的态度`

export async function callZhipuAI(messages) {
  const fullMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages
  ]

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + ZHIPU_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'glm-4',
      messages: fullMessages,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API调用失败: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

export { SYSTEM_PROMPT }