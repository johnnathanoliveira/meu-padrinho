import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { getUpcomingGames, groupGamesByDate, formatDate, getLiveGames } from '../../lib/worldCupGames'
import { useScores } from '../../hooks/useScores'
import LoginModal from '../../components/LoginModal'
import { Trophy, ChevronLeft, Star, Calendar, Share2, Radio, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import QRModal from '../../components/QRModal'

export default function BolaoHome() {
  const { user: authUser, getUserForModule } = useAuth()
  const user = getUserForModule('bolao')
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [tab, setTab] = useState('jogos')
  const [predictions, setPredictions] = useState({})
  const [savedPredictions, setSavedPredictions] = useState({})
  const [ranking, setRanking] = useState([])
  const [savingId, setSavingId] = useState(null)
  const [liveGames, setLiveGames] = useState([])
  const [now, setNow] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const { getScore, fetchScores, formatLastUpdated, secondsSince, minutesUntilRefresh } = useScores()

  const upcomingGames = getUpcomingGames()
  const gamesByDate = groupGamesByDate(upcomingGames.slice(0, 60))
  const shareLink = `${window.location.origin}/bolao`

  // Atualiza hora atual e jogos ao vivo a cada 30s
  useEffect(() => {
    const tick = () => {
      setLiveGames(getLiveGames())
      setNow(new Date())
    }
    tick()
    const interval = setInterval(tick, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (user) loadMyPredictions()
    if (tab === 'ranking') loadRanking()
  }, [user, tab])

  const loadMyPredictions = async () => {
    if (!user) return
    const { data } = await supabase.from('bolao_predictions').select('*').eq('user_id', user.id)
    if (data) {
      const map = {}
      data.forEach(p => { map[p.game_id] = { home: p.home_score, away: p.away_score, id: p.id } })
      setSavedPredictions(map)
    }
  }

  const loadRanking = async () => {
    const { data } = await supabase.from('bolao_ranking').select('*').order('points', { ascending: false }).limit(50)
    if (data) setRanking(data)
  }

  const handlePredictionChange = (gameId, side, value) => {
    const num = value === '' ? '' : Math.max(0, Math.min(99, parseInt(value) || 0))
    setPredictions(prev => ({ ...prev, [gameId]: { ...prev[gameId], [side]: num } }))
  }

  const savePrediction = async (game) => {
    if (!user) { setShowLogin(true); return }
    const pred = predictions[game.id]
    const saved = savedPredictions[game.id]
    const homeScore = pred?.home ?? saved?.home ?? ''
    const awayScore = pred?.away ?? saved?.away ?? ''
    if (homeScore === '' || awayScore === '') { toast.error('Preenche os dois placares!'); return }
    setSavingId(game.id)
    const { error } = await supabase.from('bolao_predictions').upsert(
      { id: savedPredictions[game.id]?.id, user_id: user.id, game_id: game.id, home_score: Number(homeScore), away_score: Number(awayScore) },
      { onConflict: 'user_id,game_id' }
    )
    setSavingId(null)
    if (!error) {
      toast.success('Palpite salvo! 🎯')
      setSavedPredictions(prev => ({ ...prev, [game.id]: { home: Number(homeScore), away: Number(awayScore) } }))
    } else {
      toast.error('Erro ao salvar!')
    }
  }

  const handleManualRefresh = async () => {
    setRefreshing(true)
    await fetchScores()
    setRefreshing(false)
    toast.success('Placares atualizados!')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col">
        <header className="flex items-center gap-3 p-4 border-b border-zinc-900">
          <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white"><ChevronLeft size={24} /></button>
          <Trophy className="text-brand-yellow" size={22} />
          <h1 className="text-lg font-black text-white">Bolão Copa 2026</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="text-6xl">⚽</div>
          <div>
            <h2 className="text-2xl font-black text-white">Copa do Mundo 2026</h2>
            <p className="text-zinc-500 mt-2">Faça seus palpites e dispute com seus amigos!</p>
          </div>
          <button onClick={() => setShowLogin(true)} className="btn-primary px-10">Entrar no Bolão 🏆</button>
          <button onClick={() => setShowQR(true)} className="btn-secondary px-8 flex items-center gap-2">
            <Share2 size={16} /> Compartilhar QR Code
          </button>
        </div>
        {showLogin && <LoginModal module="bolao" onClose={() => setShowLogin(false)} onSuccess={() => setShowLogin(false)} />}
        {showQR && <QRModal url={shareLink} onClose={() => setShowQR(false)} title="Bolão Copa 2026" />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col pb-6">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-zinc-900 sticky top-0 bg-brand-black z-10">
        <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white"><ChevronLeft size={24} /></button>
        <Trophy className="text-brand-yellow" size={22} />
        <h1 className="text-lg font-black text-white flex-1">Bolão Copa 2026</h1>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="text-zinc-400 hover:text-brand-yellow transition-colors"
          title="Atualizar placares"
        >
          <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
        </button>
        <button onClick={() => setShowQR(true)} className="text-zinc-400 hover:text-brand-yellow"><Share2 size={18} /></button>
        <img src={user.photo_url} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-brand-yellow/40" />
      </header>

      {/* Indicador de atualização automática */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-900/60 border-b border-zinc-900">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-zinc-500 text-xs">Placares: {formatLastUpdated()}</span>
        </div>
        <span className="text-zinc-600 text-xs">
          Próxima atualização em {minutesUntilRefresh > 0 ? `${minutesUntilRefresh}min` : 'instantes'}
        </span>
      </div>

      {/* Banner: jogos ao vivo agora */}
      {liveGames.length > 0 && (
        <div className="mx-3 mt-3 rounded-2xl bg-gradient-to-r from-red-900/60 to-red-800/40 border border-red-700/50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Radio size={14} className="text-red-400 animate-pulse" />
            <span className="text-red-400 font-black text-xs uppercase tracking-wider">Ao vivo agora</span>
          </div>
          {liveGames.map(g => {
            const score = getScore(g.id)
            return (
              <div key={g.id} className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <img src={g.homeFlag} alt={g.home} className="w-7 h-5 object-cover rounded-sm" />
                  <span className="text-white font-bold text-sm">{g.home}</span>
                </div>
                {score
                  ? <span className="text-white font-black text-xl">{score.home} × {score.away}</span>
                  : <span className="text-zinc-400 font-black text-lg animate-pulse">• • •</span>
                }
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">{g.away}</span>
                  <img src={g.awayFlag} alt={g.away} className="w-7 h-5 object-cover rounded-sm" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-3 bg-zinc-900/50">
        <button onClick={() => setTab('jogos')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${tab==='jogos' ? 'bg-brand-yellow text-black' : 'text-zinc-400 hover:text-white'}`}>
          <Calendar size={15} className="inline mr-1.5" />Jogos
        </button>
        <button onClick={() => setTab('ranking')} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${tab==='ranking' ? 'bg-brand-yellow text-black' : 'text-zinc-400 hover:text-white'}`}>
          <Star size={15} className="inline mr-1.5" />Ranking
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-3 pt-2">
        {tab === 'jogos' && (
          <>
            {Object.entries(gamesByDate).map(([date, games]) => (
              <div key={date} className="mb-4">
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider px-1 mb-2 capitalize">
                  {formatDate(date)}
                </p>
                <div className="space-y-2">
                  {games.map(game => {
                    const saved = savedPredictions[game.id]
                    const current = predictions[game.id]
                    const homeVal = current?.home ?? saved?.home ?? ''
                    const awayVal = current?.away ?? saved?.away ?? ''
                    const isSaving = savingId === game.id
                    const isLive = liveGames.some(l => l.id === game.id)

                    // Bloqueia 5 min antes do kick-off (hora local sem UTC)
                    const [gy, gmo, gd] = game.date.split('-').map(Number)
                    const [gh, gm] = game.time.split(':').map(Number)
                    const kickoff = new Date(gy, gmo - 1, gd, gh, gm, 0, 0)
                    const isPastGame = now >= new Date(kickoff.getTime() - 5 * 60 * 1000)

                    // Placar: prioriza Supabase, depois arquivo local
                    const score = getScore(game.id)
                    const hasScore = score !== null

                    return (
                      <div key={game.id} className={`card transition-all ${isLive ? 'border-red-700/60' : hasScore ? 'border-zinc-700' : ''}`}>
                        {/* Cabeçalho */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {isLive && (
                              <span className="flex items-center gap-1 text-xs text-red-400 font-bold">
                                <Radio size={11} className="animate-pulse" /> AO VIVO
                              </span>
                            )}
                            {hasScore && !isLive && (
                              <span className="text-xs text-zinc-600 font-medium">Encerrado</span>
                            )}
                            <span className="text-xs text-zinc-600 font-medium">
                              {game.phase}{game.group ? ` • Grupo ${game.group}` : ''}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-500">{game.time}</span>
                        </div>

                        {/* Times + Placar/Inputs */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 flex flex-col items-center gap-1.5">
                            <img src={game.homeFlag} alt={game.home} className="w-10 h-7 object-cover rounded-sm shadow" onError={e => e.target.style.display='none'} />
                            <span className="text-xs font-semibold text-white text-center leading-tight">{game.home}</span>
                          </div>

                          <div className="flex items-center gap-2 min-w-[100px] justify-center">
                            {hasScore ? (
                              // Jogo com resultado oficial
                              <div className="text-center">
                                <span className="text-white font-black text-2xl">
                                  {score.home} × {score.away}
                                </span>
                                {saved && (
                                  <p className="text-xs mt-0.5">
                                    {saved.home === score.home && saved.away === score.away
                                      ? <span className="text-green-400 font-bold">🎯 Placar exato! +2pts</span>
                                      : (saved.home - saved.away === score.home - score.away ||
                                         (saved.home > saved.away && score.home > score.away) ||
                                         (saved.home < saved.away && score.home < score.away) ||
                                         (saved.home === saved.away && score.home === score.away))
                                        ? <span className="text-brand-yellow font-bold">✓ Resultado certo! +1pt</span>
                                        : <span className="text-zinc-600">✗ Não pontuou</span>
                                    }
                                  </p>
                                )}
                              </div>
                            ) : isPastGame ? (
                              // Bloqueado mas sem resultado ainda
                              <div className="text-center">
                                <span className="text-zinc-600 text-sm font-medium">Em breve</span>
                              </div>
                            ) : (
                              // Input de palpite
                              <>
                                <input type="number" min="0" max="99" value={homeVal}
                                  onChange={e => handlePredictionChange(game.id, 'home', e.target.value)}
                                  className="w-12 h-12 text-center text-xl font-black bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-brand-yellow"
                                />
                                <span className="text-zinc-500 font-black">×</span>
                                <input type="number" min="0" max="99" value={awayVal}
                                  onChange={e => handlePredictionChange(game.id, 'away', e.target.value)}
                                  className="w-12 h-12 text-center text-xl font-black bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-brand-yellow"
                                />
                              </>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col items-center gap-1.5">
                            <img src={game.awayFlag} alt={game.away} className="w-10 h-7 object-cover rounded-sm shadow" onError={e => e.target.style.display='none'} />
                            <span className="text-xs font-semibold text-white text-center leading-tight">{game.away}</span>
                          </div>
                        </div>

                        {/* Botão salvar / palpite salvo */}
                        {!hasScore && !isPastGame && (
                          <button onClick={() => savePrediction(game)} disabled={isSaving}
                            className={`mt-3 w-full py-2 rounded-xl text-sm font-bold transition-all ${saved ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30 hover:bg-brand-yellow/20'}`}>
                            {isSaving ? '...' : saved ? `✓ Palpite: ${saved.home}×${saved.away}` : 'Salvar palpite'}
                          </button>
                        )}

                        {/* Meu palpite (jogo encerrado) */}
                        {hasScore && saved && (
                          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-zinc-500">
                            <span>Seu palpite:</span>
                            <span className="font-bold text-zinc-400">{saved.home} × {saved.away}</span>
                          </div>
                        )}

                        {isPastGame && !hasScore && (
                          <p className="mt-2 text-center text-xs text-zinc-600">
                            {isLive ? '🔴 Em andamento — aguardando resultado' : '⏳ Aguardando resultado oficial'}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'ranking' && (
          <div className="space-y-2 pt-2">
            <p className="text-zinc-600 text-xs text-center mb-4">
              Resultado certo: 1pt • Placar exato: 2pts
            </p>
            {ranking.length === 0 && (
              <div className="text-center text-zinc-500 py-12">
                <p>Ranking disponível após os primeiros resultados</p>
              </div>
            )}
            {ranking.map((r, i) => (
              <div key={r.user_id} className={`card flex items-center gap-3 ${r.user_id === user.id ? 'border-brand-yellow/50' : ''}`}>
                <span className={`w-8 text-center font-black text-lg ${i===0?'text-yellow-400':i===1?'text-zinc-400':i===2?'text-amber-600':'text-zinc-600'}`}>
                  {i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`}
                </span>
                <img src={r.photo_url} alt={r.name} className="w-10 h-10 rounded-full object-cover border border-zinc-700" />
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{r.name}</p>
                  <p className="text-zinc-500 text-xs">{r.exact_scores || 0} placares exatos</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-brand-yellow text-lg">{r.points || 0}</p>
                  <p className="text-zinc-600 text-xs">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showQR && <QRModal url={shareLink} onClose={() => setShowQR(false)} title="Bolão Copa 2026" />}
    </div>
  )
}
