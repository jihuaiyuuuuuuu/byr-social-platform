import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase, getPosts, createPost, getCurrentUser, createVerification, signUp, signIn, signOut } from './lib/supabase';
import TestConnection from './TestConnection';
import AIAdvisor from './AIAdvisor';

// 导航栏组件
const Header = ({ user, onSignOut }) => {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">北邮升学就业平台</div>
        <nav className="nav">
          <Link to="/" className="nav-link">首页</Link>
          <Link to="/ai-advisor" className="nav-link">AI咨询</Link>
          <Link to="/post" className="nav-link">发布信息</Link>
          <Link to="/auth" className="nav-link">实名认证</Link>
          <Link to="/test" className="nav-link">诊断</Link>
          {user ? (
            <button onClick={onSignOut} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              退出
            </button>
          ) : (
            <Link to="/login" className="nav-link">登录</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

// 首页组件
const Home = () => {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const categories = ['全部', '导师信息', '企业信息'];

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await getPosts(activeCategory === '全部' ? null : activeCategory);
    if (error) {
      console.error('获取帖子失败:', error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  return (
    <div className="container main">
      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category}
            className={`category-tag ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-content">
                <span className="post-category">{post.category}</span>
                <h3 className="post-title">{post.target_name}</h3>
                <p className="post-description">{post.content}</p>
                <div className="post-rating">
                  <div className="rating-stars">
                    {[...Array(5)].map((_, index) => (
                      <span key={index} className="star">
                        {index < Math.floor(post.rating) ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <span>{post.rating}</span>
                </div>
                <div className="post-footer">
                  <div className="user-info">
                    <div className="avatar">匿</div>
                    <span className="user-name">匿名用户</span>
                  </div>
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          暂无数据，快来发布第一条信息吧！
        </div>
      )}
    </div>
  );
};

// 发布帖子组件
const PostForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    category: '导师信息',
    target_name: '',
    content: '',
    rating: 5
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      alert('请先登录');
      navigate('/login');
      return;
    }
    setUser(currentUser);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('请先登录');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    const { data, error } = await createPost({
      ...formData,
      user_id: user.id,
      rating: parseFloat(formData.rating)
    });

    if (error) {
      console.error('发布失败:', error);
      alert('发布失败: ' + error.message);
    } else {
      alert('发布成功！');
      navigate('/');
    }
    setSubmitting(false);
  };

  return (
    <div className="container main">
      <div className="form-container">
        <h2>发布信息</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">分类</label>
            <select 
              name="category" 
              className="form-select" 
              value={formData.category} 
              onChange={handleChange}
            >
              <option value="导师信息">导师信息</option>
              <option value="企业信息">企业信息</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">目标对象名称</label>
            <input 
              type="text" 
              name="target_name" 
              className="form-input" 
              value={formData.target_name} 
              onChange={handleChange} 
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">分享内容</label>
            <textarea 
              name="content" 
              className="form-textarea" 
              value={formData.content} 
              onChange={handleChange} 
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">综合评分</label>
            <select 
              name="rating" 
              className="form-select" 
              value={formData.rating} 
              onChange={handleChange}
            >
              {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(score => (
                <option key={score} value={score}>{score}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="form-button" disabled={submitting}>
            {submitting ? '发布中...' : '发布'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 实名认证组件
const AuthForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    real_name: '',
    student_id: '',
    school: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      alert('请先登录');
      navigate('/login');
      return;
    }
    setUser(currentUser);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('请先登录');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    const { data, error } = await createVerification({
      ...formData,
      user_id: user.id
    });

    if (error) {
      console.error('提交失败:', error);
      alert('提交失败: ' + error.message);
    } else {
      alert('实名认证申请已提交，等待审核！');
      navigate('/');
    }
    setSubmitting(false);
  };

  return (
    <div className="container main">
      <div className="auth-container">
        <h2 className="auth-title">实名认证</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">真实姓名</label>
            <input 
              type="text" 
              name="real_name" 
              className="form-input" 
              value={formData.real_name} 
              onChange={handleChange} 
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">学号</label>
            <input 
              type="text" 
              name="student_id" 
              className="form-input" 
              value={formData.student_id} 
              onChange={handleChange} 
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">学校</label>
            <input 
              type="text" 
              name="school" 
              className="form-input" 
              value={formData.school} 
              onChange={handleChange} 
              required
            />
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
            注：您的真实信息仅用于验证，不会公开显示
          </p>
          <button type="submit" className="form-button" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? '提交中...' : '提交验证'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 登录组件
const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { data, error } = await signUp(formData.email, formData.password, {
        username: formData.username
      });
      if (error) {
        alert('注册失败: ' + error.message);
      } else {
        alert('注册成功！请检查邮箱验证链接。');
        navigate('/');
      }
    } else {
      const { data, error } = await signIn(formData.email, formData.password);
      if (error) {
        alert('登录失败: ' + error.message);
      } else {
        alert('登录成功！');
        navigate('/');
      }
    }
    setLoading(false);
  };

  return (
    <div className="container main">
      <div className="auth-container">
        <h2 className="auth-title">{isSignUp ? '注册账号' : '登录'}</h2>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">用户名</label>
              <input 
                type="text" 
                name="username" 
                className="form-input" 
                value={formData.username} 
                onChange={handleChange} 
                required={isSignUp}
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">邮箱</label>
            <input 
              type="email" 
              name="email" 
              className="form-input" 
              value={formData.email} 
              onChange={handleChange} 
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input 
              type="password" 
              name="password" 
              className="form-input" 
              value={formData.password} 
              onChange={handleChange} 
              required
            />
          </div>
          <button type="submit" className="form-button" style={{ width: '100%' }} disabled={loading}>
            {loading ? '处理中...' : (isSignUp ? '注册' : '登录')}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          {isSignUp ? '已有账号？' : '还没有账号？'}
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#ff2442', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? '立即登录' : '立即注册'}
          </button>
        </p>
      </div>
    </div>
  );
};

// 页脚组件
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p>© 2024 北邮升学就业信息平台 | 专注于北京本地高校/企业内部信息分享</p>
      </div>
    </footer>
  );
};

// 主应用组件
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 检查当前用户
    getCurrentUser().then(setUser);

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    alert('已退出登录');
  };

  return (
    <Router>
      <Header user={user} onSignOut={handleSignOut} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post" element={<PostForm />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<TestConnection />} />
        <Route path="/ai-advisor" element={<AIAdvisor />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;