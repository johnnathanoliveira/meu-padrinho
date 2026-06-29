import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mapa nome inglês → português
const TEAM_MAP: Record<string, string> = {
  'Mexico': 'México',
  'South Africa': 'África do Sul',
  'Korea Republic': 'Coreia do Sul',
  'Czechia': 'Rep. Tcheca',
  'Canada': 'Canadá',
  'Bosnia and Herzegovina': 'Bósnia e Herz.',
  'United States': 'EUA',
  'USA': 'EUA',
  'Paraguay': 'Paraguai',
  'Qatar': 'Qatar',
  'Switzerland': 'Suíça',
  'Brazil': 'Brasil',
  'Morocco': 'Marrocos',
  'Scotland': 'Escócia',
  'Haiti': 'Haiti',
  'Australia': 'Austrália',
  'Türkiye': 'Turquia',
  'Turkey': 'Turquia',
  'Germany': 'Alemanha',
  'Curaçao': 'Curaçao',
  'Curacao': 'Curaçao',
  'Netherlands': 'Holanda',
  'Japan': 'Japão',
  "Côte d'Ivoire": 'Costa do Marfim',
  'Ivory Coast': 'Costa do Marfim',
  'Ecuador': 'Equador',
  'Sweden': 'Suécia',
  'Tunisia': 'Tunísia',
  'Spain': 'Espanha',
  'Cape Verde': 'Cabo Verde',
  'Belgium': 'Bélgica',
  'Egypt': 'Egito',
  'Saudi Arabia': 'Arábia Saudita',
  'Uruguay': 'Uruguai',
  'Iran': 'Irã',
  'New Zealand': 'Nova Zelândia',
  'France': 'França',
  'Senegal': 'Senegal',
  'Norway': 'Noruega',
  'Iraq': 'Iraque',
  'Argentina': 'Argentina',
  'Algeria': 'Argélia',
  'Austria': 'Áustria',
  'Jordan': 'Jordânia',
  'Portugal': 'Portugal',
  'DR Congo': 'Rep. Dem. Congo',
  'Congo DR': 'Rep. Dem. Congo',
  'Democratic Republic of Congo': 'Rep. Dem. Congo',
  'England': 'Inglaterra',
  'Croatia': 'Croácia',
  'Ghana': 'Gana',
  'Panama': 'Panamá',
  'Uzbekistan': 'Uzbequistão',
  'Colombia': 'Colômbia',
}

// Jogos do nosso sistema para fazer o match
const OUR_GAMES = [
  { id:'g001', date:'2026-06-11', home:'México', away:'África do Sul' },
  { id:'g002', date:'2026-06-11', home:'Coreia do Sul', away:'Rep. Tcheca' },
  { id:'g003', date:'2026-06-12', home:'Canadá', away:'Bósnia e Herz.' },
  { id:'g004', date:'2026-06-12', home:'EUA', away:'Paraguai' },
  { id:'g005', date:'2026-06-13', home:'Qatar', away:'Suíça' },
  { id:'g006', date:'2026-06-13', home:'Brasil', away:'Marrocos' },
  { id:'g007', date:'2026-06-13', home:'Escócia', away:'Haiti' },
  { id:'g008', date:'2026-06-14', home:'Austrália', away:'Turquia' },
  { id:'g009', date:'2026-06-14', home:'Alemanha', away:'Curaçao' },
  { id:'g010', date:'2026-06-14', home:'Holanda', away:'Japão' },
  { id:'g011', date:'2026-06-14', home:'Costa do Marfim', away:'Equador' },
  { id:'g012', date:'2026-06-14', home:'Suécia', away:'Tunísia' },
  { id:'g013', date:'2026-06-15', home:'Espanha', away:'Cabo Verde' },
  { id:'g014', date:'2026-06-15', home:'Bélgica', away:'Egito' },
  { id:'g015', date:'2026-06-15', home:'Arábia Saudita', away:'Uruguai' },
  { id:'g016', date:'2026-06-15', home:'Irã', away:'Nova Zelândia' },
  { id:'g017', date:'2026-06-16', home:'França', away:'Senegal' },
  { id:'g018', date:'2026-06-16', home:'Noruega', away:'Iraque' },
  { id:'g019', date:'2026-06-16', home:'Argentina', away:'Argélia' },
  { id:'g020', date:'2026-06-16', home:'Áustria', away:'Jordânia' },
  { id:'g021', date:'2026-06-17', home:'Portugal', away:'Rep. Dem. Congo' },
  { id:'g022', date:'2026-06-17', home:'Inglaterra', away:'Croácia' },
  { id:'g023', date:'2026-06-17', home:'Gana', away:'Panamá' },
  { id:'g024', date:'2026-06-17', home:'Uzbequistão', away:'Colômbia' },
  { id:'g025', date:'2026-06-18', home:'Rep. Tcheca', away:'África do Sul' },
  { id:'g026', date:'2026-06-18', home:'Suíça', away:'Bósnia e Herz.' },
  { id:'g027', date:'2026-06-18', home:'Canadá', away:'Qatar' },
  { id:'g028', date:'2026-06-18', home:'México', away:'Coreia do Sul' },
  { id:'g029', date:'2026-06-19', home:'EUA', away:'Austrália' },
  { id:'g030', date:'2026-06-19', home:'Escócia', away:'Marrocos' },
  { id:'g031', date:'2026-06-19', home:'Brasil', away:'Haiti' },
  { id:'g032', date:'2026-06-19', home:'Turquia', away:'Paraguai' },
  { id:'g033', date:'2026-06-20', home:'Holanda', away:'Suécia' },
  { id:'g034', date:'2026-06-20', home:'Alemanha', away:'Costa do Marfim' },
  { id:'g035', date:'2026-06-20', home:'Equador', away:'Curaçao' },
  { id:'g036', date:'2026-06-20', home:'Tunísia', away:'Japão' },
  { id:'g037', date:'2026-06-21', home:'Espanha', away:'Arábia Saudita' },
  { id:'g038', date:'2026-06-21', home:'Bélgica', away:'Irã' },
  { id:'g039', date:'2026-06-21', home:'Uruguai', away:'Cabo Verde' },
  { id:'g040', date:'2026-06-21', home:'Nova Zelândia', away:'Egito' },
  { id:'g041', date:'2026-06-22', home:'Argentina', away:'Áustria' },
  { id:'g042', date:'2026-06-22', home:'França', away:'Iraque' },
  { id:'g043', date:'2026-06-22', home:'Noruega', away:'Senegal' },
  { id:'g044', date:'2026-06-23', home:'Jordânia', away:'Argélia' },
  { id:'g045', date:'2026-06-23', home:'Portugal', away:'Uzbequistão' },
  { id:'g046', date:'2026-06-23', home:'Inglaterra', away:'Gana' },
  { id:'g047', date:'2026-06-23', home:'Panamá', away:'Croácia' },
  { id:'g048', date:'2026-06-23', home:'Colômbia', away:'Rep. Dem. Congo' },

  // 16 avos (Round of 32)
  { id:'r32_1',  date:'2026-06-28', home:'África do Sul',  away:'Canadá' },
  { id:'r32_2',  date:'2026-06-29', home:'Brasil',          away:'Japão' },
  { id:'r32_3',  date:'2026-06-29', home:'Alemanha',        away:'Paraguai' },
  { id:'r32_4',  date:'2026-06-29', home:'Holanda',         away:'Marrocos' },
  { id:'r32_5',  date:'2026-06-30', home:'Costa do Marfim', away:'Noruega' },
  { id:'r32_6',  date:'2026-06-30', home:'França',          away:'Suécia' },
  { id:'r32_7',  date:'2026-06-30', home:'México',          away:'Equador' },
  { id:'r32_8',  date:'2026-07-01', home:'Inglaterra',      away:'Rep. Dem. Congo' },
  { id:'r32_9',  date:'2026-07-01', home:'Bélgica',         away:'Senegal' },
  { id:'r32_10', date:'2026-07-01', home:'EUA',             away:'Bósnia e Herz.' },
  { id:'r32_11', date:'2026-07-02', home:'Espanha',         away:'Áustria' },
  { id:'r32_12', date:'2026-07-02', home:'Portugal',        away:'Croácia' },
  { id:'r32_13', date:'2026-07-03', home:'Suíça',           away:'Argélia' },
  { id:'r32_14', date:'2026-07-03', home:'Austrália',       away:'Egito' },
  { id:'r32_15', date:'2026-07-03', home:'Argentina',       away:'Cabo Verde' },
  { id:'r32_16', date:'2026-07-03', home:'Colômbia',        away:'Gana' },
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const apiKey = Deno.env.get('FOOTBALL_DATA_API_KEY')

  // Log para debug
  console.log('SUPABASE_URL present:', !!supabaseUrl)
  console.log('SERVICE_ROLE_KEY present:', !!supabaseKey)
  console.log('FOOTBALL_DATA_API_KEY present:', !!apiKey)

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Missing FOOTBALL_DATA_API_KEY secret. Add it in Supabase Edge Functions > Secrets.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Busca jogos da Copa 2026 — competition 2000 = FIFA World Cup
    const res = await fetch(
      'https://api.football-data.org/v4/competitions/2000/matches?season=2026',
      { headers: { 'X-Auth-Token': apiKey } }
    )

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`football-data.org: ${res.status} — ${body}`)
    }

    const data = await res.json()
    const matches = data.matches ?? []
    console.log(`Fetched ${matches.length} matches from API`)

    const upsertRows = []

    for (const match of matches) {
      const status = match.status
      // Só processa jogos finalizados ou em andamento
      if (!['FINISHED', 'IN_PLAY', 'PAUSED'].includes(status)) continue

      const homeScore = match.score?.fullTime?.home
      const awayScore = match.score?.fullTime?.away
      if (homeScore === null || homeScore === undefined) continue
      if (awayScore === null || awayScore === undefined) continue

      // Normaliza nomes
      const homePT = TEAM_MAP[match.homeTeam?.shortName]
        ?? TEAM_MAP[match.homeTeam?.name]
        ?? match.homeTeam?.name

      const awayPT = TEAM_MAP[match.awayTeam?.shortName]
        ?? TEAM_MAP[match.awayTeam?.name]
        ?? match.awayTeam?.name

      // Data UTC da API → converte para data local (BRT = UTC-3)
      const utcDate = match.utcDate ? new Date(match.utcDate) : null
      if (!utcDate) continue
      // Ajusta para BRT
      const brtDate = new Date(utcDate.getTime() - 3 * 60 * 60 * 1000)
      const matchDate = brtDate.toISOString().split('T')[0]

      // Tenta encontrar o jogo em nossa lista
      const ourGame = OUR_GAMES.find(g => {
        const dateMatch = g.date === matchDate
          || g.date === new Date(utcDate).toISOString().split('T')[0] // tenta UTC tbm
        const teamsMatch =
          (g.home === homePT && g.away === awayPT) ||
          (g.home === awayPT && g.away === homePT) // tenta invertido
        return dateMatch && teamsMatch
      })

      if (!ourGame) {
        console.log(`No match found for: ${homePT} vs ${awayPT} on ${matchDate}`)
        continue
      }

      // Ajusta home/away se a API retornou invertido
      let finalHome = homeScore
      let finalAway = awayScore
      if (ourGame.home === awayPT && ourGame.away === homePT) {
        finalHome = awayScore
        finalAway = homeScore
      }

      upsertRows.push({
        game_id: ourGame.id,
        home_score: finalHome,
        away_score: finalAway,
        updated_at: new Date().toISOString(),
      })
    }

    console.log(`Upserting ${upsertRows.length} scores`)

    if (upsertRows.length > 0) {
      const { error } = await supabase
        .from('bolao_scores')
        .upsert(upsertRows, { onConflict: 'game_id' })
      if (error) throw new Error(`Supabase upsert error: ${error.message}`)

      // Dispara recálculo do ranking automaticamente após atualizar placares
      supabase.functions.invoke('calc-ranking').catch(e =>
        console.warn('calc-ranking invoke error:', e)
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        updated: upsertRows.length,
        total_from_api: matches.length,
        games: upsertRows.map(r => `${r.game_id}: ${r.home_score}-${r.away_score}`),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('sync-scores error:', err)
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
