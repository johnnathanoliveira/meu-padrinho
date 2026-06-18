import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { worldCupGames } from '../lib/worldCupGames'

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutos

export function useScores() {
  const [scores, setScores] = useState({})       // gameId -> { home, away }
  const [lastUpdated, setLastUpdated] = useState(null)
  const [secondsSince, setSecondsSince] = useState(0)
  const [syncing, setSyncing] = useState(false)

  // 1. Chama a Edge Function para buscar placares da API externa e gravar no Supabase
  const syncFromAPI = useCallback(async () => {
    setSyncing(true)
    try {
      const { data, error } = await supabase.functions.invoke('sync-scores')
      if (error) console.warn('sync-scores error:', error)
    } catch (e) {
      console.warn('sync-scores fetch error:', e)
    } finally {
      setSyncing(false)
    }
  }, [])

  // 2. Lê os placares já salvos no Supabase (tabela bolao_scores)
  const fetchScores = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bolao_scores')
        .select('game_id, home_score, away_score')

      if (!error && data && data.length > 0) {
        const map = {}
        data.forEach(s => { map[s.game_id] = { home: s.home_score, away: s.away_score } })
        setScores(map)
      }
    } catch (e) {
      // silencioso — usa dados locais como fallback
    }
    setLastUpdated(new Date())
    setSecondsSince(0)
  }, [])

  // 3. Ciclo completo: sincroniza da API externa → recalcula ranking → lê do Supabase
  const refresh = useCallback(async () => {
    await syncFromAPI()
    // Recalcula ranking em paralelo
    supabase.functions.invoke('calc-ranking').catch(() => {})
    await fetchScores()
  }, [syncFromAPI, fetchScores])

  // Inicializa: lê do banco imediatamente, depois sincroniza da API
  useEffect(() => {
    fetchScores()
    syncFromAPI().then(fetchScores)
  }, [])

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(refresh, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [refresh])

  // Contador de segundos
  useEffect(() => {
    const ticker = setInterval(() => setSecondsSince(s => s + 1), 1000)
    return () => clearInterval(ticker)
  }, [])

  // Retorna placar: prioriza Supabase, fallback para dados locais
  const getScore = (gameId) => {
    if (scores[gameId]) return scores[gameId]
    const game = worldCupGames.find(g => g.id === gameId)
    if (game && game.homeScore !== null) {
      return { home: game.homeScore, away: game.awayScore }
    }
    return null
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Carregando...'
    if (secondsSince < 60) return 'Agora mesmo'
    return `Há ${Math.floor(secondsSince / 60)} min`
  }

  const minutesUntilRefresh = Math.max(0, Math.floor((REFRESH_INTERVAL / 1000 - secondsSince) / 60))

  return {
    getScore,
    refresh,       // chamado pelo botão manual
    syncing,
    lastUpdated,
    formatLastUpdated,
    secondsSince,
    minutesUntilRefresh,
  }
}
