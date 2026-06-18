import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Chaves separadas por módulo no localStorage
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
  // Cada módulo tem seu próprio estado
  const [users, setUsers] = useState({ bolao: null, pelada: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUsers({
      bolao:  loadSavedUser('bolao'),
      pelada: loadSavedUser('pelada'),
    })
    setLoading(false)
  }, [])

  // Retorna o usuário de um módulo específico
  const getUserForModule = (module) => users[module] ?? null

  const loginWithPhone = async (phone, name, photoUrl, module, position = 'Qualquer') => {
    const cleanPhone = phone.replace(/\D/g, '')
    try {
      const table = module === 'bolao' ? 'bolao_users' : 'pelada_users'

      const { data: existing } = await supabase
        .from(table).select('*').eq('phone', cleanPhone).single()

      let userData
      if (existing) {
        const { data: updated } = await supabase
          .from(table)
          .update({ name, photo_url: photoUrl, ...(module === 'pelada' ? { position } : {}) })
          .eq('phone', cleanPhone)
          .select().single()
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
      // Logout geral
      setUsers({ bolao: null, pelada: null })
      clearUser('bolao')
      clearUser('pelada')
    }
  }

  const isAdmin = (module) => {
    const admins = (import.meta.env.VITE_ADMIN_PHONES || '').split(',').map(p => p.trim())
    const u = module ? users[module] : (users.bolao || users.pelada)
    return admins.includes(u?.phone)
  }

  // `user` exposto para compatibilidade — retorna o usuário do módulo ativo
  // (usado por componentes que já recebem `user` como prop)
  const user = users.bolao || users.pelada

  return (
    <AuthContext.Provider value={{ user, users, loading, getUserForModule, loginWithPhone, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
