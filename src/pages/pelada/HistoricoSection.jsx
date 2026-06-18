import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { History, ChevronDown, ChevronUp, Trophy, Minus, X } from 'lucide-react'

function formatDateBR(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

export default function HistoricoSection({ user }) {
  const [history, setHistory] = useState([]) // agrupado por data
  const [loading, setLoading] = useState(true)
  const [expandedDate, setExpandedDate] = useState(null)
  const [expandedMatch, setExpandedMatch] = useState(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('pelada_matches')
      .select('*')
      .order('pelada_date', { ascending: false })
      .order('created_at', { ascending: true })

    if (data) {
      // Agrupa por data
      const grouped = data.reduce((acc, match) => {
        if (!acc[match.pelada_date]) acc[match.pelada_date] = []
        acc[match.pelada_date].push(match)
        return acc
      }, {})
      setHistory(Object.entries(grouped))
    }
    setLoading(false)
  }

  if (loading) return <div className="p-4 text-zinc-500 text-center pt-12">Carregando...</div>

  return (
    <div className="p-4 space-y-4">
      <div className="card">
        <div className="flex items-center gap-2">
          <History className="text-brand-yellow" size={18} />
          <h2 className="font-black text-white">Histórico de Peladas</h2>
        </div>
        <p className="text-zinc-500 text-sm mt-1">{history.length} pelada{history.length !== 1 ? 's' : ''} registrada{history.length !== 1 ? 's' : ''}</p>
      </div>

      {history.length === 0 ? (
        <div className="card text-center text-zinc-600 py-10">
          <History size={32} className="mx-auto mb-3 text-zinc-800" />
          <p>Nenhum jogo registrado ainda.</p>
          <p className="text-xs mt-1">Os jogos aparecem aqui após serem lançados na aba Jogos.</p>
        </div>
      ) : (
        history.map(([date, matches]) => {
          const isDateOpen = expandedDate === date
          const dayStats = calcDayStats(matches)

          return (
            <div key={date} className="card p-0 overflow-hidden">
              {/* Header da data */}
              <button
                onClick={() => setExpandedDate(isDateOpen ? null : date)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-zinc-800/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20 
                                flex items-center justify-center shrink-0">
                  <span className="text-brand-yellow font-black text-sm">
                    {new Date(date + 'T12:00:00').getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm capitalize truncate">
                    {formatDateBR(date)}
                  </p>
                  <p className="text-zinc-500 text-xs">
                    {matches.length} jogo{matches.length !== 1 ? 's' : ''} · {dayStats.totalGoals} gols
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {dayStats.champion && (
                    <span className="text-xs bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 
                                     rounded-full px-2 py-0.5 font-bold hidden sm:block">
                      👑 {dayStats.champion}
                    </span>
                  )}
                  {isDateOpen ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                </div>
              </button>

              {/* Jogos da data */}
              {isDateOpen && (
                <div className="border-t border-zinc-800 divide-y divide-zinc-900">
                  {/* Classificação resumida */}
                  {dayStats.standings.length > 1 && (
                    <div className="px-4 py-3 bg-zinc-900/50">
                      <p className="text-xs text-zinc-600 font-semibold uppercase tracking-wider mb-2">Classificação</p>
                      <div className="flex gap-2 flex-wrap">
                        {dayStats.standings.map((t, i) => (
                          <div key={t.name} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold
                            ${i === 0 ? 'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20' : 'bg-zinc-800 text-zinc-400'}`}>
                            {i === 0 ? '👑' : i === 1 ? '🥈' : '🥉'} {t.name}
                            <span className={`ml-1 ${i === 0 ? 'text-brand-yellow' : 'text-zinc-600'}`}>{t.pts}pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {matches.map((match, idx) => {
                    const isMatchOpen = expandedMatch === match.id
                    const result = getResult(match)
                    let teams = { teamA: [], teamB: [] }
                    try {
                      const parsed = JSON.parse(match.teams_json)
                      const idxA = parsed.names?.indexOf(match.team_a_name)
                      const idxB = parsed.names?.indexOf(match.team_b_name)
                      if (idxA !== undefined && idxA >= 0) teams.teamA = parsed.teams[idxA] || []
                      if (idxB !== undefined && idxB >= 0) teams.teamB = parsed.teams[idxB] || []
                    } catch {}

                    return (
                      <div key={match.id}>
                        {/* Card do jogo */}
                        <button
                          onClick={() => setExpandedMatch(isMatchOpen ? null : match.id)}
                          className="w-full px-4 py-3 text-left hover:bg-zinc-800/20 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-600 text-xs w-12 shrink-0">Jogo {idx + 1}</span>

                            <div className="flex-1 flex items-center gap-2 min-w-0">
                              {/* Time A */}
                              <span className={`flex-1 text-right text-sm font-bold truncate ${
                                result.winner === match.team_a_name ? 'text-brand-yellow' : 'text-white'
                              }`}>
                                {match.team_a_name}
                              </span>

                              {/* Placar */}
                              <div className="flex items-center gap-1 shrink-0">
                                <span className={`text-lg font-black min-w-[1.5rem] text-right ${
                                  result.winner === match.team_a_name ? 'text-brand-yellow' :
                                  result.winner === null ? 'text-zinc-300' : 'text-zinc-500'
                                }`}>{match.score_a}</span>
                                <span className="text-zinc-700 font-black">×</span>
                                <span className={`text-lg font-black min-w-[1.5rem] ${
                                  result.winner === match.team_b_name ? 'text-brand-yellow' :
                                  result.winner === null ? 'text-zinc-300' : 'text-zinc-500'
                                }`}>{match.score_b}</span>
                              </div>

                              {/* Time B */}
                              <span className={`flex-1 text-sm font-bold truncate ${
                                result.winner === match.team_b_name ? 'text-brand-yellow' : 'text-white'
                              }`}>
                                {match.team_b_name}
                              </span>
                            </div>

                            {/* Badge resultado */}
                            <div className="shrink-0">
                              {result.winner
                                ? <Trophy size={13} className="text-brand-yellow" />
                                : <Minus size={13} className="text-zinc-600" />
                              }
                            </div>
                          </div>
                        </button>

                        {/* Jogadores expandidos */}
                        {isMatchOpen && (
                          <div className="px-4 pb-4 bg-zinc-900/30 border-t border-zinc-900">
                            <div className="grid grid-cols-2 gap-4 pt-3">
                              <MatchTeamList
                                name={match.team_a_name}
                                players={teams.teamA}
                                isWinner={result.winner === match.team_a_name}
                                score={match.score_a}
                              />
                              <MatchTeamList
                                name={match.team_b_name}
                                players={teams.teamB}
                                isWinner={result.winner === match.team_b_name}
                                score={match.score_b}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

function MatchTeamList({ name, players, isWinner, score }) {
  return (
    <div>
      <div className={`flex items-center justify-between mb-2 pb-1.5 border-b ${
        isWinner ? 'border-brand-yellow/30' : 'border-zinc-800'
      }`}>
        <p className={`text-xs font-black ${isWinner ? 'text-brand-yellow' : 'text-zinc-400'}`}>
          {isWinner ? '🏆 ' : ''}{name}
        </p>
        <span className={`text-lg font-black ${isWinner ? 'text-brand-yellow' : 'text-zinc-500'}`}>
          {score}
        </span>
      </div>
      {players.length === 0 ? (
        <p className="text-zinc-700 text-xs italic">Sem dados de jogadores</p>
      ) : (
        <div className="space-y-2">
          {players.map((p, i) => (
            <div key={`${p.id}-${i}`} className="flex items-center gap-2">
              <img
                src={p.photo_url}
                alt={p.name}
                className="w-8 h-8 rounded-full object-cover border border-zinc-700 shrink-0"
                onError={e => { e.target.style.display = 'none' }}
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white leading-tight truncate">
                  {p.name?.split(' ')[0]}
                </p>
                <p className="text-xs text-zinc-600">{p.position}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getResult(match) {
  if (match.score_a > match.score_b) return { winner: match.team_a_name }
  if (match.score_b > match.score_a) return { winner: match.team_b_name }
  return { winner: null }
}

function calcDayStats(matches) {
  const totalGoals = matches.reduce((s, m) => s + m.score_a + m.score_b, 0)

  // Pega todos os times únicos do dia
  const teamSet = new Set()
  matches.forEach(m => { teamSet.add(m.team_a_name); teamSet.add(m.team_b_name) })
  const teamNames = [...teamSet]

  const table = teamNames.reduce((acc, name) => {
    acc[name] = { name, pts: 0, gp: 0, gc: 0, v: 0 }
    return acc
  }, {})

  matches.forEach(m => {
    if (!table[m.team_a_name] || !table[m.team_b_name]) return
    const a = table[m.team_a_name]
    const b = table[m.team_b_name]
    a.gp += m.score_a; a.gc += m.score_b
    b.gp += m.score_b; b.gc += m.score_a
    if (m.score_a > m.score_b) { a.pts += 3; a.v++ }
    else if (m.score_b > m.score_a) { b.pts += 3; b.v++ }
    else { a.pts++; b.pts++ }
  })

  const standings = Object.values(table).sort((a, b) =>
    b.pts - a.pts || (b.gp - b.gc) - (a.gp - a.gc)
  )

  return {
    totalGoals,
    champion: standings[0]?.v > 0 ? standings[0]?.name : null,
    standings,
  }
}
