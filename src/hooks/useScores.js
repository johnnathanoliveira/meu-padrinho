import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { worldCupGames } from '../lib/worldCupGames'

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutos

export function useScores() {
  const [scores, setScores] = useState({}) // gameId -> { home, away }
  const [lastUpdated, setLastUpdated] = useState(null)
  const [secondsSince, setSecondsSince] = useState(0)

  const fetchScores = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bolao_scores')
        .select('game_id, home_score, away_score')

      if (!error && data && data.length > 0) {
        const map = {}
        data.forEach(s => {
          map[s.game_id] = { home: s.home_score, away: s.away_score }
        })
        setScores(map)
      }
    } catch (e) {
      // silencioso — usa dados locais como fallback
    }
    setLastUpdated(new Date())
    setSecondsSince(0)
  }, [])

  // Busca inicial
  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(fetchScores, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchScores])

  // Contador de segundos desde última atualização
  useEffect(() => {
    const ticker = setInterval(() => {
      setSecondsSince(s => s + 1)
    }, 1000)
    return () => clearInterval(ticker)
  }, [])

  // Mescla: placar do Supabase tem prioridade, senão usa o do arquivo local
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
    const mins = Math.floor(secondsSince / 60)
    return `Há ${mins} min`
  }

  const minutesUntilRefresh = Math.max(0, Math.floor((REFRESH_INTERVAL / 1000 - secondsSince) / 60))
  const secondsUntilRefresh = Math.max(0, (REFRESH_INTERVAL / 1000 - secondsSince) % 60)

  return {
    getScore,
    fetchScores,
    lastUpdated,
    formatLastUpdated,
    secondsSince,
    minutesUntilRefresh,
    secondsUntilRefresh,
  }
}
