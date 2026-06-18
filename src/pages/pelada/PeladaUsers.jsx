import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { UserCheck, Edit2 } from 'lucide-react'
import AdminManager from '../../components/AdminManager'
import EditProfileModal from '../../components/EditProfileModal'

// ── Conquistas ────────────────────────────────────────────────
export const ACHIEVEMENTS = {
  bola_cheia: { emoji: '🌟', label: 'Bola Cheia', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
}

export function AchievementBadges({ medals = [], small = false }) {
  if (!medals || medals.length === 0) return null
  const counts = medals.reduce((acc, m) => { acc[m] = (acc[m] || 0) + 1; return acc }, {})
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Object.entries(counts).map(([type, count]) => {
        const a = ACHIEVEMENTS[type]
        if (!a) return null
        return (
          <span key={type} title={`${a.label}${count > 1 ? ` ×${count}` : ''}`}
            className={`inline-flex items-center gap-0.5 rounded-full border font-bold
              ${a.bg} ${a.color} ${small ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'}`}>
            {a.emoji}{count > 1 && <span className="text-xs">{count}</span>}
          </span>
        )
      })}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────
export default function PeladaUsers({ user }) {
  const [users, setUsers] = useState([])
  const [medals, setMedals] = useState({})
  const [loading, setLoading] = useState(true)
  const [showEditProfile, setShowEditProfile] = useState(false)

  useEffect(() => {
    loadUsers()
    loadMedals()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const { data } = await supabase.from('pelada_users').select('*').order('name')
    if (data) setUsers(data)
    setLoading(false)
  }

  const loadMedals = async () => {
    const { data } = await supabase
      .from('pelada_bola_winners')
      .select('cheia_user_id')
    if (data) {
      const map = {}
      data.forEach(w => {
        if (w.cheia_user_id) {
          if (!map[w.cheia_user_id]) map[w.cheia_user_id] = []
          map[w.cheia_user_id].push('bola_cheia')
        }
      })
      setMedals(map)
    }
  }

  const myMedals = medals[user.id] || []

  return (
    <div className="p-4 space-y-4">
      {/* Título */}
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <UserCheck className="text-brand-yellow" size={18} />
          <h2 className="font-black text-white">Jogadores</h2>
        </div>
        <p className="text-zinc-500 text-sm">{users.length} jogadores cadastrados</p>
      </div>

      {/* Gerenciamento de admins (só visível para admins) */}
      <AdminManager currentUserModule="pelada" />

      {/* Meu perfil */}
      <div className="card border-brand-yellow/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white text-sm">Meu perfil</h3>
          <button
            onClick={() => setShowEditProfile(true)}
            className="flex items-center gap-1.5 text-xs text-brand-yellow font-bold
                       bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl px-3 py-1.5
                       active:scale-95 transition-all"
          >
            <Edit2 size={12} /> Editar
          </button>
        </div>
        <div className="flex items-center gap-3">
          <img src={user.photo_url} alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-brand-yellow/60 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-white">{user.name}</p>
              <AchievementBadges medals={myMedals} />
            </div>
            <p className="text-zinc-400 text-sm mt-0.5">{user.position || 'Qualquer'}</p>
            <p className="text-zinc-600 text-xs mt-0.5 font-mono">{user.phone}</p>
          </div>
        </div>
      </div>

      {/* Modal de edição */}
      {showEditProfile && (
        <EditProfileModal
          module="pelada"
          onClose={() => setShowEditProfile(false)}
          onSaved={loadUsers}
        />
      )}

      {/* Lista de jogadores */}
      {loading ? (
        <div className="text-zinc-600 text-center py-8">Carregando...</div>
      ) : (
        <div className="space-y-2">
          {users.map(u => {
            const uMedals = medals[u.id] || []
            return (
              <div key={u.id}
                className={`card flex items-center gap-3 ${u.id === user.id ? 'border-brand-yellow/30' : ''}`}
              >
                <img src={u.photo_url} alt={u.name}
                  className="w-11 h-11 rounded-full object-cover border border-zinc-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white text-sm">{u.name}</p>
                    <AchievementBadges medals={uMedals} small />
                  </div>
                  <p className="text-zinc-500 text-xs">{u.position || 'Qualquer'}</p>
                </div>
                {u.id === user.id && (
                  <span className="text-xs text-brand-yellow font-bold shrink-0">você</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
