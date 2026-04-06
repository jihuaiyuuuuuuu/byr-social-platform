import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from './lib/supabase'

function Home() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadTournaments()
  }, [])

  const loadTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament')
        .select('*')
        .order('create_time', { ascending: false })

      if (error) throw error
      setTournaments(data || [])
    } catch (e) {
      console.log('Table not ready or error:', e.message)
      setTournaments([])
    }
    setLoading(false)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: '筹备中', color: '#999' },
      registration: { text: '报名中', color: '#4CAF50' },
      drawing: { text: '抽签中', color: '#FF9800' },
      ongoing: { text: '进行中', color: '#F44336' },
      finished: { text: '已结束', color: '#666' }
    }
    return badges[status] || badges.pending
  }

  const getTypeName = (type) => {
    const types = {
      single_elim: '单败淘汰',
      double_elim: '双败淘汰',
      group_round: '小组循环',
      points: '积分循环'
    }
    return types[type] || type
  }

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div className="home">
      <header className="header">
        <h1>🏓 台球赛事平台</h1>
        <p className="subtitle">2026年度积分赛</p>
        <Link to="/create" className="create-btn">+ 创建赛事</Link>
      </header>

      <div className="tabs">
        <button className="tab active">全部赛事</button>
        <button className="tab">报名中</button>
        <button className="tab">进行中</button>
      </div>

      <div className="tournament-list">
        {tournaments.length === 0 ? (
          <div className="empty-state">
            <p>暂无赛事</p>
            <Link to="/create" className="btn-primary">创建赛事</Link>
          </div>
        ) : (
          tournaments.map(t => {
            const badge = getStatusBadge(t.status)
            const progress = t.max_players > 0 ? (t.current_players / t.max_players) * 100 : 0
            return (
              <div key={t.id} className="tournament-card" onClick={() => navigate(`/tournament/${t.id}`)}>
                <div className="card-header">
                  <h3>{t.name}</h3>
                  <span className="status-badge" style={{ background: badge.color }}>{badge.text}</span>
                </div>
                <div className="card-info">
                  <span>📅 {t.start_time ? new Date(t.start_time).toLocaleDateString() : '待定'}</span>
                  <span>📍 {t.location || '待定'}</span>
                </div>
                <div className="card-type">
                  <span className="type-tag">{getTypeName(t.type)}</span>
                </div>
                <div className="progress-section">
                  <div className="progress-text">
                    <span>报名进度</span>
                    <span>{t.current_players}/{t.max_players}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <nav className="bottom-nav">
        <button className="nav-btn active">🏠 首页</button>
        <button className="nav-btn" onClick={() => navigate('/my-matches')}>📋 我的比赛</button>
        <button className="nav-btn" onClick={() => navigate('/profile')}>👤 我的</button>
      </nav>
    </div>
  )
}

function CreateTournament() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    type: 'single_elim',
    max_players: 16,
    start_time: '',
    location: '',
    prize: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('tournament')
        .insert([form])
        .select()

      if (error) throw error
      navigate('/')
    } catch (e) {
      alert('创建失败: ' + e.message)
    }
    setSubmitting(false)
  }

  return (
    <div className="create-page">
      <header className="page-header">
        <button onClick={() => navigate('/')}>← 返回</button>
        <h2>创建赛事</h2>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>赛事名称</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
            placeholder="例如：2026年春季台球赛"
            required
          />
        </div>

        <div className="form-group">
          <label>赛制类型</label>
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="single_elim">单败淘汰</option>
            <option value="double_elim">双败淘汰</option>
            <option value="group_round">小组循环+淘汰</option>
            <option value="points">积分循环</option>
          </select>
        </div>

        <div className="form-group">
          <label>最大参赛人数</label>
          <select value={form.max_players} onChange={e => setForm({...form, max_players: parseInt(e.target.value)})}>
            <option value="8">8人</option>
            <option value="16">16人</option>
            <option value="32">32人</option>
            <option value="64">64人</option>
          </select>
        </div>

        <div className="form-group">
          <label>比赛时间</label>
          <input
            type="datetime-local"
            value={form.start_time}
            onChange={e => setForm({...form, start_time: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>比赛地点</label>
          <input
            type="text"
            value={form.location}
            onChange={e => setForm({...form, location: e.target.value})}
            placeholder="例如：北邮台球厅"
          />
        </div>

        <div className="form-group">
          <label>奖金设置</label>
          <input
            type="text"
            value={form.prize}
            onChange={e => setForm({...form, prize: e.target.value})}
            placeholder="例如：冠军¥2000 | 亚军¥1000"
          />
        </div>

        <div className="form-group">
          <label>赛事说明</label>
          <textarea
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            placeholder="描述赛事规则、注意事项等..."
            rows="4"
          />
        </div>

        <button type="submit" className="btn-submit" disabled={submitting}>
          {submitting ? '创建中...' : '创建赛事'}
        </button>
      </form>
    </div>
  )
}

function TournamentDetail() {
  const { id } = useParams()
  const [tournament, setTournament] = useState(null)
  const [enrolledPlayers, setEnrolledPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const { data: t } = await supabase
        .from('tournament')
        .select('*')
        .eq('id', id)
        .single()

      setTournament(t)

      const { data: enrolls } = await supabase
        .from('enroll')
        .select('*')
        .eq('tournament_id', id)

      setEnrolledPlayers(enrolls || [])
    } catch (e) {
      console.log('Error:', e.message)
    }
    setLoading(false)
  }

  const handleEnroll = async () => {
    try {
      const { error } = await supabase
        .from('enroll')
        .insert([{ tournament_id: id, user_id: 1, status: 'pending' }])

      if (error) throw error
      alert('报名成功！')
      loadData()
    } catch (e) {
      alert('报名失败: ' + e.message)
    }
  }

  const getTypeName = (type) => {
    const types = {
      single_elim: '单败淘汰',
      double_elim: '双败淘汰',
      group_round: '小组循环+淘汰',
      points: '积分循环'
    }
    return types[type] || type
  }

  if (loading) return <div className="loading">加载中...</div>
  if (!tournament) return <div className="loading">赛事不存在</div>

  return (
    <div className="detail-page">
      <header className="page-header">
        <button onClick={() => navigate('/')}>← 返回</button>
        <h2>赛事详情</h2>
      </header>

      <div className="detail-content">
        <div className="detail-title">
          <h1>{tournament.name}</h1>
          <span className="type-tag">{getTypeName(tournament.type)}</span>
        </div>

        <div className="info-section">
          <h3>📅 赛事信息</h3>
          <p>时间：{tournament.start_time ? new Date(tournament.start_time).toLocaleString() : '待定'}</p>
          <p>地点：{tournament.location || '待定'}</p>
          <p>赛制：{getTypeName(tournament.type)}</p>
          <p>参赛人数：{tournament.current_players}/{tournament.max_players}人</p>
        </div>

        {tournament.prize && (
          <div className="info-section">
            <h3>🏆 奖金设置</h3>
            <p>{tournament.prize}</p>
          </div>
        )}

        {tournament.description && (
          <div className="info-section">
            <h3>📋 赛事说明</h3>
            <p>{tournament.description}</p>
          </div>
        )}

        <div className="info-section">
          <h3>👥 已报名选手 ({enrolledPlayers.length})</h3>
          <div className="player-list">
            {enrolledPlayers.length === 0 ? (
              <p className="empty-text">暂无报名选手</p>
            ) : (
              enrolledPlayers.map((p, i) => (
                <div key={i} className="player-chip">
                  <span className="player-avatar">👤</span>
                  <span className="player-name">选手{i + 1}</span>
                  <span className={`player-status ${p.status}`}>{p.status === 'passed' ? '已通过' : '待审核'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="action-bar">
          <button className="btn-share">📤 分享</button>
          {tournament.status === 'registration' && (
            <button className="btn-enroll" onClick={handleEnroll}>立即报名</button>
          )}
        </div>
      </div>
    </div>
  )
}

function MyMatches() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])

  return (
    <div className="my-matches">
      <header className="page-header">
        <button onClick={() => navigate('/')}>← 返回</button>
        <h2>我的比赛</h2>
      </header>

      <div className="empty-state">
        <p>暂无参赛记录</p>
        <Link to="/" className="btn-primary">去报名赛事</Link>
      </div>

      <nav className="bottom-nav">
        <button className="nav-btn" onClick={() => navigate('/')}>🏠 首页</button>
        <button className="nav-btn active">📋 我的比赛</button>
        <button className="nav-btn" onClick={() => navigate('/profile')}>👤 我的</button>
      </nav>
    </div>
  )
}

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  return (
    <div className="profile">
      <header className="page-header">
        <button onClick={() => navigate('/')}>← 返回</button>
        <h2>个人中心</h2>
      </header>

      <div className="profile-card">
        <div className="avatar-large">👤</div>
        <h2>游客用户</h2>
        <p className="verify-hint">登录后享受完整功能</p>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">0</span>
          <span className="stat-label">参赛场次</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">0%</span>
          <span className="stat-label">胜率</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">-</span>
          <span className="stat-label">当前排名</span>
        </div>
      </div>

      <div className="menu-list">
        <button>📋 报名记录</button>
        <button>🏆 我的荣誉</button>
        <button>⚙️ 设置</button>
      </div>

      <nav className="bottom-nav">
        <button className="nav-btn" onClick={() => navigate('/')}>🏠 首页</button>
        <button className="nav-btn" onClick={() => navigate('/my-matches')}>📋 我的比赛</button>
        <button className="nav-btn active">👤 我的</button>
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateTournament />} />
        <Route path="/tournament/:id" element={<TournamentDetail />} />
        <Route path="/my-matches" element={<MyMatches />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}