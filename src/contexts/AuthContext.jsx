import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const STORAGE_KEYS = {
  bolao:  'mpb_user_bolao',
  pelada: 'mpb_user_pelada',
}

function loadSavedUser(module) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[module])
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem(STORAGE_KEYS[module])
    return null
  }
}

function saveUser(module, userData) {
  localStorage.setItem(STORAGE_KEYS[module], JSON.stringify(userData))
}

function clearUser(module) {
  localStorage.removeItem(STORAGE_KEYS[module])
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState({ bolao: null, pelada: null })
  const [loading, setLoading] = useState(true)
  const [adminPhones, setAdminPhones] = useState([]) // lista do banco

  // Carrega usuários do localStorage e admins do banco
  useEffect(() => {
    setUsers({
      bolao:  loadSavedUser('bolao'),
      pelada: loadSavedUser('pelada'),
    })
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    try {
      const { data } = await supabase.from('admins').select('phone')
      const phones = data?.map(a => a.phone) ?? []
      // Também inclui os do .env como fallback
      const envPhones = (import.meta.env.VITE_ADMIN_PHONES || '').split(',').map(p => p.trim()).filter(Boolean)
      setAdminPhones([...new Set([...phones, ...envPhones])])
    } catch {
      // Se tabela não existir ainda, usa só o .env
      const envPhones = (import.meta.env.VITE_ADMIN_PHONES || '').split(',').map(p => p.trim()).filter(Boolean)
      setAdminPhones(envPhones)
    } finally {
      setLoading(false)
    }
  }

  const getUserForModule = (module) => users[module] ?? null

  const loginWithPhone = async (phone, name, photoUrl, module, position = 'Qualquer') => {
    const cleanPhone = phone.replace(/\D/g, '')
    try {
      const table = module === 'bolao' ? 'bolao_users' : 'pelada_users'
      const { data: existing } = await supabase.from(table).select('*').eq('phone', cleanPhone).single()

      let userData
      if (existing) {
        const { data: updated } = await supabase
          .from(table)
          .update({ name, photo_url: photoUrl, ...(module === 'pelada' ? { position } : {}) })
          .eq('phone', cleanPhone).select().single()
        userData = updated || existing
      } else {
        const { data: created, error } = await supabase
          .from(table)
          .insert({ phone: cleanPhone, name, photo_url: photoUrl, ...(module === 'pelada' ? { position } : {}) })
          .select().single()
        if (error) throw error
        userData = created
      }

      const userWithModule = { ...userData, module }
      setUsers(prev => ({ ...prev, [module]: userWithModule }))
      saveUser(module, userWithModule)
      return { success: true, user: userWithModule }
    } catch (err) {
      console.error('Erro ao fazer login:', err)
      return { success: false, error: err.message }
    }
  }

  const logout = (module) => {
    if (module) {
      setUsers(prev => ({ ...prev, [module]: null }))
      clearUser(module)
    } else {
      setUsers({ bolao: null, pelada: null })
      clearUser('bolao')
      clearUser('pelada')
    }
  }

  // Verifica se o usuário logado é admin (banco + env)
  const isAdmin = useCallback((module) => {
    const u = module ? users[module] : (users.bolao || users.pelada)
    if (!u?.phone) return false
    return adminPhones.includes(u.phone)
  }, [users, adminPhones])

  // Adiciona novo admin (só quem já é admin pode chamar)
  const addAdmin = async (phone) => {
    const cleanPhone = phone.replace(/\D/g, '')
    const { error } = await supabase
      .from('admins')
      .upsert({ phone: cleanPhone }, { onConflict: 'phone' })
    if (!error) {
      setAdminPhones(prev => [...new Set([...prev, cleanPhone])])
      return true
    }
    return false
  }

  // Remove admin
  const removeAdmin = async (phone) => {
    const cleanPhone = phone.replace(/\D/g, '')
    const { error } = await supabase.from('admins').delete().eq('phone', cleanPhone)
    if (!error) {
      setAdminPhones(prev => prev.filter(p => p !== cleanPhone))
      return true
    }
    return false
  }

  const user = users.bolao || users.pelada

  return (
    <AuthContext.Provider value={{
      user, users, loading,
      getUserForModule, loginWithPhone, logout,
      isAdmin, addAdmin, removeAdmin,
      adminPhones, reloadAdmins: loadAdmins,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
