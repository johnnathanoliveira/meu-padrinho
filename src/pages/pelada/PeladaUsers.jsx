import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { UserCheck, Edit2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const POSITIONS = ['Goleiro', 'Fixo', 'Ala', 'Pivô', 'Atacante', 'Qualquer']

// Definição de todas as conquistas disponíveis
export const ACHIEVEMENTS = {
  bola_cheia: { emoji: '🌟', label: 'Bola Cheia', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  // Futuras conquistas podem ser adicionadas aqui
}

export function AchievementBadges({ medals = [], small = false }) {
  if (!medals || medals.length === 0) return null
  // Agrupa por tipo para mostrar contagem
  const counts = medals.reduce((acc, m) => {
    acc[m] = (acc[m] || 0) + 1
    return acc
  }, {})

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Object.entries(counts).map(([type, count]) => {
        const achievement = ACHIEVEMENTS[type]
        if (!achievement) return null
        return (
          <span
            key={type}
            title={`${achievement.label}${count > 1 ? ` ×${count}` : ''}`}
            className={`inline-flex items-center gap-0.5 rounded-full border font-bold
              ${achievement.bg} ${achievement.color}
              ${small ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'}`}
          >
            {achievement.emoji}
            {count > 1 && <span className={small ? 'text-xs' : 'text-xs'}>{count}</span>}
          </span>
        )
      })}
    </div>
  )
}

export default function PeladaUsers({ user }) {
  const [users, setUsers] = useState([])
  const [medals, setMedals] = useState({}) // userId -> ['bola_cheia', ...]
  const [loading, setLoading] = useState(true)
  const [editingPosition, setEditingPosition] = useState(false)
  const [position, setPosition] = useState(user.position || 'Qualquer')

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
      .select('cheia_user_id, murcha_user_id')

    if (data) {
      const map = {}
      data.forEach(w => {
        if (w.cheia_user_id) {
          if (!map[w.cheia_user_id]) map[w.cheia_user_id] = []
          map[w.cheia_user_id].push('bola_cheia')
        }
        // bola_murcha não gera medalha positiva — apenas registro
      })
      setMedals(map)
    }
  }

  const savePosition = async () => {
    const { error } = await supabase
      .from('pelada_users').update({ position }).eq('id', user.id)
    if (!error) {
      toast.success('Posição atualizada!')
      setEditingPosition(false)
      loadUsers()
    }
  }

  const myMedals = medals[user.id] || []

  return (
    <div className="p-4 space-y-4">
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <UserCheck className="text-brand-yellow" size={18} />
          <h2 className="font-black text-white">Jogadores</h2>
        </div>
        <p className="text-zinc-500 text-sm">{users.length} jogadores cadastrados</p>
      </div>

      {/* Meu perfil */}
      <div className="card border-brand-yellow/30">
        <h3 className="font-bold text-white text-sm mb-3">Meu perfil</h3>
        <div className="flex items-center gap-3">
          <img src={user.photo_url} alt={user.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-brand-yellow/60" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-white">{user.name}</p>
              <AchievementBadges medals={myMedals} />
            </div>
            {editingPosition ? (
              <div className="flex items-center gap-2 mt-1">
                <select value={position} onChange={e => setPosition(e.target.value)} className="input-field text-sm py-1.5">
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button onClick={savePosition} className="text-green-400 hover:text-green-300">
                  <Check size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-zinc-400 text-sm">{user.position || 'Qualquer'}</span>
                <button onClick={() => setEditingPosition(true)} className="text-zinc-600 hover:text-brand-yellow transition-colors">
                  <Edit2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista de jogadores */}
      {loading ? (
        <div className="text-zinc-600 text-center py-8">Carregando...</div>
      ) : (
        <div className="space-y-2">
          {users.map(u => {
            const uMedals = medals[u.id] || []
            return (
              <div key={u.id} className={`card flex items-center gap-3 ${u.id === user.id ? 'border-brand-yellow/30' : ''}`}>
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
