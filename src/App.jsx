import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from './lib/supabase'

function Home() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkUser()
    loadTournaments()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const loadTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament')
        .select('*')
        .order('create_time', { ascending: false })

      if (error) throw error
      setTournaments(data || [])
    } catch (e) {
      console.log('Error:', e.message)
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
        {user ? (
          <div className="user-info" onClick={() => navigate('/profile')}>
            <span>👤 {user.email?.split('@')[0]}</span>
          </div>
        ) : (
          <Link to="/login" className="login-btn">登录</Link>
        )}
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
        <button className="nav-btn" onClick={() => navigate(user ? '/profile' : '/login')}>👤 我的</button>
      </nav>
    </div>
  )
}

function Login() {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('注册成功！请查收验证邮件。')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/')
      }
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <header className="page-header">
        <button onClick={() => navigate('/')}>← 返回</button>
        <h2>{isRegister ? '注册' : '登录'}</h2>
      </header>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>邮箱</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="请输入邮箱"
            required
          />
        </div>

        <div className="form-group">
          <label>密码</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="请输入密码"
            required
            minLength={6}
          />
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? '处理中...' : (isRegister ? '注册' : '登录')}
        </button>

        <div className="auth-switch">
          {isRegister ? '已有账号？' : '没有账号？'}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? '登录' : '注册'}
          </span>
        </div>
      </form>
    </div>
  )
}

function CreateTournament() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
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

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('请先登录！')
      navigate('/login')
      return
    }
    setSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('tournament')
        .insert([{ ...form, creator_id: user.id, status: 'registration' }])
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
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolled, setEnrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkUser()
    loadData()
  }, [id])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

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
    if (!user) {
      alert('请先登录！')
      navigate('/login')
      return
    }

    try {
      const { error } = await supabase
        .from('enroll')
        .insert([{ tournament_id: parseInt(id), user_id: user.id, status: 'passed' }])

      if (error) throw error

      await supabase
        .from('tournament')
        .update({ current_players: tournament.current_players + 1 })
        .eq('id', id)

      alert('报名成功！')
      loadData()
      setEnrolled(true)
    } catch (e) {
      alert('报名失败: ' + e.message)
    }
  }

  const handleStartDraw = async () => {
    if (enrolledPlayers.length < 2) {
      alert('报名人数至少需要2人！')
      return
    }

    try {
      await supabase
        .from('tournament')
        .update({ status: 'drawing' })
        .eq('id', id)

      navigate(`/draw/${id}`)
    } catch (e) {
      alert('启动抽签失败: ' + e.message)
    }
  }

  const handleEnterRoom = () => {
    navigate(`/room/${id}`)
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
          {tournament.status === 'registration' && (
            <button className="btn-enroll" onClick={handleEnroll}>立即报名</button>
          )}
          {tournament.status === 'registration' && user && enrolledPlayers.length >= 2 && (
            <button className="btn-draw" onClick={handleStartDraw}>🎯 开始抽签</button>
          )}
          {tournament.status === 'ongoing' && (
            <button className="btn-room" onClick={handleEnterRoom}>🏓 进入比赛房间</button>
          )}
        </div>
      </div>
    </div>
  )
}

function DrawPage() {
  const { id } = useParams()
  const [players, setPlayers] = useState([])
  const [bracket, setBracket] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadPlayers()
  }, [id])

  const loadPlayers = async () => {
    try {
      const { data: enrolls } = await supabase
        .from('enroll')
        .select('*')
        .eq('tournament_id', parseInt(id))
        .eq('status', 'passed')

      setPlayers(enrolls || [])
    } catch (e) {
      console.log('Error:', e.message)
    }
  }

  const generateBracket = (playerList) => {
    const shuffled = [...playerList].sort(() => Math.random() - 0.5)
    const matches = []

    for (let i = 0; i < shuffled.length; i += 2) {
      const match = {
        id: i / 2,
        round: 1,
        playerA: shuffled[i] || null,
        playerB: shuffled[i + 1] || null,
        winner: null,
        isBye: !shuffled[i + 1]
      }
      matches.push(match)
    }

    return matches
  }

  const handleDraw = async () => {
    setIsDrawing(true)

    await new Promise(resolve => setTimeout(resolve, 2000))

    const newBracket = generateBracket(players)
    setBracket(newBracket)
    setDrawn(true)
    setIsDrawing(false)

    try {
      const roomCode = 'RM' + Math.random().toString(36).substring(2, 8).toUpperCase()

      const { data: room } = await supabase
        .from('room')
        .insert([{ tournament_id: parseInt(id), room_code: roomCode }])
        .select()
        .single()

      for (const match of newBracket) {
        await supabase.from('match').insert([{
          room_id: room.id,
          round: match.round,
          player_a_id: match.playerA?.user_id,
          player_b_id: match.playerB?.user_id,
          is_bye: match.isBye ? 1 : 0,
          status: match.isBye ? 'finished' : 'ready'
        }])
      }

      await supabase
        .from('tournament')
        .update({ status: 'ongoing' })
        .eq('id', id)

    } catch (e) {
      console.log('Error saving bracket:', e.message)
    }
  }

  return (
    <div className="draw-page">
      <header className="page-header">
        <button onClick={() => navigate('/')}>← 返回</button>
        <h2>🎯 抽签仪式</h2>
      </header>

      <div className="draw-content">
        <div className="draw-info">
          <p>参赛选手：{players.length}人</p>
          <p>赛制：单败淘汰</p>
        </div>

        {!drawn ? (
          <>
            <div className="player-balls">
              {players.map((p, i) => (
                <div key={i} className={`ball ${isDrawing ? 'drawing' : ''}`}>
                  {i + 1}
                </div>
              ))}
            </div>

            <button
              className="btn-draw-main"
              onClick={handleDraw}
              disabled={isDrawing || players.length < 2}
            >
              {isDrawing ? '抽签中...' : '🎲 开始抽签'}
            </button>

            {players.length < 2 && (
              <p className="draw-hint">报名人数至少需要2人</p>
            )}
          </>
        ) : (
          <div className="bracket-result">
            <h3>对阵表已生成！</h3>
            <div className="bracket-list">
              {bracket.map((match, i) => (
                <div key={i} className="bracket-match">
                  <div className={`match-player ${match.isBye ? 'bye' : ''}`}>
                    <span>👤</span>
                    <span>{match.playerA ? `选手${players.indexOf(match.playerA) + 1}` : '轮空'}</span>
                  </div>
                  <div className="vs">VS</div>
                  <div className={`match-player ${match.isBye ? 'bye' : ''}`}>
                    <span>👤</span>
                    <span>{match.playerB ? `选手${players.indexOf(match.playerB) + 1}` : '轮空'}</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-enter-room" onClick={() => navigate(`/room/${id}`)}>
              🏓 进入比赛房间
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function MatchRoom() {
  const { id } = useParams()
  const [matches, setMatches] = useState([])
  const [currentMatch, setCurrentMatch] = useState(null)
  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadRoomData()
  }, [id])

  const loadRoomData = async () => {
    try {
      const { data: rooms } = await supabase
        .from('room')
        .select('*')
        .eq('tournament_id', parseInt(id))

      if (rooms && rooms.length > 0) {
        setRoom(rooms[0])

        const { data: matchData } = await supabase
          .from('match')
          .select('*')
          .eq('room_id', rooms[0].id)
          .order('round', { ascending: true })

        setMatches(matchData || [])

        const playing = matchData?.find(m => m.status === 'playing')
        if (playing) setCurrentMatch(playing)
        else if (matchData && matchData.length > 0 && matchData[0].status === 'ready') {
          setCurrentMatch(matchData[0])
        }
      }
    } catch (e) {
      console.log('Error:', e.message)
    }
    setLoading(false)
  }

  const handleScoreSubmit = async () => {
    if (!currentMatch) return

    try {
      const winnerId = scoreA > scoreB ? currentMatch.player_a_id : currentMatch.player_b_id

      await supabase.from('score').insert([{
        match_id: currentMatch.id,
        score_a: scoreA,
        score_b: scoreB,
        judge_id: 1
      }])

      await supabase
        .from('match')
        .update({ status: 'finished', winner_id: winnerId })
        .eq('id', currentMatch.id)

      const nextMatch = matches.find(m => m.status === 'ready')
      if (nextMatch) {
        await supabase
          .from('match')
          .update({ status: 'playing' })
          .eq('id', nextMatch.id)
        setCurrentMatch({ ...nextMatch, status: 'playing' })
      }

      setScoreA(0)
      setScoreB(0)
      loadRoomData()

    } catch (e) {
      alert('提交失败: ' + e.message)
    }
  }

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div className="room-page">
      <header className="page-header">
        <button onClick={() => navigate('/')}>← 返回</button>
        <h2>🏓 比赛房间</h2>
        {room && <span className="room-code">房间号: {room.room_code}</span>}
      </header>

      <div className="room-content">
        <div className="current-match">
          <h3>当前对阵</h3>
          {currentMatch ? (
            <div className="match-board">
              <div className="player-side">
                <span className="avatar">👤</span>
                <span className="name">{currentMatch.player_a_id ? `选手A` : '待定'}</span>
              </div>
              <div className="score-section">
                <div className="score-input">
                  <input
                    type="number"
                    value={scoreA}
                    onChange={e => setScoreA(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    value={scoreB}
                    onChange={e => setScoreB(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <button className="btn-submit-score" onClick={handleScoreSubmit}>
                  提交比分
                </button>
              </div>
              <div className="player-side">
                <span className="avatar">👤</span>
                <span className="name">{currentMatch.player_b_id ? `选手B` : '待定'}</span>
              </div>
            </div>
          ) : (
            <p className="no-match">暂无进行中的比赛</p>
          )}
        </div>

        <div className="match-history">
          <h3>比赛记录</h3>
          {matches.length === 0 ? (
            <p className="empty-text">暂无比赛记录</p>
          ) : (
            <div className="match-list">
              {matches.map((m, i) => (
                <div key={i} className={`match-item ${m.status}`}>
                  <span className="match-round">第{m.round}轮</span>
                  <span className="match-players">
                    {m.player_a_id ? '选手A' : 'TBD'} vs {m.player_b_id ? '选手B' : 'TBD'}
                  </span>
                  <span className={`match-status ${
                    m.status === 'finished' ? 'finished' :
                    m.status === 'playing' ? 'playing' : 'ready'
                  }`}>
                    {m.status === 'finished' ? '已结束' : m.status === 'playing' ? '进行中' : '待开始'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MyMatches() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) loadMyMatches(user.id)
  }

  const loadMyMatches = async (userId) => {
    try {
      const { data: enrolls } = await supabase
        .from('enroll')
        .select('*, tournament(*)')
        .eq('user_id', userId)

      setMatches(enrolls || [])
    } catch (e) {
      console.log('Error:', e.message)
    }
  }

  return (
    <div className="my-matches">
      <header className="page-header">
        <button onClick={() => navigate('/')}>← 返回</button>
        <h2>我的比赛</h2>
      </header>

      {matches.length === 0 ? (
        <div className="empty-state">
          <p>暂无参赛记录</p>
          <Link to="/" className="btn-primary">去报名赛事</Link>
        </div>
      ) : (
        <div className="match-cards">
          {matches.map((m, i) => (
            <div key={i} className="match-card" onClick={() => navigate(`/tournament/${m.tournament.id}`)}>
              <h4>{m.tournament?.name || '赛事'}</h4>
              <p>报名状态: {m.status}</p>
              <p>时间: {m.tournament?.start_time ? new Date(m.tournament.start_time).toLocaleDateString() : '待定'}</p>
            </div>
          ))}
        </div>
      )}

      <nav className="bottom-nav">
        <button className="nav-btn" onClick={() => navigate('/')}>🏠 首页</button>
        <button className="nav-btn active">📋 我的比赛</button>
        <button className="nav-btn" onClick={() => navigate(user ? '/profile' : '/login')}>👤 我的</button>
      </nav>
    </div>
  )
}

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="profile">
        <header className="page-header">
          <button onClick={() => navigate('/')}>← 返回</button>
          <h2>个人中心</h2>
        </header>
        <div className="empty-state">
          <p>请先登录</p>
          <Link to="/login" className="btn-primary">登录</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="profile">
      <header className="page-header">
        <button onClick={() => navigate('/')}>← 返回</button>
        <h2>个人中心</h2>
      </header>

      <div className="profile-card">
        <div className="avatar-large">👤</div>
        <h2>{user.email?.split('@')[0]}</h2>
        <p className="user-email">{user.email}</p>
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
        <button onClick={handleSignOut}>🚪 退出登录</button>
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
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<CreateTournament />} />
        <Route path="/tournament/:id" element={<TournamentDetail />} />
        <Route path="/draw/:id" element={<DrawPage />} />
        <Route path="/room/:id" element={<MatchRoom />} />
        <Route path="/my-matches" element={<MyMatches />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}