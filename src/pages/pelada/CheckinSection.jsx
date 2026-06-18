import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { CheckSquare, CheckCircle, XCircle, Settings, Lock, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

function getNextMonday() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 1 ? 0 : (8 - day) % 7 || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function getCheckinWindow() {
  const nextMonday = getNextMonday()
  const tuesday = new Date(nextMonday)
  tuesday.setDate(nextMonday.getDate() - 6)
  tuesday.setHours(0, 0, 0, 0)
  return { start: tuesday, end: nextMonday }
}

export default function CheckinSection({ user, isAdmin }) {
  const [checkins, setCheckins] = useState([])
  const [myCheckin, setMyCheckin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState(null) // { player_limit, id }
  const [editingLimit, setEditingLimit] = useState(false)
  const [limitInput, setLimitInput] = useState('')
  const [savingConfig, setSavingConfig] = useState(false)

  const nextMonday = getNextMonday()
  const { start, end } = getCheckinWindow()
  const now = new Date()
  const isWindowOpen = now >= start && now <= end
  const mondayISO = nextMonday.toISOString().split('T')[0]

  const mondayStr = nextMonday.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long'
  })

  useEffect(() => {
    loadCheckins()
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const { data } = await supabase
      .from('pelada_config')
      .select('*')
      .eq('pelada_date', mondayISO)
      .single()
    if (data) {
      setConfig(data)
      setLimitInput(data.player_limit ?? '')
    }
  }

  const loadCheckins = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('pelada_checkins')
      .select('*, pelada_users(name, photo_url, position)')
      .eq('pelada_date', mondayISO)
      .order('created_at')

    if (data) {
      setCheckins(data)
      const mine = data.find(c => c.user_id === user.id)
      setMyCheckin(mine || null)
    }
    setLoading(false)
  }

  const saveConfig = async () => {
    const limit = parseInt(limitInput)
    if (isNaN(limit) || limit < 1) {
      toast.error('Coloca um número válido!')
      return
    }
    setSavingConfig(true)
    const { error } = await supabase
      .from('pelada_config')
      .upsert({
        id: config?.id,
        pelada_date: mondayISO,
        player_limit: limit,
      }, { onConflict: 'pelada_date' })

    if (!error) {
      toast.success(`Limite definido: ${limit} jogadores de linha`)
      setEditingLimit(false)
      loadConfig()
    } else {
      toast.error('Erro ao salvar configuração!')
    }
    setSavingConfig(false)
  }

  const clearLimit = async () => {
    setSavingConfig(true)
    await supabase
      .from('pelada_config')
      .upsert({ id: config?.id, pelada_date: mondayISO, player_limit: null }, { onConflict: 'pelada_date' })
    setConfig(prev => ({ ...prev, player_limit: null }))
    setLimitInput('')
    setEditingLimit(false)
    toast.success('Limite removido')
    setSavingConfig(false)
  }

  const handleCheckin = async (going) => {
    // Verifica limite antes de confirmar presença
    if (going) {
      const limit = config?.player_limit
      if (limit) {
        const confirmedLineup = checkins.filter(c =>
          c.going && c.pelada_users?.position !== 'Goleiro' && c.user_id !== user.id
        )
        const myPosition = user.position
        const isGoleiro = myPosition === 'Goleiro'

        if (!isGoleiro && confirmedLineup.length >= limit) {
          toast.error(`Limite de ${limit} jogadores de linha atingido! ⛔`)
          return
        }
      }
    }

    setSaving(true)
    const { error } = await supabase
      .from('pelada_checkins')
      .upsert({
        id: myCheckin?.id,
        user_id: user.id,
        pelada_date: mondayISO,
        going,
      }, { onConflict: 'user_id,pelada_date' })

    if (!error) {
      toast.success(going ? 'Check-in confirmado! 🎉' : 'Falta confirmada 😢')
      loadCheckins()
    } else {
      toast.error('Erro ao confirmar. Tenta de novo!')
    }
    setSaving(false)
  }

  const confirmed = checkins.filter(c => c.going)
  const notGoing = checkins.filter(c => !c.going)
  const confirmedGoalkeepers = confirmed.filter(c => c.pelada_users?.position === 'Goleiro')
  const confirmedLineup = confirmed.filter(c => c.pelada_users?.position !== 'Goleiro')

  const playerLimit = config?.player_limit ?? null
  const lineupFull = playerLimit !== null && confirmedLineup.length >= playerLimit
  const spotsLeft = playerLimit !== null ? Math.max(0, playerLimit - confirmedLineup.length) : null
  const isMyPositionGoleiro = user.position === 'Goleiro'

  return (
    <div className="p-4 space-y-4">
      {/* Próxima pelada */}
      <div className="card bg-gradient-to-br from-zinc-900 to-zinc-950 border-brand-yellow/20">
        <div className="flex items-center gap-2 mb-1">
          <CheckSquare className="text-brand-yellow" size={18} />
          <h2 className="font-black text-white">Próxima Pelada</h2>
        </div>
        <p className="text-brand-yellow font-bold capitalize">{mondayStr}</p>
        {!isWindowOpen && (
          <p className="text-zinc-500 text-xs mt-1">Check-in disponível de terça até segunda</p>
        )}
      </div>

      {/* Config de limite (só admin) */}
      {isAdmin && (
        <div className="card border-brand-yellow/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Settings className="text-brand-yellow" size={16} />
              <h3 className="font-bold text-white text-sm">Limite de jogadores</h3>
            </div>
            {!editingLimit && (
              <button
                onClick={() => setEditingLimit(true)}
                className="text-xs text-brand-yellow font-bold hover:underline"
              >
                {playerLimit ? 'Alterar' : 'Definir'}
              </button>
            )}
          </div>

          {editingLimit ? (
            <div className="space-y-3">
              <div>
                <p className="text-zinc-400 text-xs mb-2">
                  Jogadores de linha (goleiros não contam)
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={limitInput}
                    onChange={e => setLimitInput(e.target.value)}
                    placeholder="Ex: 14"
                    className="input-field flex-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingLimit(false)}
                  className="btn-secondary flex-1 py-2 text-sm"
                >
                  Cancelar
                </button>
                {playerLimit && (
                  <button
                    onClick={clearLimit}
                    disabled={savingConfig}
                    className="bg-red-900/30 text-red-400 border border-red-800/50 rounded-xl px-3 py-2 text-sm font-bold"
                  >
                    Remover
                  </button>
                )}
                <button
                  onClick={saveConfig}
                  disabled={savingConfig}
                  className="btn-primary flex-1 py-2 text-sm"
                >
                  {savingConfig ? '...' : 'Salvar'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {playerLimit ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Jogadores de linha</span>
                    <span className="font-black text-white text-lg">
                      {confirmedLineup.length}
                      <span className="text-zinc-500 font-normal text-sm"> / {playerLimit}</span>
                    </span>
                  </div>
                  {/* Barra de progresso */}
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        lineupFull ? 'bg-red-500' : 'bg-brand-yellow'
                      }`}
                      style={{ width: `${Math.min(100, (confirmedLineup.length / playerLimit) * 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">
                      Goleiros: {confirmedGoalkeepers.length} (sem limite)
                    </span>
                    {lineupFull ? (
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <Lock size={10} /> Vagas esgotadas
                      </span>
                    ) : (
                      <span className="text-green-400 font-bold">
                        {spotsLeft} vaga{spotsLeft !== 1 ? 's' : ''} livre{spotsLeft !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-zinc-600 text-sm">Sem limite definido — todos podem entrar</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Aviso de vagas (para jogadores comuns) */}
      {!isAdmin && playerLimit && (
        <div className={`card flex items-center gap-3 ${lineupFull && !isMyPositionGoleiro ? 'border-red-800/50' : 'border-zinc-800'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            lineupFull && !isMyPositionGoleiro ? 'bg-red-900/30' : 'bg-brand-yellow/10'
          }`}>
            {lineupFull && !isMyPositionGoleiro
              ? <Lock size={18} className="text-red-400" />
              : <CheckSquare size={18} className="text-brand-yellow" />
            }
          </div>
          <div>
            {isMyPositionGoleiro ? (
              <p className="text-sm text-white font-semibold">Goleiros: sem limite de vagas 🧤</p>
            ) : lineupFull ? (
              <>
                <p className="text-sm text-red-400 font-bold">Vagas de jogadores esgotadas</p>
                <p className="text-xs text-zinc-500">Limite: {playerLimit} jogadores de linha</p>
              </>
            ) : (
              <>
                <p className="text-sm text-white font-semibold">
                  {spotsLeft} vaga{spotsLeft !== 1 ? 's' : ''} disponível{spotsLeft !== 1 ? 'is' : ''}
                </p>
                <p className="text-xs text-zinc-500">
                  {confirmedLineup.length} de {playerLimit} jogadores confirmados
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Meu check-in */}
      {isWindowOpen ? (
        <div className="card">
          <h3 className="font-bold text-white mb-3">Vai comparecer?</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleCheckin(true)}
              disabled={saving || (lineupFull && !isMyPositionGoleiro && myCheckin?.going !== true)}
              className={`flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all ${
                myCheckin?.going === true
                  ? 'bg-green-500 text-white'
                  : lineupFull && !isMyPositionGoleiro
                    ? 'bg-zinc-800 text-zinc-600 border border-zinc-700 cursor-not-allowed'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-green-900/40 hover:text-green-400 border border-zinc-700'
              }`}
            >
              <CheckCircle size={20} />
              {lineupFull && !isMyPositionGoleiro && myCheckin?.going !== true
                ? 'Vagas cheias ⛔'
                : 'Vou sim! 💪'
              }
            </button>
            <button
              onClick={() => handleCheckin(false)}
              disabled={saving}
              className={`flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all ${
                myCheckin?.going === false
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-red-900/40 hover:text-red-400 border border-zinc-700'
              }`}
            >
              <XCircle size={20} />
              Não vou 😢
            </button>
          </div>
        </div>
      ) : (
        <div className="card text-center text-zinc-500 text-sm py-4">
          Período de check-in: terça a segunda
        </div>
      )}

      {/* Lista de confirmados — separada por goleiros e linha */}
      <div className="card">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <span className="text-green-400">✓</span>
          Confirmados ({confirmed.length})
          {playerLimit && (
            <span className="ml-auto text-xs text-zinc-500 font-normal">
              {confirmedLineup.length}/{playerLimit} de linha · {confirmedGoalkeepers.length} 🧤
            </span>
          )}
        </h3>

        {loading ? (
          <div className="text-zinc-600 text-sm text-center py-4">Carregando...</div>
        ) : confirmed.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-2">Nenhum confirmado ainda</p>
        ) : (
          <>
            {/* Goleiros */}
            {confirmedGoalkeepers.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-zinc-600 font-semibold uppercase tracking-wider mb-2">
                  Goleiros 🧤
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {confirmedGoalkeepers.map(c => (
                    <PlayerCard key={c.id} c={c} />
                  ))}
                </div>
              </div>
            )}

            {/* Linha */}
            {confirmedLineup.length > 0 && (
              <div>
                {confirmedGoalkeepers.length > 0 && (
                  <p className="text-xs text-zinc-600 font-semibold uppercase tracking-wider mb-2">
                    Jogadores de linha
                    {playerLimit && (
                      <span className={`ml-2 font-bold ${lineupFull ? 'text-red-400' : 'text-brand-yellow'}`}>
                        {confirmedLineup.length}/{playerLimit}
                      </span>
                    )}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {confirmedLineup.map((c, idx) => (
                    <PlayerCard
                      key={c.id}
                      c={c}
                      dim={playerLimit && idx >= playerLimit}
                    />
                  ))}
                </div>
                {/* Aviso se passou do limite (não deveria acontecer, mas por segurança) */}
                {playerLimit && confirmedLineup.length > playerLimit && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
                    <AlertTriangle size={12} />
                    Atenção: há mais confirmados que o limite!
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Quem não vai */}
      {notGoing.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-zinc-500 mb-3 text-sm flex items-center gap-2">
            <span className="text-red-500">✗</span>
            Não vão ({notGoing.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {notGoing.map(c => (
              <div key={c.id} className="flex items-center gap-1.5 bg-zinc-800 rounded-full px-2 py-1">
                <img
                  src={c.pelada_users?.photo_url}
                  alt={c.pelada_users?.name}
                  className="w-5 h-5 rounded-full object-cover opacity-50"
                />
                <span className="text-xs text-zinc-500">{c.pelada_users?.name?.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlayerCard({ c, dim = false }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${dim ? 'opacity-40' : ''}`}>
      <div className="relative">
        <img
          src={c.pelada_users?.photo_url}
          alt={c.pelada_users?.name}
          className="w-14 h-14 rounded-full object-cover border-2 border-green-500/60"
        />
        <span className="absolute -bottom-0.5 -right-0.5 text-xs bg-green-500 rounded-full w-5 h-5 flex items-center justify-center">
          ✓
        </span>
      </div>
      <p className="text-xs text-zinc-300 font-medium text-center leading-tight">
        {c.pelada_users?.name?.split(' ')[0]}
      </p>
      <p className="text-xs text-zinc-600">{c.pelada_users?.position}</p>
    </div>
  )
}
