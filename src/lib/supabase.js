import { createClient } from '@supabase/supabase-js'

<<<<<<< HEAD
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vwprtadvnmzcaboqwoks.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cHJ0YWR2bm16Y2Fib3F3b2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDY1NDcsImV4cCI6MjA4ODYyMjU0N30.Q_g7E8q4TaPQ3UbzbiHJsRJQYOtJACwIGH8oNYhBhBU'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
=======
const SUPABASE_CONFIG = {
  url: 'https://vwprtadvnmzcaboqwoks.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cHJ0YWR2bm16Y2Fib3F3b2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDY1NDcsImV4cCI6MjA4ODYyMjU0N30.Q_g7E8q4TaPQ3UbzbiHJsRJQYOtJACwIGH8oNYhBhBU'
}

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
>>>>>>> ce8fa56d373fe3c902aebc9910b4dae318a11a2d

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
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