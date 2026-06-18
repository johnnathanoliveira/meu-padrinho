import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Star, Clock, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import { AchievementBadges } from './PeladaUsers'

function getLastMonday() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function isVotingOpen() {
  const now = new Date()
  const isMonday = now.getDay() === 1
  const hour = now.getHours()
  return isMonday && hour >= 21
}

export default function ConquistasSection({ user, isAdmin }) {
  const [players, setPlayers] = useState([])
  const [myVotes, setMyVotes] = useState({ cheia: null, murcha: null })
  const [results, setResults] = useState({ cheia: [], murcha: [] })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [winners, setWinners] = useState(null)

  const lastMonday = getLastMonday()
  const mondayISO = lastMonday.toISOString().split('T')[0]
  const votingOpen = isVotingOpen()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)

    // Jogadores que foram à última pelada
    const { data: checkins } = await supabase
      .from('pelada_checkins')
      .select('*, pelada_users(id, name, photo_url)')
      .eq('pelada_date', mondayISO)
      .eq('going', true)

    if (checkins) {
      setPlayers(checkins.map(c => c.pelada_users).filter(Boolean))
    }

    // Meus votos
    const { data: myVoteData } = await supabase
      .from('pelada_bola_votes')
      .select('*')
      .eq('voter_id', user.id)
      .eq('pelada_date', mondayISO)

    if (myVoteData) {
      const cheiaVote = myVoteData.find(v => v.vote_type === 'cheia')
      const murchaVote = myVoteData.find(v => v.vote_type === 'murcha')
      setMyVotes({
        cheia: cheiaVote?.voted_user_id || null,
        murcha: murchaVote?.voted_user_id || null,
      })
    }

    // Resultados (contagem de votos)
    const { data: votes } = await supabase
      .from('pelada_bola_votes')
      .select('*, pelada_users!voted_user_id(name, photo_url)')
      .eq('pelada_date', mondayISO)

    if (votes) {
      // Agrupa por tipo
      const cheiaVotes = votes.filter(v => v.vote_type === 'cheia')
      const murchaVotes = votes.filter(v => v.vote_type === 'murcha')

      const countVotes = (arr) => {
        const map = {}
        arr.forEach(v => {
          const id = v.voted_user_id
          if (!map[id]) map[id] = { user: v.pelada_users, count: 0, id }
          map[id].count++
        })
        return Object.values(map).sort((a, b) => b.count - a.count)
      }

      setResults({
        cheia: countVotes(cheiaVotes),
        murcha: countVotes(murchaVotes),
      })
    }

    // Vencedores da semana
    const { data: weekWinners } = await supabase
      .from('pelada_bola_winners')
      .select('*, bolacheia:cheia_user_id(name, photo_url), bolamurcha:murcha_user_id(name, photo_url)')
      .eq('pelada_date', mondayISO)
      .single()

    if (weekWinners) setWinners(weekWinners)

    setLoading(false)
  }

  const handleVote = async (type, playerId) => {
    if (!votingOpen) {
      toast.error('A votação abre às 21h na segunda-feira!')
      return
    }
    if (playerId === user.id) {
      toast.error('Não pode votar em si mesmo! 😂')
      return
    }

    setSaving(true)
    const currentVote = myVotes[type]

    const { error } = await supabase
      .from('pelada_bola_votes')
      .upsert({
        voter_id: user.id,
        voted_user_id: playerId,
        vote_type: type,
        pelada_date: mondayISO,
      }, { onConflict: 'voter_id,vote_type,pelada_date' })

    if (!error) {
      toast.success(type === 'cheia' ? '🌟 Voto na Bola Cheia salvo!' : '💩 Voto na Bola Murcha salvo!')
      setMyVotes(prev => ({ ...prev, [type]: playerId }))
      loadData()
    } else {
      toast.error('Erro ao votar!')
    }
    setSaving(false)
  }

  const handleFinalizeVoting = async () => {
    if (results.cheia.length === 0 || results.murcha.length === 0) {
      toast.error('Nenhum voto ainda!')
      return
    }

    const cheiaWinner = results.cheia[0]
    const murchaWinner = results.murcha[0]

    const { error } = await supabase
      .from('pelada_bola_winners')
      .upsert({
        pelada_date: mondayISO,
        cheia_user_id: cheiaWinner.id,
        murcha_user_id: murchaWinner.id,
      }, { onConflict: 'pelada_date' })

    if (!error) {
      toast.success('Resultado finalizado! 🏆')
      loadData()
    }
  }

  if (loading) return <div className="p-4 text-zinc-500 text-center pt-12">Carregando...</div>

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="text-brand-yellow" size={18} />
          <h2 className="font-black text-white">Conquistas</h2>
        </div>
        {!votingOpen ? (
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={14} className="text-zinc-500" />
            <p className="text-zinc-500 text-xs">Votação abre às 21h da segunda-feira</p>
          </div>
        ) : (
          <p className="text-green-400 text-xs font-semibold">🟢 Votação aberta!</p>
        )}
      </div>

      {/* Vencedores da semana (ficam visíveis a semana toda) */}
      {winners && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card bg-gradient-to-b from-yellow-900/20 to-zinc-900 border-yellow-500/30 text-center">
            <p className="text-brand-yellow font-black text-sm mb-3">🌟 Bola Cheia</p>
            <img
              src={winners.bolacheia?.photo_url}
              alt={winners.bolacheia?.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400 mx-auto pulse-yellow"
            />
            <p className="text-white font-bold text-sm mt-2">{winners.bolacheia?.name?.split(' ')[0]}</p>
            <p className="text-yellow-600 text-xs mt-1">ganhou uma medalha 🌟</p>
          </div>
          <div className="card bg-gradient-to-b from-zinc-800/50 to-zinc-900 text-center">
            <p className="text-zinc-400 font-black text-sm mb-3">💩 Bola Murcha</p>
            <img
              src={winners.bolamurcha?.photo_url}
              alt={winners.bolamurcha?.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-zinc-600 mx-auto grayscale"
            />
            <p className="text-zinc-400 font-bold text-sm mt-2">{winners.bolamurcha?.name?.split(' ')[0]}</p>
          </div>
        </div>
      )}

      {/* Votação */}
      {(votingOpen || isAdmin) && (
        <>
          {/* Bola Cheia */}
          <div className="card">
            <h3 className="font-black text-brand-yellow mb-3">🌟 Bola Cheia — Craque do dia</h3>
            <div className="space-y-2">
              {players.filter(p => p.id !== user.id).map(p => (
                <button
                  key={p.id}
                  onClick={() => handleVote('cheia', p.id)}
                  disabled={saving}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    myVotes.cheia === p.id
                      ? 'bg-yellow-500/20 border border-yellow-500/60'
                      : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                >
                  <img src={p.photo_url} alt={p.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700" />
                  <span className="flex-1 text-left font-semibold text-white">{p.name}</span>
                  {myVotes.cheia === p.id && <span className="text-yellow-400">✓</span>}
                  {/* Contagem de votos (visível após votar) */}
                  {results.cheia.find(r => r.id === p.id) && (
                    <span className="text-zinc-500 text-xs">
                      {results.cheia.find(r => r.id === p.id)?.count} voto(s)
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Bola Murcha */}
          <div className="card">
            <h3 className="font-black text-zinc-400 mb-3">💩 Bola Murcha — Pior do dia</h3>
            <div className="space-y-2">
              {players.filter(p => p.id !== user.id).map(p => (
                <button
                  key={p.id}
                  onClick={() => handleVote('murcha', p.id)}
                  disabled={saving}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    myVotes.murcha === p.id
                      ? 'bg-zinc-600/30 border border-zinc-600'
                      : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                >
                  <img src={p.photo_url} alt={p.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700" />
                  <span className="flex-1 text-left font-semibold text-white">{p.name}</span>
                  {myVotes.murcha === p.id && <span className="text-zinc-400">✓</span>}
                  {results.murcha.find(r => r.id === p.id) && (
                    <span className="text-zinc-500 text-xs">
                      {results.murcha.find(r => r.id === p.id)?.count} voto(s)
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Finalizar votação (admin) */}
          {isAdmin && (
            <button onClick={handleFinalizeVoting} className="btn-primary w-full">
              Finalizar Votação e Publicar Resultado
            </button>
          )}
        </>
      )}

      {players.length === 0 && (
        <div className="card text-center text-zinc-600 py-8">
          Nenhum jogador confirmado na última pelada
        </div>
      )}
    </div>
  )
}
