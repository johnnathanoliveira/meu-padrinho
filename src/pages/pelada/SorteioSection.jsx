import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Shuffle, RefreshCw, Lock, UserMinus, UserPlus, ArrowLeftRight, Edit3, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const CLUB_NAMES = [
  'Barcelona', 'Real Madrid', 'Manchester City', 'Bayern Munich', 'PSG',
  'Liverpool', 'Chelsea', 'Arsenal', 'Juventus', 'Inter Milan',
  'Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Santos',
  'Boca Juniors', 'River Plate', 'Atlético MG', 'Internacional', 'Grêmio',
  'Ajax', 'Porto', 'Benfica', 'Sporting', 'Borussia Dortmund',
  'AC Milan', 'Roma', 'Napoli', 'Valencia', 'Sevilla',
]

const POSITION_ORDER = { 'Goleiro': 0, 'Fixo': 1, 'Ala': 2, 'Pivô': 3, 'Atacante': 4, 'Qualquer': 5 }

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeTeams(players, numTeams = 2) {
  const byPos = [...players].sort((a, b) =>
    (POSITION_ORDER[a.position] ?? 5) - (POSITION_ORDER[b.position] ?? 5)
  )
  const teams = Array.from({ length: numTeams }, () => [])
  byPos.forEach((player, i) => teams[i % numTeams].push(player))
  return teams
}

function getNextMonday() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 1 ? 0 : (8 - day) % 7 || 7
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

export default function SorteioSection({ user, isAdmin }) {
  const [confirmedPlayers, setConfirmedPlayers] = useState([])
  const [teams, setTeams] = useState([])        // array de arrays de jogadores
  const [teamNames, setTeamNames] = useState([]) // nomes dos times
  const [numTeams, setNumTeams] = useState(2)
  const [savedTeams, setSavedTeams] = useState(null)
  const [loading, setLoading] = useState(true)

  // Edição de times
  const [editMode, setEditMode] = useState(false)
  const [moving, setMoving] = useState(null) // { player, fromTeamIdx }
  const [editingName, setEditingName] = useState(null) // índice do nome sendo editado
  const [nameInput, setNameInput] = useState('')

  const mondayISO = getNextMonday().toISOString().split('T')[0]

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: checkins } = await supabase
      .from('pelada_checkins')
      .select('*, pelada_users(id, name, photo_url, position)')
      .eq('pelada_date', mondayISO)
      .eq('going', true)
    if (checkins) setConfirmedPlayers(checkins.map(c => c.pelada_users).filter(Boolean))

    const { data: saved } = await supabase
      .from('pelada_teams').select('*').eq('pelada_date', mondayISO).single()
    if (saved) {
      setSavedTeams(saved)
      try {
        const p = JSON.parse(saved.teams_json)
        setTeams(p.teams); setTeamNames(p.names)
      } catch {}
    }
    setLoading(false)
  }

  const handleSortear = () => {
    if (confirmedPlayers.length < numTeams) {
      toast.error(`Precisa de pelo menos ${numTeams} jogadores confirmados!`); return
    }
    setTeams(makeTeams(shuffleArray(confirmedPlayers), numTeams))
    setTeamNames(shuffleArray(CLUB_NAMES).slice(0, numTeams))
    setEditMode(false)
    setMoving(null)
  }

  const handleSalvarTimes = async () => {
    if (teams.length === 0) return
    const { error } = await supabase.from('pelada_teams').upsert(
      { id: savedTeams?.id, pelada_date: mondayISO, teams_json: JSON.stringify({ teams, names: teamNames }) },
      { onConflict: 'pelada_date' }
    )
    if (!error) { toast.success('Times salvos! ⚽'); setEditMode(false); setMoving(null); loadData() }
    else toast.error('Erro ao salvar times!')
  }

  // ── Mover jogador entre times ──────────────────────────────
  const handleSelectPlayerToMove = (player, fromTeamIdx) => {
    if (moving?.player.id === player.id) { setMoving(null); return }
    setMoving({ player, fromTeamIdx })
    toast('Agora toque em outro time para mover', { icon: '👉' })
  }

  const handleMoveToTeam = (toTeamIdx) => {
    if (!moving) return
    if (moving.fromTeamIdx === toTeamIdx) { setMoving(null); return }

    const newTeams = teams.map(t => [...t])
    // Remove do time de origem
    newTeams[moving.fromTeamIdx] = newTeams[moving.fromTeamIdx].filter(p => p.id !== moving.player.id)
    // Adiciona no destino
    newTeams[toTeamIdx] = [...newTeams[toTeamIdx], moving.player]
    setTeams(newTeams)
    setMoving(null)
    toast.success(`${moving.player.name?.split(' ')[0]} movido para ${teamNames[toTeamIdx]}!`)
  }

  // ── Renomear time ──────────────────────────────────────────
  const startEditName = (idx) => { setEditingName(idx); setNameInput(teamNames[idx]) }
  const saveEditName = (idx) => {
    if (!nameInput.trim()) return
    const newNames = [...teamNames]; newNames[idx] = nameInput.trim()
    setTeamNames(newNames); setEditingName(null)
  }

  if (loading) return <div className="p-4 text-zinc-500 text-center pt-12">Carregando...</div>

  return (
    <div className="p-4 space-y-4">
      {/* Info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <Shuffle className="text-brand-yellow" size={18} />
          <h2 className="font-black text-white">Sorteio de Times</h2>
        </div>
        <p className="text-zinc-500 text-sm">
          {confirmedPlayers.length} jogador{confirmedPlayers.length !== 1 ? 'es' : ''} confirmado{confirmedPlayers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Controles admin */}
      {isAdmin ? (
        <div className="card space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 block mb-2">Número de times</label>
            <div className="flex gap-2">
              {[2, 3, 4].map(n => (
                <button key={n} onClick={() => setNumTeams(n)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${numTeams === n ? 'bg-brand-yellow text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                  {n} times
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSortear} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Shuffle size={18} /> Sortear
            </button>
            {teams.length > 0 && (
              <button onClick={handleSortear} className="bg-zinc-800 text-zinc-300 px-4 rounded-xl hover:text-white transition-colors" title="Re-sortear">
                <RefreshCw size={18} />
              </button>
            )}
          </div>

          {teams.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => { setEditMode(!editMode); setMoving(null) }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${editMode ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'bg-zinc-800 text-zinc-300 hover:text-white'}`}>
                <ArrowLeftRight size={15} />
                {editMode ? 'Sair da edição' : 'Ajustar times'}
              </button>
              <button onClick={handleSalvarTimes} className="btn-primary flex-1 py-2.5 text-sm">
                Publicar para todos
              </button>
            </div>
          )}

          {editMode && (
            <div className="bg-orange-900/20 border border-orange-800/40 rounded-xl p-3 text-xs text-orange-300">
              <p className="font-bold mb-1">Modo edição ativo</p>
              <p>• Toque num jogador para selecioná-lo</p>
              <p>• Toque no header do outro time para movê-lo</p>
              <p>• Toque no nome do time para renomear ✏️</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center">
          <Lock size={20} className="text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">Sorteio feito pelo admin</p>
        </div>
      )}

      {/* Times */}
      {teams.length > 0 && (
        <div className="space-y-3">
          {teams.map((team, i) => {
            const isTargetTeam = editMode && moving && moving.fromTeamIdx !== i
            const isSourceTeam = editMode && moving && moving.fromTeamIdx === i

            return (
              <div key={i} className={`card border-l-4 transition-all ${
                isTargetTeam ? 'border-brand-yellow bg-brand-yellow/5 cursor-pointer' :
                isSourceTeam ? 'border-orange-500' :
                'border-brand-yellow/60'
              }`}>
                {/* Header do time */}
                <div
                  className="flex items-center gap-2 mb-3"
                  onClick={() => isTargetTeam && handleMoveToTeam(i)}
                >
                  <span className="text-xl">⚽</span>

                  {/* Nome editável */}
                  {editMode && editingName === i ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        autoFocus
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveEditName(i)}
                        className="input-field text-sm py-1 flex-1"
                        maxLength={20}
                        onClick={e => e.stopPropagation()}
                      />
                      <button onClick={(e) => { e.stopPropagation(); saveEditName(i) }} className="text-green-400">
                        <Check size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <h3 className={`font-black text-lg ${isTargetTeam ? 'text-brand-yellow' : 'text-brand-yellow'}`}>
                        {teamNames[i]}
                      </h3>
                      {editMode && (
                        <button onClick={(e) => { e.stopPropagation(); startEditName(i) }}
                          className="text-zinc-600 hover:text-zinc-300">
                          <Edit3 size={13} />
                        </button>
                      )}
                    </div>
                  )}

                  <span className="text-zinc-600 text-sm ml-auto shrink-0">{team.length} jog.</span>

                  {isTargetTeam && (
                    <span className="text-xs text-brand-yellow font-bold animate-pulse">Mover aqui →</span>
                  )}
                </div>

                {/* Jogadores */}
                <div className="grid grid-cols-2 gap-2">
                  {team.map(player => {
                    const isSelected = moving?.player.id === player.id
                    return (
                      <div
                        key={player.id}
                        onClick={() => editMode && handleSelectPlayerToMove(player, i)}
                        className={`flex items-center gap-2 rounded-xl p-2 transition-all ${
                          editMode ? 'cursor-pointer' : ''
                        } ${
                          isSelected
                            ? 'bg-orange-500/20 border border-orange-500/60'
                            : editMode
                              ? 'bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700'
                              : 'bg-zinc-800/50'
                        }`}
                      >
                        <img src={player.photo_url} alt={player.name}
                          className="w-9 h-9 rounded-full object-cover border border-zinc-700 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white leading-tight truncate">
                            {player.name?.split(' ')[0]}
                          </p>
                          <p className="text-xs text-zinc-600">{player.position}</p>
                        </div>
                        {isSelected && <span className="ml-auto text-orange-400 shrink-0">●</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Sem times ainda */}
      {(!teams.length && savedTeams) && (
        <div className="card text-center text-zinc-500 text-sm py-4">Aguardando sorteio pelo admin</div>
      )}

      {/* Jogadores confirmados */}
      <div className="card">
        <h3 className="font-bold text-white text-sm mb-3">Jogadores disponíveis</h3>
        <div className="space-y-2">
          {confirmedPlayers.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <img src={p.photo_url} alt={p.name} className="w-9 h-9 rounded-full object-cover border border-zinc-700" />
              <div>
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="text-xs text-zinc-500">{p.position}</p>
              </div>
            </div>
          ))}
          {confirmedPlayers.length === 0 && (
            <p className="text-zinc-600 text-sm text-center py-2">Nenhum confirmado ainda</p>
          )}
        </div>
      </div>
    </div>
  )
}
