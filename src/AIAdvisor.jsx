import React, { useState, useEffect, useRef } from 'react'
import { callZhipuAI } from './supabase'

export default function AIAdvisor() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '你好！我是北邮职业导师AI，专门帮助你分析升学和就业方向。\n\n为了给你更精准的建议，我想先了解几个问题：\n\n1. 你现在是什么学历阶段？（本科/硕士）\n2. 你的专业方向是什么？\n3. 你对未来的职业方向有什么初步的想法吗？'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationStage, setConversationStage] = useState(1)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const analyzeStage = (userMessage) => {
    const content = userMessage.toLowerCase()
    if (content.includes('本科') || content.includes('大一') || content.includes('大二') || content.includes('大三') || content.includes('大四')) {
      return 2
    }
    if (content.includes('研究生') || content.includes('硕士') || content.includes('博士')) {
      return 2
    }
    return conversationStage
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    const newStage = analyzeStage(userMessage)
    setConversationStage(newStage)

    try {
      const conversationHistory = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage }
      ]

      const aiResponse = await callZhipuAI(conversationHistory)
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
    } catch (error) {
      console.error('AI调用失败:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `抱歉，AI服务暂时不可用，请稍后再试。错误信息: ${error.message}`
      }])
    }

    setLoading(false)
  }

  const resetConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: '你好！我是北邮职业导师AI，专门帮助你分析升学和就业方向。\n\n为了给你更精准的建议，我想先了解几个问题：\n\n1. 你现在是什么学历阶段？（本科/硕士）\n2. 你的专业方向是什么？\n3. 你对未来的职业方向有什么初步的想法吗？'
      }
    ])
    setConversationStage(1)
  }

  return (
    <div className="ai-advisor">
      <div className="ai-header">
        <h2>🤖 AI职业规划顾问</h2>
        <p className="ai-subtitle">基于智谱AI大模型，为你提供专业的升学就业咨询服务</p>
        <button onClick={resetConversation} className="reset-btn">重新开始咨询</button>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'assistant' ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                {msg.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <p>思考中...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的问题或回答..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? '发送中...' : '发送'}
          </button>
        </form>
      </div>

      <div className="ai-info">
        <h4>📋 咨询说明</h4>
        <ul>
          <li>AI会通过多轮对话深入了解你的需求</li>
          <li>请尽可能详细地回答问题，以获得更精准的推荐</li>
          <li>咨询结果仅供参考，最终决定权在你</li>
        </ul>
      </div>
    </div>
  )
}