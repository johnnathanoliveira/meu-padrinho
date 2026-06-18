// Copa do Mundo 2026 — Calendário oficial
// Fonte: Yahoo Sports / FIFA (horários em ET, convertidos para BRT = ET+1h)
// Bandeiras via flagcdn.com

const flag = (code) => `https://flagcdn.com/w80/${code}.png`

export const worldCupGames = [
  // ── 11 Jun (Qui) ───────────────────────────────────────────
  { id:'g001', date:'2026-06-11', time:'20:00', home:'México',           away:'África do Sul',    group:'A', phase:'Grupo', homeFlag:flag('mx'),     awayFlag:flag('za'),     homeScore:2,    awayScore:0 },
  { id:'g002', date:'2026-06-11', time:'23:00', home:'Coreia do Sul',    away:'Rep. Tcheca',      group:'A', phase:'Grupo', homeFlag:flag('kr'),     awayFlag:flag('cz'),     homeScore:2,    awayScore:1 },

  // ── 12 Jun (Sex) ───────────────────────────────────────────
  { id:'g003', date:'2026-06-12', time:'13:00', home:'Canadá',           away:'Bósnia e Herz.',   group:'B', phase:'Grupo', homeFlag:flag('ca'),     awayFlag:flag('ba'),     homeScore:1,    awayScore:1 },
  { id:'g004', date:'2026-06-12', time:'16:00', home:'EUA',              away:'Paraguai',         group:'D', phase:'Grupo', homeFlag:flag('us'),     awayFlag:flag('py'),     homeScore:4,    awayScore:1 },

  // ── 13 Jun (Sáb) ───────────────────────────────────────────
  { id:'g005', date:'2026-06-13', time:'13:00', home:'Qatar',            away:'Suíça',            group:'B', phase:'Grupo', homeFlag:flag('qa'),     awayFlag:flag('ch'),     homeScore:1,    awayScore:1 },
  { id:'g006', date:'2026-06-13', time:'14:00', home:'Brasil',           away:'Marrocos',         group:'C', phase:'Grupo', homeFlag:flag('br'),     awayFlag:flag('ma'),     homeScore:1,    awayScore:1 },
  { id:'g007', date:'2026-06-13', time:'14:00', home:'Escócia',          away:'Haiti',            group:'C', phase:'Grupo', homeFlag:flag('gb-sct'), awayFlag:flag('ht'),     homeScore:1,    awayScore:1 },

  // ── 14 Jun (Dom) ───────────────────────────────────────────
  { id:'g008', date:'2026-06-14', time:'13:00', home:'Austrália',        away:'Turquia',          group:'D', phase:'Grupo', homeFlag:flag('au'),     awayFlag:flag('tr'),     homeScore:2,    awayScore:0 },
  { id:'g009', date:'2026-06-14', time:'16:00', home:'Alemanha',         away:'Curaçao',          group:'E', phase:'Grupo', homeFlag:flag('de'),     awayFlag:flag('cw'),     homeScore:7,    awayScore:1 },
  { id:'g010', date:'2026-06-14', time:'16:00', home:'Holanda',          away:'Japão',            group:'F', phase:'Grupo', homeFlag:flag('nl'),     awayFlag:flag('jp'),     homeScore:2,    awayScore:2 },
  { id:'g011', date:'2026-06-14', time:'19:00', home:'Costa do Marfim',  away:'Equador',          group:'E', phase:'Grupo', homeFlag:flag('ci'),     awayFlag:flag('ec'),     homeScore:1,    awayScore:0 },
  { id:'g012', date:'2026-06-14', time:'19:00', home:'Suécia',           away:'Tunísia',          group:'F', phase:'Grupo', homeFlag:flag('se'),     awayFlag:flag('tn'),     homeScore:5,    awayScore:1 },

  // ── 15 Jun (Seg) ───────────────────────────────────────────
  { id:'g013', date:'2026-06-15', time:'13:00', home:'Espanha',          away:'Cabo Verde',       group:'H', phase:'Grupo', homeFlag:flag('es'),     awayFlag:flag('cv'),     homeScore:0,    awayScore:0 },
  { id:'g014', date:'2026-06-15', time:'16:00', home:'Bélgica',          away:'Egito',            group:'G', phase:'Grupo', homeFlag:flag('be'),     awayFlag:flag('eg'),     homeScore:1,    awayScore:1 },
  { id:'g015', date:'2026-06-15', time:'19:00', home:'Arábia Saudita',   away:'Uruguai',          group:'H', phase:'Grupo', homeFlag:flag('sa'),     awayFlag:flag('uy'),     homeScore:1,    awayScore:1 },
  { id:'g016', date:'2026-06-15', time:'22:00', home:'Irã',              away:'Nova Zelândia',    group:'G', phase:'Grupo', homeFlag:flag('ir'),     awayFlag:flag('nz'),     homeScore:2,    awayScore:2 },

  // ── 16 Jun (Ter) ───────────────────────────────────────────
  { id:'g017', date:'2026-06-16', time:'14:00', home:'França',           away:'Senegal',          group:'I', phase:'Grupo', homeFlag:flag('fr'),     awayFlag:flag('sn'),     homeScore:3,    awayScore:1 },
  { id:'g018', date:'2026-06-16', time:'14:00', home:'Noruega',          away:'Iraque',           group:'I', phase:'Grupo', homeFlag:flag('no'),     awayFlag:flag('iq'),     homeScore:4,    awayScore:1 },
  { id:'g019', date:'2026-06-16', time:'17:00', home:'Argentina',        away:'Argélia',          group:'J', phase:'Grupo', homeFlag:flag('ar'),     awayFlag:flag('dz'),     homeScore:3,    awayScore:0 },
  { id:'g020', date:'2026-06-16', time:'20:00', home:'Áustria',          away:'Jordânia',         group:'J', phase:'Grupo', homeFlag:flag('at'),     awayFlag:flag('jo'),     homeScore:3,    awayScore:1 },

  // ── 17 Jun (Qua) ───────────────────────────────────────────
  // Portugal 19:00 ET → não, a fonte diz "Portugal vs DR Congo" no dia 17 sem hora específica
  // mas a busca confirmou: Portugal jogo foi à tarde nos EUA
  // Yahoo diz apenas "Portugal 1, DR Congo 1" no dia 17 sem horário listado separado
  // Mas a NBC Sports confirma kickoff no dia como jogo da tarde
  // USA Today: "Wednesday afternoon" → 12pm ET = 13:00 BRT (mais provável para Houston)
  { id:'g021', date:'2026-06-17', time:'13:00', home:'Portugal',         away:'Rep. Dem. Congo',  group:'K', phase:'Grupo', homeFlag:flag('pt'),     awayFlag:flag('cd'),     homeScore:1,    awayScore:1 },
  // Inglaterra 4pm ET → 17:00 BRT — resultado: 4×2
  { id:'g022', date:'2026-06-17', time:'17:00', home:'Inglaterra',       away:'Croácia',          group:'L', phase:'Grupo', homeFlag:flag('gb-eng'), awayFlag:flag('hr'),     homeScore:4,    awayScore:2 },
  // Gana 7pm ET → 20:00 BRT (em andamento)
  { id:'g023', date:'2026-06-17', time:'20:00', home:'Gana',             away:'Panamá',           group:'L', phase:'Grupo', homeFlag:flag('gh'),     awayFlag:flag('pa'),     homeScore:null, awayScore:null },
  // Uzbequistão 10pm ET → 23:00 BRT
  { id:'g024', date:'2026-06-17', time:'23:00', home:'Uzbequistão',      away:'Colômbia',         group:'K', phase:'Grupo', homeFlag:flag('uz'),     awayFlag:flag('co'),     homeScore:null, awayScore:null },

  // ── 18 Jun (Qui) — Rodada 2 ────────────────────────────────
  // 12pm ET → 13:00 BRT
  { id:'g025', date:'2026-06-18', time:'13:00', home:'Rep. Tcheca',      away:'África do Sul',    group:'A', phase:'Grupo', homeFlag:flag('cz'),     awayFlag:flag('za'),     homeScore:null, awayScore:null },
  // 3pm ET → 16:00 BRT
  { id:'g026', date:'2026-06-18', time:'16:00', home:'Suíça',            away:'Bósnia e Herz.',   group:'B', phase:'Grupo', homeFlag:flag('ch'),     awayFlag:flag('ba'),     homeScore:null, awayScore:null },
  // 6pm ET → 19:00 BRT
  { id:'g027', date:'2026-06-18', time:'19:00', home:'Canadá',           away:'Qatar',            group:'B', phase:'Grupo', homeFlag:flag('ca'),     awayFlag:flag('qa'),     homeScore:null, awayScore:null },
  // 9pm ET → 22:00 BRT
  { id:'g028', date:'2026-06-18', time:'22:00', home:'México',           away:'Coreia do Sul',    group:'A', phase:'Grupo', homeFlag:flag('mx'),     awayFlag:flag('kr'),     homeScore:null, awayScore:null },

  // ── 19 Jun (Sex) ───────────────────────────────────────────
  { id:'g029', date:'2026-06-19', time:'16:00', home:'EUA',              away:'Austrália',        group:'D', phase:'Grupo', homeFlag:flag('us'),     awayFlag:flag('au'),     homeScore:null, awayScore:null },
  { id:'g030', date:'2026-06-19', time:'19:00', home:'Escócia',          away:'Marrocos',         group:'C', phase:'Grupo', homeFlag:flag('gb-sct'), awayFlag:flag('ma'),     homeScore:null, awayScore:null },
  { id:'g031', date:'2026-06-19', time:'21:30', home:'Brasil',           away:'Haiti',            group:'C', phase:'Grupo', homeFlag:flag('br'),     awayFlag:flag('ht'),     homeScore:null, awayScore:null },

  // ── 20 Jun (Sáb) ───────────────────────────────────────────
  { id:'g032', date:'2026-06-19', time:'23:00', home:'Turquia',          away:'Paraguai',         group:'D', phase:'Grupo', homeFlag:flag('tr'),     awayFlag:flag('py'),     homeScore:null, awayScore:null },
  { id:'g033', date:'2026-06-20', time:'14:00', home:'Holanda',          away:'Suécia',           group:'F', phase:'Grupo', homeFlag:flag('nl'),     awayFlag:flag('se'),     homeScore:null, awayScore:null },
  { id:'g034', date:'2026-06-20', time:'17:00', home:'Alemanha',         away:'Costa do Marfim',  group:'E', phase:'Grupo', homeFlag:flag('de'),     awayFlag:flag('ci'),     homeScore:null, awayScore:null },
  { id:'g035', date:'2026-06-20', time:'21:00', home:'Equador',          away:'Curaçao',          group:'E', phase:'Grupo', homeFlag:flag('ec'),     awayFlag:flag('cw'),     homeScore:null, awayScore:null },

  // ── 21 Jun (Dom) ───────────────────────────────────────────
  { id:'g036', date:'2026-06-20', time:'23:00', home:'Tunísia',          away:'Japão',            group:'F', phase:'Grupo', homeFlag:flag('tn'),     awayFlag:flag('jp'),     homeScore:null, awayScore:null },
  { id:'g037', date:'2026-06-21', time:'13:00', home:'Espanha',          away:'Arábia Saudita',   group:'H', phase:'Grupo', homeFlag:flag('es'),     awayFlag:flag('sa'),     homeScore:null, awayScore:null },
  { id:'g038', date:'2026-06-21', time:'16:00', home:'Bélgica',          away:'Irã',              group:'G', phase:'Grupo', homeFlag:flag('be'),     awayFlag:flag('ir'),     homeScore:null, awayScore:null },
  { id:'g039', date:'2026-06-21', time:'19:00', home:'Uruguai',          away:'Cabo Verde',       group:'H', phase:'Grupo', homeFlag:flag('uy'),     awayFlag:flag('cv'),     homeScore:null, awayScore:null },
  { id:'g040', date:'2026-06-21', time:'22:00', home:'Nova Zelândia',    away:'Egito',            group:'G', phase:'Grupo', homeFlag:flag('nz'),     awayFlag:flag('eg'),     homeScore:null, awayScore:null },

  // ── 22 Jun (Seg) ───────────────────────────────────────────
  { id:'g041', date:'2026-06-22', time:'14:00', home:'Argentina',        away:'Áustria',          group:'J', phase:'Grupo', homeFlag:flag('ar'),     awayFlag:flag('at'),     homeScore:null, awayScore:null },
  { id:'g042', date:'2026-06-22', time:'18:00', home:'França',           away:'Iraque',           group:'I', phase:'Grupo', homeFlag:flag('fr'),     awayFlag:flag('iq'),     homeScore:null, awayScore:null },
  { id:'g043', date:'2026-06-22', time:'21:00', home:'Noruega',          away:'Senegal',          group:'I', phase:'Grupo', homeFlag:flag('no'),     awayFlag:flag('sn'),     homeScore:null, awayScore:null },
  { id:'g044', date:'2026-06-23', time:'00:00', home:'Jordânia',         away:'Argélia',          group:'J', phase:'Grupo', homeFlag:flag('jo'),     awayFlag:flag('dz'),     homeScore:null, awayScore:null },

  // ── 23 Jun (Ter) ───────────────────────────────────────────
  { id:'g045', date:'2026-06-23', time:'14:00', home:'Portugal',         away:'Uzbequistão',      group:'K', phase:'Grupo', homeFlag:flag('pt'),     awayFlag:flag('uz'),     homeScore:null, awayScore:null },
  { id:'g046', date:'2026-06-23', time:'17:00', home:'Inglaterra',       away:'Gana',             group:'L', phase:'Grupo', homeFlag:flag('gb-eng'), awayFlag:flag('gh'),     homeScore:null, awayScore:null },
  { id:'g047', date:'2026-06-23', time:'20:00', home:'Panamá',           away:'Croácia',          group:'L', phase:'Grupo', homeFlag:flag('pa'),     awayFlag:flag('hr'),     homeScore:null, awayScore:null },
  { id:'g048', date:'2026-06-23', time:'23:00', home:'Colômbia',         away:'Rep. Dem. Congo',  group:'K', phase:'Grupo', homeFlag:flag('co'),     awayFlag:flag('cd'),     homeScore:null, awayScore:null },

  // ── 24 Jun (Qua) — Rodada 3 ────────────────────────────────
  { id:'g049', date:'2026-06-24', time:'16:00', home:'Suíça',            away:'Canadá',           group:'B', phase:'Grupo', homeFlag:flag('ch'),     awayFlag:flag('ca'),     homeScore:null, awayScore:null },
  { id:'g050', date:'2026-06-24', time:'16:00', home:'Bósnia e Herz.',   away:'Qatar',            group:'B', phase:'Grupo', homeFlag:flag('ba'),     awayFlag:flag('qa'),     homeScore:null, awayScore:null },
  { id:'g051', date:'2026-06-24', time:'19:00', home:'Escócia',          away:'Brasil',           group:'C', phase:'Grupo', homeFlag:flag('gb-sct'), awayFlag:flag('br'),     homeScore:null, awayScore:null },
  { id:'g052', date:'2026-06-24', time:'19:00', home:'Marrocos',         away:'Haiti',            group:'C', phase:'Grupo', homeFlag:flag('ma'),     awayFlag:flag('ht'),     homeScore:null, awayScore:null },
  { id:'g053', date:'2026-06-24', time:'22:00', home:'Rep. Tcheca',      away:'México',           group:'A', phase:'Grupo', homeFlag:flag('cz'),     awayFlag:flag('mx'),     homeScore:null, awayScore:null },
  { id:'g054', date:'2026-06-24', time:'22:00', home:'África do Sul',    away:'Coreia do Sul',    group:'A', phase:'Grupo', homeFlag:flag('za'),     awayFlag:flag('kr'),     homeScore:null, awayScore:null },

  // ── 25 Jun (Qui) ───────────────────────────────────────────
  { id:'g055', date:'2026-06-25', time:'17:00', home:'Curaçao',          away:'Costa do Marfim',  group:'E', phase:'Grupo', homeFlag:flag('cw'),     awayFlag:flag('ci'),     homeScore:null, awayScore:null },
  { id:'g056', date:'2026-06-25', time:'17:00', home:'Equador',          away:'Alemanha',         group:'E', phase:'Grupo', homeFlag:flag('ec'),     awayFlag:flag('de'),     homeScore:null, awayScore:null },
  { id:'g057', date:'2026-06-25', time:'20:00', home:'Japão',            away:'Suécia',           group:'F', phase:'Grupo', homeFlag:flag('jp'),     awayFlag:flag('se'),     homeScore:null, awayScore:null },
  { id:'g058', date:'2026-06-25', time:'20:00', home:'Tunísia',          away:'Holanda',          group:'F', phase:'Grupo', homeFlag:flag('tn'),     awayFlag:flag('nl'),     homeScore:null, awayScore:null },
  { id:'g059', date:'2026-06-25', time:'23:00', home:'Turquia',          away:'EUA',              group:'D', phase:'Grupo', homeFlag:flag('tr'),     awayFlag:flag('us'),     homeScore:null, awayScore:null },
  { id:'g060', date:'2026-06-25', time:'23:00', home:'Paraguai',         away:'Austrália',        group:'D', phase:'Grupo', homeFlag:flag('py'),     awayFlag:flag('au'),     homeScore:null, awayScore:null },

  // ── 26 Jun (Sex) ───────────────────────────────────────────
  { id:'g061', date:'2026-06-26', time:'16:00', home:'Noruega',          away:'França',           group:'I', phase:'Grupo', homeFlag:flag('no'),     awayFlag:flag('fr'),     homeScore:null, awayScore:null },
  { id:'g062', date:'2026-06-26', time:'16:00', home:'Senegal',          away:'Iraque',           group:'I', phase:'Grupo', homeFlag:flag('sn'),     awayFlag:flag('iq'),     homeScore:null, awayScore:null },
  { id:'g063', date:'2026-06-26', time:'21:00', home:'Cabo Verde',       away:'Arábia Saudita',   group:'H', phase:'Grupo', homeFlag:flag('cv'),     awayFlag:flag('sa'),     homeScore:null, awayScore:null },
  { id:'g064', date:'2026-06-26', time:'21:00', home:'Uruguai',          away:'Espanha',          group:'H', phase:'Grupo', homeFlag:flag('uy'),     awayFlag:flag('es'),     homeScore:null, awayScore:null },
  { id:'g065', date:'2026-06-27', time:'00:00', home:'Egito',            away:'Irã',              group:'G', phase:'Grupo', homeFlag:flag('eg'),     awayFlag:flag('ir'),     homeScore:null, awayScore:null },
  { id:'g066', date:'2026-06-27', time:'00:00', home:'Nova Zelândia',    away:'Bélgica',          group:'G', phase:'Grupo', homeFlag:flag('nz'),     awayFlag:flag('be'),     homeScore:null, awayScore:null },

  // ── 27 Jun (Sáb) ───────────────────────────────────────────
  { id:'g067', date:'2026-06-27', time:'18:00', home:'Panamá',           away:'Inglaterra',       group:'L', phase:'Grupo', homeFlag:flag('pa'),     awayFlag:flag('gb-eng'), homeScore:null, awayScore:null },
  { id:'g068', date:'2026-06-27', time:'18:00', home:'Croácia',          away:'Gana',             group:'L', phase:'Grupo', homeFlag:flag('hr'),     awayFlag:flag('gh'),     homeScore:null, awayScore:null },
  { id:'g069', date:'2026-06-27', time:'20:30', home:'Colômbia',         away:'Portugal',         group:'K', phase:'Grupo', homeFlag:flag('co'),     awayFlag:flag('pt'),     homeScore:null, awayScore:null },
  { id:'g070', date:'2026-06-27', time:'20:30', home:'Rep. Dem. Congo',  away:'Uzbequistão',      group:'K', phase:'Grupo', homeFlag:flag('cd'),     awayFlag:flag('uz'),     homeScore:null, awayScore:null },
  { id:'g071', date:'2026-06-27', time:'23:00', home:'Argélia',          away:'Áustria',          group:'J', phase:'Grupo', homeFlag:flag('dz'),     awayFlag:flag('at'),     homeScore:null, awayScore:null },
  { id:'g072', date:'2026-06-27', time:'23:00', home:'Jordânia',         away:'Argentina',        group:'J', phase:'Grupo', homeFlag:flag('jo'),     awayFlag:flag('ar'),     homeScore:null, awayScore:null },

  // ── FASE ELIMINATÓRIA (oitavas → final) ────────────────────
  { id:'r32_1',  date:'2026-06-28', time:'16:00', home:'2º Grupo A',   away:'2º Grupo B',   phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_2',  date:'2026-06-29', time:'14:00', home:'1º Grupo C',   away:'2º Grupo F',   phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_3',  date:'2026-06-29', time:'17:30', home:'1º Grupo E',   away:'3º Melhor',    phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_4',  date:'2026-06-29', time:'22:00', home:'1º Grupo F',   away:'2º Grupo C',   phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_5',  date:'2026-06-30', time:'14:00', home:'2º Grupo E',   away:'2º Grupo I',   phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_6',  date:'2026-06-30', time:'18:00', home:'1º Grupo I',   away:'3º Melhor',    phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_7',  date:'2026-06-30', time:'22:00', home:'1º Grupo A',   away:'3º Melhor',    phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_8',  date:'2026-07-01', time:'13:00', home:'1º Grupo L',   away:'3º Melhor',    phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_9',  date:'2026-07-01', time:'17:00', home:'1º Grupo G',   away:'3º Melhor',    phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_10', date:'2026-07-01', time:'21:00', home:'1º Grupo D',   away:'3º Melhor',    phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_11', date:'2026-07-02', time:'16:00', home:'1º Grupo H',   away:'2º Grupo J',   phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_12', date:'2026-07-02', time:'20:00', home:'2º Grupo K',   away:'2º Grupo L',   phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_13', date:'2026-07-03', time:'00:00', home:'1º Grupo B',   away:'3º Melhor',    phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_14', date:'2026-07-03', time:'15:00', home:'2º Grupo D',   away:'2º Grupo G',   phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_15', date:'2026-07-03', time:'19:00', home:'1º Grupo J',   away:'2º Grupo H',   phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r32_16', date:'2026-07-03', time:'22:30', home:'1º Grupo K',   away:'3º Melhor',    phase:'Oitavas', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },

  { id:'r16_1', date:'2026-07-04', time:'14:00', home:'Venc. Oit-1',  away:'Venc. Oit-2',  phase:'16 avos', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r16_2', date:'2026-07-04', time:'18:00', home:'Venc. Oit-3',  away:'Venc. Oit-4',  phase:'16 avos', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r16_3', date:'2026-07-05', time:'17:00', home:'Venc. Oit-5',  away:'Venc. Oit-6',  phase:'16 avos', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r16_4', date:'2026-07-05', time:'21:00', home:'Venc. Oit-7',  away:'Venc. Oit-8',  phase:'16 avos', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r16_5', date:'2026-07-06', time:'16:00', home:'Venc. Oit-9',  away:'Venc. Oit-10', phase:'16 avos', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r16_6', date:'2026-07-06', time:'21:00', home:'Venc. Oit-11', away:'Venc. Oit-12', phase:'16 avos', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r16_7', date:'2026-07-07', time:'13:00', home:'Venc. Oit-13', away:'Venc. Oit-14', phase:'16 avos', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'r16_8', date:'2026-07-07', time:'17:00', home:'Venc. Oit-15', away:'Venc. Oit-16', phase:'16 avos', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },

  { id:'qf1', date:'2026-07-09', time:'17:00', home:'Venc. 16a-1', away:'Venc. 16a-2', phase:'Quartas',  homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'qf2', date:'2026-07-10', time:'16:00', home:'Venc. 16a-3', away:'Venc. 16a-4', phase:'Quartas',  homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'qf3', date:'2026-07-11', time:'18:00', home:'Venc. 16a-5', away:'Venc. 16a-6', phase:'Quartas',  homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'qf4', date:'2026-07-11', time:'22:00', home:'Venc. 16a-7', away:'Venc. 16a-8', phase:'Quartas',  homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },

  { id:'sf1', date:'2026-07-14', time:'16:00', home:'Venc. QF-1', away:'Venc. QF-2', phase:'Semifinal', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'sf2', date:'2026-07-15', time:'16:00', home:'Venc. QF-3', away:'Venc. QF-4', phase:'Semifinal', homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'tp',  date:'2026-07-18', time:'18:00', home:'Perd. SF-1', away:'Perd. SF-2', phase:'3º Lugar',  homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
  { id:'final',date:'2026-07-19',time:'16:00', home:'Venc. SF-1', away:'Venc. SF-2', phase:'Final 🏆',  homeFlag:flag('un'), awayFlag:flag('un'), homeScore:null, awayScore:null },
]

// Jogos ao vivo agora (kick-off até 115min atrás)
export function getLiveGames() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const todayStr = `${y}-${m}-${d}`
  const currentMin = now.getHours() * 60 + now.getMinutes()

  return worldCupGames.filter(g => {
    if (g.date !== todayStr) return false
    const [h, min] = g.time.split(':').map(Number)
    const kickoff = h * 60 + min
    return currentMin >= kickoff && currentMin <= kickoff + 115
  })
}

export function getTodayGames() {
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  return worldCupGames.filter(g => g.date === todayStr)
}

export function getUpcomingGames(fromDate = new Date()) {
  const now = fromDate
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
  return worldCupGames
    .filter(g => g.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
}

export function groupGamesByDate(games) {
  return games.reduce((acc, game) => {
    if (!acc[game.date]) acc[game.date] = []
    acc[game.date].push(game)
    return acc
  }, {})
}

export function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-')
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
}
