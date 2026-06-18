import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { worldCupGames, formatDate } from '../../lib/worldCupGames'
import { ClipboardList } from 'lucide-react'

function groupByDate(games) {
  return games.reduce((acc, g) => {
    if (!acc[g.date]) acc[g.date] = []
    acc[g.date].push(g)
    return acc
  }, {})
}

function ResultBadge({ pred, score }) {
  if (!score) {
    return <span className="text-xs text-zinc-600">Aguardando</span>
  }
  const predResult = Math.sign(pred.home - pred.away)
  const realResult = Math.sign(score.home - score.away)
  const exact = pred.home === score.home && pred.away === score.away

  if (exact) {
    return (
      <span className="text-xs font-bold text-green-400 bg-green-900/30 border border-green-800/50
                       rounded-full px-2 py-0.5">
        🎯 +2pts
      </span>
    )
  }
  if (predResult === realResult) {
    return (
      <span className="text-xs font-bold text-brand-yellow bg-brand-yellow/10 border border-brand-yellow/20
                       rounded-full px-2 py-0.5">
        ✓ +1pt
      </span>
    )
  }
  return (
    <span className="text-xs font-bold text-zinc-600 bg-zinc-800 border border-zinc-700
                     rounded-full px-2 py-0.5">
      ✗ 0pts
    </span>
  )
}

export default function MeusPalpites({ user, getScore }) {
  const [savedPredictions, setSavedPredictions] = useState({})
  const [loading, setLoading] = useState(true)
  const [totalPoints, setTotalPoints] = useState(0)
  const [totalExact, setTotalExact] = useState(0)

  useEffect(() => {
    loadPredictions()
  }, [user])

  const loadPredictions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('bolao_predictions')
      .select('*')
      .eq('user_id', user.id)

    if (data) {
      const map = {}
      data.forEach(p => {
        map[p.game_id] = { home: p.home_score, away: p.away_score }
      })
      setSavedPredictions(map)

      // Calcula pontuação local
      let pts = 0, exact = 0
      data.forEach(p => {
        const score = getScore(p.game_id)
        if (!score) return
        const predResult = Math.sign(p.home_score - p.away_score)
        const realResult = Math.sign(score.home - score.away)
        if (p.home_score === score.home && p.away_score === score.away) {
          pts += 2; exact++
        } else if (predResult === realResult) {
          pts += 1
        }
      })
      setTotalPoints(pts)
      setTotalExact(exact)
    }
    setLoading(false)
  }

  // Jogos onde o usuário deu palpite
  const gameIds = Object.keys(savedPredictions)
  const myGames = worldCupGames
    .filter(g => gameIds.includes(g.id))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  const byDate = groupByDate(myGames)

  if (loading) {
    return <div className="p-4 text-zinc-500 text-center pt-12">Carregando...</div>
  }

  return (
    <div className="p-4 space-y-4 pb-10">
      {/* Resumo */}
      <div className="card bg-gradient-to-br from-zinc-900 to-zinc-950 border-brand-yellow/20">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="text-brand-yellow" size={18} />
          <h2 className="font-black text-white">Meus Palpites</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-zinc-800/60 rounded-xl p-3">
            <p className="text-2xl font-black text-brand-yellow">{totalPoints}</p>
            <p className="text-zinc-500 text-xs mt-0.5">pontos</p>
          </div>
          <div className="text-center bg-zinc-800/60 rounded-xl p-3">
            <p className="text-2xl font-black text-green-400">{totalExact}</p>
            <p className="text-zinc-500 text-xs mt-0.5">exatos</p>
          </div>
          <div className="text-center bg-zinc-800/60 rounded-xl p-3">
            <p className="text-2xl font-black text-white">{gameIds.length}</p>
            <p className="text-zinc-500 text-xs mt-0.5">palpites</p>
          </div>
        </div>
      </div>

      {gameIds.length === 0 ? (
        <div className="card text-center py-10">
          <ClipboardList size={32} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">Você ainda não deu nenhum palpite.</p>
          <p className="text-zinc-600 text-sm mt-1">Vá na aba Jogos e aposte nos placares!</p>
        </div>
      ) : (
        Object.entries(byDate).map(([date, games]) => (
          <div key={date}>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider px-1 mb-2 capitalize">
              {formatDate(date)}
            </p>
            <div className="space-y-2">
              {games.map(game => {
                const pred = savedPredictions[game.id]
                const score = getScore(game.id)
                const hasResult = !!score

                return (
                  <div key={game.id} className={`card ${
                    hasResult
                      ? pred.home === score.home && pred.away === score.away
                        ? 'border-green-800/50'
                        : Math.sign(pred.home - pred.away) === Math.sign(score.home - score.away)
                          ? 'border-brand-yellow/30'
                          : 'border-zinc-800'
                      : 'border-zinc-800'
                  }`}>
                    {/* Fase + hora */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-600">
                        {game.phase}{game.group ? ` · Grupo ${game.group}` : ''}
                      </span>
                      <span className="text-xs text-zinc-500">{game.time}</span>
                    </div>

                    {/* Times */}
                    <div className="flex items-center gap-2">
                      {/* Time casa */}
                      <div className="flex-1 flex items-center gap-2 justify-end">
                        <span className="text-xs font-bold text-white text-right leading-tight">
                          {game.home}
                        </span>
                        <img src={game.homeFlag} alt={game.home}
                          className="w-8 h-6 object-cover rounded-sm shrink-0"
                          onError={e => e.target.style.display='none'} />
                      </div>

                      {/* Placares */}
                      <div className="flex flex-col items-center gap-1 shrink-0 min-w-[90px]">
                        {/* Meu palpite */}
                        <div className="flex items-center gap-1">
                          <span className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center
                                           font-black text-white text-lg">{pred.home}</span>
                          <span className="text-zinc-600 font-black text-sm">×</span>
                          <span className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center
                                           font-black text-white text-lg">{pred.away}</span>
                        </div>
                        <span className="text-zinc-700 text-xs">meu palpite</span>

                        {/* Resultado real */}
                        {hasResult && (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700
                                               flex items-center justify-center font-black text-sm
                                               text-zinc-300">{score.home}</span>
                              <span className="text-zinc-600 font-black text-sm">×</span>
                              <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700
                                               flex items-center justify-center font-black text-sm
                                               text-zinc-300">{score.away}</span>
                            </div>
                            <span className="text-zinc-700 text-xs">resultado</span>
                          </>
                        )}
                      </div>

                      {/* Time visitante */}
                      <div className="flex-1 flex items-center gap-2 justify-start">
                        <img src={game.awayFlag} alt={game.away}
                          className="w-8 h-6 object-cover rounded-sm shrink-0"
                          onError={e => e.target.style.display='none'} />
                        <span className="text-xs font-bold text-white leading-tight">
                          {game.away}
                        </span>
                      </div>
                    </div>

                    {/* Badge de pontuação */}
                    <div className="flex justify-center mt-2">
                      <ResultBadge pred={pred} score={score} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
