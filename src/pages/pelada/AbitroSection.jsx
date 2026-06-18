import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Shield, Play, Pause, RotateCcw, Square, UserPlus, Lock } from 'lucide-react'
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

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function AbitroSection({ user, isAdmin }) {
  const [isRunning, setIsRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [half, setHalf] = useState(1) // 1 ou 2
  const [cards, setCards] = useState([]) // {type, player_name, photo_url, minute}
  const [showAddCard, setShowAddCard] = useState(false)
  const [players, setPlayers] = useState([])
  const [cardType, setCardType] = useState('yellow')
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const intervalRef = useRef(null)

  const nextMonday = getNextMonday()
  const mondayISO = nextMonday.toISOString().split('T')[0]
  const isMonday = new Date().getDay() === 1

  useEffect(() => {
    loadCards()
    loadPlayers()
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const loadPlayers = async () => {
    const { data } = await supabase
      .from('pelada_checkins')
      .select('*, pelada_users(id, name, photo_url)')
      .eq('pelada_date', mondayISO)
      .eq('going', true)

    if (data) setPlayers(data.map(c => c.pelada_users).filter(Boolean))
  }

  const loadCards = async () => {
    const { data } = await supabase
      .from('pelada_cards')
      .select('*')
      .eq('pelada_date', mondayISO)
      .order('created_at')

    if (data) setCards(data)
  }

  const handleAddCard = async () => {
    if (!selectedPlayer) { toast.error('Seleciona um jogador!'); return }

    const minute = Math.floor(seconds / 60) + 1

    const { error } = await supabase.from('pelada_cards').insert({
      pelada_date: mondayISO,
      user_id: selectedPlayer.id,
      player_name: selectedPlayer.name,
      photo_url: selectedPlayer.photo_url,
      card_type: cardType,
      minute,
    })

    if (!error) {
      toast.success(`Cartão ${cardType === 'yellow' ? '🟡 amarelo' : '🔴 vermelho'} dado!`)
      loadCards()
      setShowAddCard(false)
      setSelectedPlayer(null)
    }
  }

  const handleRemoveCard = async (id) => {
    await supabase.from('pelada_cards').delete().eq('id', id)
    loadCards()
  }

  const yellowCards = cards.filter(c => c.card_type === 'yellow')
  const redCards = cards.filter(c => c.card_type === 'red')

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="text-brand-yellow" size={18} />
          <h2 className="font-black text-white">Árbitro</h2>
        </div>
        {!isMonday && (
          <p className="text-zinc-500 text-xs">Disponível durante a pelada (segunda-feira)</p>
        )}
      </div>

      {/* Cronômetro */}
      <div className="card text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <span className="text-zinc-500 text-sm font-semibold">
            {half}º Tempo
          </span>
        </div>

        {/* Display do tempo */}
        <div className={`text-7xl font-black font-mono tracking-tight ${
          isRunning ? 'text-brand-yellow' : 'text-white'
        }`}>
          {formatTime(seconds)}
        </div>

        {/* Controles */}
        {isAdmin ? (
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                isRunning
                  ? 'bg-yellow-500 text-black'
                  : 'bg-brand-yellow text-black'
              }`}
            >
              {isRunning ? <><Pause size={18} /> Pausar</> : <><Play size={18} /> Iniciar</>}
            </button>
            <button
              onClick={() => { setSeconds(0); setIsRunning(false) }}
              className="bg-zinc-800 text-zinc-300 px-4 py-3 rounded-xl hover:text-white transition-colors"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={() => {
                setIsRunning(false)
                setSeconds(0)
                setHalf(h => h === 1 ? 2 : 1)
                toast.success(`${half === 1 ? '2º' : '1º'} tempo!`)
              }}
              className="bg-zinc-800 text-zinc-300 px-4 py-3 rounded-xl hover:text-white transition-colors text-xs font-bold"
            >
              {half === 1 ? '2º T' : '1º T'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-zinc-600">
            <Lock size={16} />
            <span className="text-sm">Controlado pelo árbitro</span>
          </div>
        )}
      </div>

      {/* Cartões */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white">Cartões</h3>
          {isAdmin && (
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center gap-1.5 text-xs bg-brand-yellow/10 text-brand-yellow 
                         border border-brand-yellow/30 rounded-xl px-3 py-1.5 font-bold hover:bg-brand-yellow/20"
            >
              <UserPlus size={14} /> Dar cartão
            </button>
          )}
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
            <p className="text-3xl font-black text-yellow-400">{yellowCards.length}</p>
            <p className="text-yellow-600 text-xs font-semibold">🟡 Amarelos</p>
          </div>
          <div className="flex-1 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
            <p className="text-3xl font-black text-red-400">{redCards.length}</p>
            <p className="text-red-600 text-xs font-semibold">🔴 Vermelhos</p>
          </div>
        </div>

        {cards.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-2">Nenhum cartão ainda ✌️</p>
        ) : (
          <div className="space-y-2">
            {cards.map(c => (
              <div key={c.id}
                className={`flex items-center gap-3 rounded-xl p-2.5 ${
                  c.card_type === 'red' ? 'bg-red-900/20' : 'bg-yellow-900/20'
                }`}
              >
                <span className="text-xl">{c.card_type === 'red' ? '🔴' : '🟡'}</span>
                <img
                  src={c.photo_url}
                  alt={c.player_name}
                  className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{c.player_name}</p>
                  <p className="text-xs text-zinc-500">{c.minute}' — {half}º tempo</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleRemoveCard(c.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: adicionar cartão */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl w-full max-h-[80vh] overflow-auto p-5 space-y-4 fade-in">
            <h3 className="font-black text-white text-lg">Dar Cartão</h3>

            {/* Tipo */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCardType('yellow')}
                className={`py-3 rounded-xl font-bold text-sm transition-all ${
                  cardType === 'yellow' ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                🟡 Amarelo
              </button>
              <button
                onClick={() => setCardType('red')}
                className={`py-3 rounded-xl font-bold text-sm transition-all ${
                  cardType === 'red' ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                🔴 Vermelho
              </button>
            </div>

            {/* Jogadores */}
            <div>
              <p className="text-zinc-400 text-sm mb-2">Selecione o jogador:</p>
              <div className="space-y-2 max-h-60 overflow-auto">
                {players.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayer(p)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedPlayer?.id === p.id
                        ? 'bg-brand-yellow/20 border border-brand-yellow/60'
                        : 'bg-zinc-800 hover:bg-zinc-700'
                    }`}
                  >
                    <img src={p.photo_url} alt={p.name}
                      className="w-10 h-10 rounded-full object-cover" />
                    <span className="font-semibold text-white">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowAddCard(false); setSelectedPlayer(null) }}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button onClick={handleAddCard} className="btn-primary flex-1">
                Dar Cartão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
