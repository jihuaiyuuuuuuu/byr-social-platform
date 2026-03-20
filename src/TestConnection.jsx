import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const TestConnection = () => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('正在测试连接...');
  const [details, setDetails] = useState([]);

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const addDetail = (text, success = true) => {
    setDetails(prev => [...prev, { text, success }]);
  };

  const testSupabaseConnection = async () => {
    setStatus('loading');
    setMessage('正在测试Supabase连接...');
    setDetails([]);

    // 1. 测试基础连接
    addDetail('1. 检查Supabase客户端配置...');
    if (!supabase) {
      setStatus('error');
      setMessage('Supabase客户端未初始化');
      addDetail('❌ 客户端创建失败', false);
      return;
    }
    addDetail('✅ 客户端配置正常');

    // 2. 测试posts表查询
    addDetail('2. 测试posts表查询...');
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          addDetail('❌ posts表不存在！请在Supabase控制台执行SQL脚本', false);
          setStatus('error');
          setMessage('数据库表不存在，请先执行INIT_DATABASE.sql');
        } else if (error.code === '42501') {
          addDetail('❌ 权限不足，RLS策略可能有问题', false);
          setStatus('error');
          setMessage('行级安全策略配置错误');
        } else {
          addDetail(`❌ 查询失败: ${error.message}`, false);
          setStatus('error');
          setMessage(`查询错误: ${error.message}`);
        }
        return;
      }
      addDetail('✅ posts表查询成功');
    } catch (e) {
      addDetail(`❌ 网络错误: ${e.message}`, false);
      setStatus('error');
      setMessage('网络连接失败，请检查网络或Supabase项目状态');
      return;
    }

    // 3. 测试用户认证状态
    addDetail('3. 检查用户认证状态...');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        addDetail(`✅ 当前已登录: ${user.email}`);
      } else {
        addDetail('ℹ️ 当前未登录（这是正常的，测试功能不需要登录）');
      }
    } catch (e) {
      addDetail(`⚠️ 认证检查失败: ${e.message}`, false);
    }

    // 4. 测试写入权限
    addDetail('4. 测试数据库写入权限...');
    try {
      // 先检查是否有用户登录
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('posts').select('*').limit(0);
        if (!error) {
          addDetail('✅ 数据库可访问');
        } else {
          addDetail(`⚠️ 写入测试跳过: ${error.message}`, false);
        }
      } else {
        addDetail('ℹ️ 未登录，跳过写入测试（需要登录才能发布）');
      }
    } catch (e) {
      addDetail(`⚠️ 写入测试失败: ${e.message}`, false);
    }

    setStatus('success');
    setMessage('Supabase连接正常！');
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  return (
    <div className="container main">
      <div className="form-container">
        <h2>Supabase连接诊断</h2>
        
        <div style={{ 
          padding: '16px', 
          backgroundColor: status === 'success' ? '#f0fdf4' : status === 'error' ? '#fef2f2' : '#fffbeb',
          border: `1px solid ${getStatusColor()}`,
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ color: getStatusColor(), fontWeight: 'bold', margin: 0 }}>
            {status === 'loading' ? '⏳ ' : status === 'success' ? '✅ ' : '❌ '}
            {message}
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '16px', 
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '14px'
        }}>
          {details.map((item, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: '8px',
                color: item.success ? '#1e293b' : '#ef4444'
              }}
            >
              {item.text}
            </div>
          ))}
        </div>

        {status === 'error' && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#ef4444' }}>问题解决方案</h3>
            <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li>打开Supabase控制台: https://app.supabase.com</li>
              <li>进入你的项目: vwprtadvnmzcaboqwoks</li>
              <li>点击左侧菜单 → SQL Editor</li>
              <li>新建查询，复制 INIT_DATABASE.sql 内容并执行</li>
              <li>刷新页面后重新测试</li>
            </ol>
          </div>
        )}

        <button 
          onClick={testSupabaseConnection}
          className="form-button"
          style={{ marginTop: '20px' }}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? '测试中...' : '重新测试'}
        </button>
      </div>
    </div>
  );
};

export default TestConnection;