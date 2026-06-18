import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Swords, Plus, Lock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
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

export default function JogosSection({ user, isAdmin }) {
  const [teams, setTeams] = useState([])
  const [teamNames, setTeamNames] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewMatch, setShowNewMatch] = useState(false)
  const [newMatch, setNewMatch] = useState({ teamA: '', teamB: '', scoreA: '', scoreB: '' })
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const mondayISO = getNextMonday().toISOString().split('T')[0]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)

    // Times do dia
    const { data: teamsData } = await supabase
      .from('pelada_teams')
      .select('*')
      .eq('pelada_date', mondayISO)
      .single()

    if (teamsData) {
      try {
        const parsed = JSON.parse(teamsData.teams_json)
        setTeams(parsed.teams || [])
        setTeamNames(parsed.names || [])
      } catch {}
    }

    // Jogos do dia
    const { data: matchData } = await supabase
      .from('pelada_matches')
      .select('*')
      .eq('pelada_date', mondayISO)
      .order('created_at')

    if (matchData) setMatches(matchData)
    setLoading(false)
  }

  const handleSaveMatch = async () => {
    if (!newMatch.teamA || !newMatch.teamB) {
      toast.error('Seleciona os dois times!')
      return
    }
    if (newMatch.teamA === newMatch.teamB) {
      toast.error('Os times precisam ser diferentes!')
      return
    }
    const scoreA = parseInt(newMatch.scoreA)
    const scoreB = parseInt(newMatch.scoreB)
    if (isNaN(scoreA) || isNaN(scoreB) || scoreA < 0 || scoreB < 0) {
      toast.error('Preenche o placar!')
      return
    }

    setSaving(true)
    const { error } = await supabase.from('pelada_matches').insert({
      pelada_date: mondayISO,
      team_a_name: newMatch.teamA,
      team_b_name: newMatch.teamB,
      score_a: scoreA,
      score_b: scoreB,
      teams_json: JSON.stringify({ teams, names: teamNames }),
    })

    if (!error) {
      toast.success('Jogo registrado! ⚽')
      setNewMatch({ teamA: '', teamB: '', scoreA: '', scoreB: '' })
      setShowNewMatch(false)
      loadData()
    } else {
      toast.error('Erro ao salvar!')
    }
    setSaving(false)
  }

  const handleDeleteMatch = async (id) => {
    await supabase.from('pelada_matches').delete().eq('id', id)
    toast.success('Jogo removido')
    loadData()
  }

  const handleUpdateScore = async (match) => {
    const scoreA = parseInt(match.score_a)
    const scoreB = parseInt(match.score_b)
    await supabase
      .from('pelada_matches')
      .update({ score_a: scoreA, score_b: scoreB })
      .eq('id', match.id)
    toast.success('Placar atualizado!')
    loadData()
  }

  // Obtém jogadores de um time pelo nome
  const getTeamPlayers = (teamName) => {
    const idx = teamNames.indexOf(teamName)
    if (idx === -1 || !teams[idx]) return []
    return teams[idx]
  }

  const getResult = (match) => {
    if (match.score_a > match.score_b) return { winner: match.team_a_name, label: match.team_a_name }
    if (match.score_b > match.score_a) return { winner: match.team_b_name, label: match.team_b_name }
    return { winner: null, label: 'Empate' }
  }

  if (loading) return <div className="p-4 text-zinc-500 text-center pt-12">Carregando...</div>

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="text-brand-yellow" size={18} />
            <h2 className="font-black text-white">Jogos do Dia</h2>
          </div>
          {isAdmin && teamNames.length > 0 && (
            <button
              onClick={() => setShowNewMatch(true)}
              className="flex items-center gap-1.5 text-xs bg-brand-yellow/10 text-brand-yellow 
                         border border-brand-yellow/30 rounded-xl px-3 py-1.5 font-bold hover:bg-brand-yellow/20"
            >
              <Plus size={14} /> Novo jogo
            </button>
          )}
        </div>
        {teamNames.length === 0 && (
          <p className="text-zinc-600 text-sm mt-2">
            Faça o sorteio primeiro para registrar os jogos
          </p>
        )}
      </div>

      {/* Formulário novo jogo */}
      {showNewMatch && isAdmin && (
        <div className="card border-brand-yellow/30 space-y-4">
          <h3 className="font-bold text-white">Registrar Jogo</h3>

          {/* Seleção de times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Time A</label>
              <select
                value={newMatch.teamA}
                onChange={e => setNewMatch(p => ({ ...p, teamA: e.target.value }))}
                className="input-field text-sm"
              >
                <option value="">Selecionar...</option>
                {teamNames.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Time B</label>
              <select
                value={newMatch.teamB}
                onChange={e => setNewMatch(p => ({ ...p, teamB: e.target.value }))}
                className="input-field text-sm"
              >
                <option value="">Selecionar...</option>
                {teamNames.filter(n => n !== newMatch.teamA).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Placar */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Placar</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center">
                <p className="text-xs text-zinc-500 mb-1 truncate">{newMatch.teamA || 'Time A'}</p>
                <input
                  type="number" min="0" max="99"
                  value={newMatch.scoreA}
                  onChange={e => setNewMatch(p => ({ ...p, scoreA: e.target.value }))}
                  className="w-full h-14 text-center text-2xl font-black bg-zinc-800 border border-zinc-700 
                             rounded-xl text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>
              <span className="text-zinc-500 font-black text-xl">×</span>
              <div className="flex-1 text-center">
                <p className="text-xs text-zinc-500 mb-1 truncate">{newMatch.teamB || 'Time B'}</p>
                <input
                  type="number" min="0" max="99"
                  value={newMatch.scoreB}
                  onChange={e => setNewMatch(p => ({ ...p, scoreB: e.target.value }))}
                  className="w-full h-14 text-center text-2xl font-black bg-zinc-800 border border-zinc-700 
                             rounded-xl text-white focus:outline-none focus:border-brand-yellow"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setShowNewMatch(false); setNewMatch({ teamA: '', teamB: '', scoreA: '', scoreB: '' }) }}
              className="btn-secondary flex-1 py-2.5 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveMatch}
              disabled={saving}
              className="btn-primary flex-1 py-2.5 text-sm"
            >
              {saving ? '...' : 'Salvar Jogo'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de jogos */}
      {matches.length === 0 ? (
        <div className="card text-center text-zinc-600 py-8">
          {isAdmin
            ? 'Nenhum jogo registrado ainda. Clique em "Novo jogo".'
            : 'Nenhum jogo registrado ainda.'}
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match, idx) => {
            const result = getResult(match)
            const isExpanded = expanded === match.id
            const playersA = getTeamPlayers(match.team_a_name)
            const playersB = getTeamPlayers(match.team_b_name)

            return (
              <div key={match.id} className="card">
                {/* Cabeçalho do jogo */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-zinc-600 font-semibold">Jogo {idx + 1}</span>
                  {result.winner ? (
                    <span className="text-xs bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 rounded-full px-2 py-0.5 font-bold ml-auto">
                      🏆 {result.winner}
                    </span>
                  ) : (
                    <span className="text-xs bg-zinc-800 text-zinc-400 rounded-full px-2 py-0.5 font-bold ml-auto">
                      🤝 Empate
                    </span>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteMatch(match.id)}
                      className="text-zinc-700 hover:text-red-400 transition-colors ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Placar */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 text-center">
                    <p className={`font-black text-sm leading-tight ${result.winner === match.team_a_name ? 'text-brand-yellow' : 'text-white'}`}>
                      {match.team_a_name}
                    </p>
                  </div>

                  {isAdmin ? (
                    // Admin pode editar placar inline
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number" min="0" max="99"
                        defaultValue={match.score_a}
                        onChange={e => match.score_a = parseInt(e.target.value)}
                        className="w-10 h-10 text-center text-lg font-black bg-zinc-800 border border-zinc-700 
                                   rounded-lg text-white focus:outline-none focus:border-brand-yellow"
                      />
                      <span className="text-zinc-500 font-black">×</span>
                      <input
                        type="number" min="0" max="99"
                        defaultValue={match.score_b}
                        onChange={e => match.score_b = parseInt(e.target.value)}
                        className="w-10 h-10 text-center text-lg font-black bg-zinc-800 border border-zinc-700 
                                   rounded-lg text-white focus:outline-none focus:border-brand-yellow"
                      />
                      <button
                        onClick={() => handleUpdateScore(match)}
                        className="text-xs bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 
                                   rounded-lg px-2 py-1 font-bold"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div className="shrink-0">
                      <span className="text-white font-black text-2xl">
                        {match.score_a} × {match.score_b}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 text-center">
                    <p className={`font-black text-sm leading-tight ${result.winner === match.team_b_name ? 'text-brand-yellow' : 'text-white'}`}>
                      {match.team_b_name}
                    </p>
                  </div>
                </div>

                {/* Expandir jogadores */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : match.id)}
                  className="w-full flex items-center justify-center gap-1 text-xs text-zinc-600 
                             hover:text-zinc-400 transition-colors pt-1 border-t border-zinc-800 mt-1"
                >
                  {isExpanded ? <><ChevronUp size={13} /> Ocultar jogadores</> : <><ChevronDown size={13} /> Ver jogadores</>}
                </button>

                {isExpanded && (
                  <div className="mt-3 grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
                    <TeamPlayerList name={match.team_a_name} players={playersA} isWinner={result.winner === match.team_a_name} />
                    <TeamPlayerList name={match.team_b_name} players={playersB} isWinner={result.winner === match.team_b_name} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Placar geral do dia */}
      {matches.length > 0 && teamNames.length > 0 && (
        <DayStandings matches={matches} teamNames={teamNames} />
      )}
    </div>
  )
}

function TeamPlayerList({ name, players, isWinner }) {
  return (
    <div>
      <p className={`text-xs font-black mb-2 ${isWinner ? 'text-brand-yellow' : 'text-zinc-400'}`}>
        {isWinner ? '🏆 ' : ''}{name}
      </p>
      {players.length === 0 ? (
        <p className="text-zinc-700 text-xs">Sem dados</p>
      ) : (
        <div className="space-y-1.5">
          {players.map(p => (
            <div key={p.id} className="flex items-center gap-2">
              <img src={p.photo_url} alt={p.name}
                className="w-7 h-7 rounded-full object-cover border border-zinc-700 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white leading-tight">{p.name?.split(' ')[0]}</p>
                <p className="text-xs text-zinc-600">{p.position}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DayStandings({ matches, teamNames }) {
  // Calcula pontos: vitória=3, empate=1, derrota=0
  const standings = teamNames.reduce((acc, name) => {
    acc[name] = { name, v: 0, e: 0, d: 0, gp: 0, gc: 0, pts: 0 }
    return acc
  }, {})

  matches.forEach(m => {
    if (!standings[m.team_a_name] || !standings[m.team_b_name]) return
    const a = standings[m.team_a_name]
    const b = standings[m.team_b_name]
    a.gp += m.score_a; a.gc += m.score_b
    b.gp += m.score_b; b.gc += m.score_a
    if (m.score_a > m.score_b) { a.v++; a.pts += 3; b.d++ }
    else if (m.score_b > m.score_a) { b.v++; b.pts += 3; a.d++ }
    else { a.e++; a.pts++; b.e++; b.pts++ }
  })

  const sorted = Object.values(standings).sort((a, b) =>
    b.pts - a.pts || (b.gp - b.gc) - (a.gp - a.gc) || b.gp - a.gp
  )

  return (
    <div className="card">
      <h3 className="font-bold text-white text-sm mb-3">Classificação do Dia</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-zinc-600 border-b border-zinc-800">
            <th className="text-left pb-2">Time</th>
            <th className="text-center pb-2">V</th>
            <th className="text-center pb-2">E</th>
            <th className="text-center pb-2">D</th>
            <th className="text-center pb-2">GS</th>
            <th className="text-center pb-2 text-brand-yellow">Pts</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => (
            <tr key={t.name} className={`border-b border-zinc-900 ${i === 0 ? 'text-brand-yellow' : 'text-white'}`}>
              <td className="py-2 font-bold">
                {i === 0 ? '👑 ' : ''}{t.name}
              </td>
              <td className="text-center py-2 text-green-400">{t.v}</td>
              <td className="text-center py-2 text-zinc-500">{t.e}</td>
              <td className="text-center py-2 text-red-400">{t.d}</td>
              <td className="text-center py-2 text-zinc-400">{t.gp}-{t.gc}</td>
              <td className="text-center py-2 font-black">{t.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
