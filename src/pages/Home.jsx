import { useNavigate } from 'react-router-dom'
import { Trophy, Users } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-brand-black flex flex-col select-none">
      {/* Header com logo */}
      <header className="pt-14 pb-8 text-center px-6">
        <div className="inline-flex items-center justify-center w-28 h-28 rounded-full
                        bg-brand-yellow mb-5 shadow-xl shadow-brand-yellow/20 overflow-hidden">
          <img src="/logo_padrinho.png" alt="Meu Padrinho Barbearia"
            className="w-full h-full object-cover" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
          Meu Padrinho
        </h1>
        <h2 className="text-4xl font-black text-brand-yellow tracking-tight">
          Barber Club
        </h2>
        <p className="text-zinc-500 mt-2 text-sm leading-snug px-4">
          O checkin será validado após comprovação do pagamento no pix 💈
        </p>
      </header>

      {/* Botões */}
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-5 pb-10">
        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">
          Escolha sua brincadeira
        </p>

        {/* Bolão Copa */}
        <button
          onClick={() => navigate('/bolao')}
          className="w-full max-w-sm bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-5
                     active:scale-95 active:border-brand-yellow transition-all duration-150 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/30
                            flex items-center justify-center shrink-0">
              <Trophy className="text-brand-yellow" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Bolão Copa</h3>
              <p className="text-zinc-500 text-sm mt-0.5">Copa do Mundo 2026 ⚽</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {['Palpites', 'Ranking', 'Placares'].map(t => (
              <span key={t} className="text-xs bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20
                                       rounded-full px-3 py-1 font-medium">{t}</span>
            ))}
          </div>
        </button>

        {/* Pelada */}
        <button
          onClick={() => navigate('/pelada')}
          className="w-full max-w-sm bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-5
                     active:scale-95 active:border-brand-yellow transition-all duration-150 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/30
                            flex items-center justify-center shrink-0">
              <Users className="text-brand-yellow" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Pelada</h3>
              <p className="text-zinc-500 text-sm mt-0.5">Toda segunda-feira 👟</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {['Sorteio', 'Check-in', '🌟 Bola Cheia', '💩 Bola Murcha'].map(t => (
              <span key={t} className="text-xs bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20
                                       rounded-full px-3 py-1 font-medium">{t}</span>
            ))}
          </div>
        </button>
      </main>

      <footer className="text-center pb-8 text-zinc-700 text-xs pb-safe">
        Meu Padrinho Barber Club © 2026
      </footer>
    </div>
  )
}
