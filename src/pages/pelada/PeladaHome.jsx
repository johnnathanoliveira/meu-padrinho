import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import LoginModal from '../../components/LoginModal'
import QRModal from '../../components/QRModal'
import CheckinSection from './CheckinSection'
import SorteioSection from './SorteioSection'
import AbitroSection from './AbitroSection'
import PeladaUsers from './PeladaUsers'
import JogosSection from './JogosSection'
import HistoricoSection from './HistoricoSection'
import ConquistasSection from './ConquistasSection'
import PerfilPage from '../perfil/PerfilPage'
import { Users, ChevronLeft, Share2, CheckSquare, Shuffle, Shield, Trophy, UserCheck, Swords, History, CircleUserRound } from 'lucide-react'

const TABS = [
  { id: 'checkin',    label: 'Check-in',   Icon: CheckSquare },
  { id: 'sorteio',    label: 'Sorteio',    Icon: Shuffle },
  { id: 'jogos',      label: 'Jogos',      Icon: Swords },
  { id: 'arbitro',    label: 'Árbitro',    Icon: Shield },
  { id: 'conquistas', label: 'Conquistas', Icon: Trophy },
  { id: 'historico',  label: 'Histórico',  Icon: History },
  { id: 'jogadores',  label: 'Jogadores',  Icon: UserCheck },
  { id: 'perfil',     label: 'Meu Perfil', Icon: CircleUserRound },
]

export default function PeladaHome() {
  const { getUserForModule, isAdmin } = useAuth()
  const user = getUserForModule('pelada')
  const navigate = useNavigate()
  const [showLogin, setShowLogin] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [tab, setTab] = useState('checkin')

  const shareLink = `${window.location.origin}/pelada`

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col">
        <header className="flex items-center gap-3 p-4 border-b border-zinc-900">
          <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white">
            <ChevronLeft size={24} />
          </button>
          <Users className="text-brand-yellow" size={22} />
          <h1 className="text-lg font-black text-white">Pelada</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="text-6xl">👟</div>
          <div>
            <h2 className="text-2xl font-black text-white">Pelada da Semana</h2>
            <p className="text-zinc-500 mt-2">Toda segunda-feira. Check-in, sorteio e muito mais!</p>
          </div>
          <button onClick={() => setShowLogin(true)} className="btn-primary px-10">
            Entrar na Pelada 👟
          </button>
          <button
            onClick={() => setShowQR(true)}
            className="btn-secondary px-8 flex items-center gap-2"
          >
            <Share2 size={16} /> Compartilhar QR Code
          </button>
        </div>

        {showLogin && (
          <LoginModal
            module="pelada"
            onClose={() => setShowLogin(false)}
            onSuccess={() => setShowLogin(false)}
          />
        )}
        {showQR && <QRModal url={shareLink} onClose={() => setShowQR(false)} title="Pelada" />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-zinc-900 sticky top-0 bg-brand-black z-10">
        <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white">
          <ChevronLeft size={24} />
        </button>
        <Users className="text-brand-yellow" size={22} />
        <h1 className="text-lg font-black text-white flex-1">Pelada</h1>
        <div className="flex items-center gap-2">
          {isAdmin('pelada') && (
            <span className="text-xs bg-brand-yellow text-black font-bold px-2 py-0.5 rounded-full">
              ADMIN
            </span>
          )}
          <button onClick={() => setShowQR(true)} className="text-zinc-400 hover:text-brand-yellow">
            <Share2 size={18} />
          </button>
          <img
            src={user.photo_url}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-brand-yellow/40"
          />
        </div>
      </header>

      {/* Tabs horizontais com scroll */}
      <div className="flex overflow-x-auto border-b border-zinc-900 bg-zinc-900/30 px-2 py-1 gap-1 no-scrollbar">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              tab === id
                ? 'bg-brand-yellow text-black'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tab === 'checkin'    && <CheckinSection    user={user} isAdmin={isAdmin('pelada')} />}
        {tab === 'sorteio'    && <SorteioSection    user={user} isAdmin={isAdmin('pelada')} />}
        {tab === 'jogos'      && <JogosSection      user={user} isAdmin={isAdmin('pelada')} />}
        {tab === 'arbitro'    && <AbitroSection     user={user} isAdmin={isAdmin('pelada')} />}
        {tab === 'conquistas' && <ConquistasSection user={user} isAdmin={isAdmin('pelada')} />}
        {tab === 'historico'  && <HistoricoSection  user={user} />}
        {tab === 'jogadores'  && <PeladaUsers       user={user} />}
        {tab === 'perfil'     && <PerfilPage        module="pelada" />}
      </div>

      {showQR && <QRModal url={shareLink} onClose={() => setShowQR(false)} title="Pelada" />}
    </div>
  )
}
