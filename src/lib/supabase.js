import { createClient } from '@supabase/supabase-js'
import SUPABASE_CONFIG from './config.js'

// 优先使用环境变量，否则使用配置文件
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 用户认证相关函数
export const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
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

// 帖子相关函数
export const getPosts = async (category = null) => {
  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (category && category !== '全部') {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  return { data, error }
}

export const createPost = async (postData) => {
  const { data, error } = await supabase
    .from('posts')
    .insert([postData])
    .select()
  
  return { data, error }
}

export const getPostById = async (id) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()
  
  return { data, error }
}

// 用户资料相关函数
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
  
  return { data, error }
}

// 实名认证相关函数
export const createVerification = async (verificationData) => {
  const { data, error } = await supabase
    .from('verifications')
    .insert([verificationData])
    .select()
  
  return { data, error }
}

export const getUserVerification = async (userId) => {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}