// Supabase Edge Function: calc-ranking
// Calcula pontuação do bolão comparando palpites com placares reais
// Regras: acertar resultado = 1pt | acertar placar exato = 2pts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function calcPoints(
  predHome: number, predAway: number,
  realHome: number, realAway: number
): { points: number; exact: boolean } {
  // Placar exato = 2 pontos
  if (predHome === realHome && predAway === realAway) {
    return { points: 2, exact: true }
  }
  // Acertou só o resultado (vitória/empate/derrota) = 1 ponto
  const predResult = Math.sign(predHome - predAway) // -1, 0, 1
  const realResult = Math.sign(realHome - realAway)
  if (predResult === realResult) {
    return { points: 1, exact: false }
  }
  return { points: 0, exact: false }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ error: 'Missing env vars' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Busca todos os placares reais disponíveis
    const { data: scores, error: scoresErr } = await supabase
      .from('bolao_scores')
      .select('game_id, home_score, away_score')

    if (scoresErr) throw new Error(`Scores error: ${scoresErr.message}`)
    if (!scores || scores.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No scores yet', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mapeia game_id -> placar real
    const scoreMap: Record<string, { home: number; away: number }> = {}
    scores.forEach(s => { scoreMap[s.game_id] = { home: s.home_score, away: s.away_score } })

    // 2. Busca todos os palpites com dados do usuário
    const { data: predictions, error: predErr } = await supabase
      .from('bolao_predictions')
      .select('user_id, game_id, home_score, away_score')

    if (predErr) throw new Error(`Predictions error: ${predErr.message}`)
    if (!predictions || predictions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No predictions yet', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Calcula pontos por usuário
    const userPoints: Record<string, { points: number; exact_scores: number }> = {}

    for (const pred of predictions) {
      const real = scoreMap[pred.game_id]
      if (!real) continue // jogo ainda não tem placar

      const { points, exact } = calcPoints(
        pred.home_score, pred.away_score,
        real.home, real.away
      )

      if (!userPoints[pred.user_id]) {
        userPoints[pred.user_id] = { points: 0, exact_scores: 0 }
      }
      userPoints[pred.user_id].points += points
      if (exact) userPoints[pred.user_id].exact_scores += 1
    }

    // 4. Busca dados dos usuários (nome e foto)
    const userIds = Object.keys(userPoints)
    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No scored predictions', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: users, error: usersErr } = await supabase
      .from('bolao_users')
      .select('id, name, photo_url')
      .in('id', userIds)

    if (usersErr) throw new Error(`Users error: ${usersErr.message}`)

    const userMap: Record<string, { name: string; photo_url: string }> = {}
    users?.forEach(u => { userMap[u.id] = { name: u.name, photo_url: u.photo_url } })

    // 5. Monta rows para upsert
    const rankingRows = userIds
      .filter(uid => userMap[uid])
      .map(uid => ({
        user_id: uid,
        name: userMap[uid].name,
        photo_url: userMap[uid].photo_url,
        points: userPoints[uid].points,
        exact_scores: userPoints[uid].exact_scores,
        updated_at: new Date().toISOString(),
      }))

    console.log(`Upserting ${rankingRows.length} ranking rows`)

    // 6. Salva no ranking
    const { error: rankErr } = await supabase
      .from('bolao_ranking')
      .upsert(rankingRows, { onConflict: 'user_id' })

    if (rankErr) throw new Error(`Ranking upsert error: ${rankErr.message}`)

    return new Response(
      JSON.stringify({
        success: true,
        updated: rankingRows.length,
        top3: rankingRows
          .sort((a, b) => b.points - a.points)
          .slice(0, 3)
          .map(r => `${r.name}: ${r.points}pts (${r.exact_scores} exatos)`),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('calc-ranking error:', err)
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
