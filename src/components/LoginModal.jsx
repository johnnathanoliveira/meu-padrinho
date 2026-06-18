import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { X, Camera, Phone, User, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

const POSITIONS = ['Goleiro', 'Fixo', 'Ala', 'Pivô', 'Atacante', 'Qualquer']

function formatPhone(value) {
  const nums = value.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 2) return nums.length ? `(${nums}` : ''
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
}

// ── Modo recuperar conta ──────────────────────────────────────
function RecoverMode({ module, onClose, onSuccess, onBack }) {
  const { loginWithPhone } = useAuth()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRecover = async (e) => {
    e.preventDefault()
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) { toast.error('Telefone inválido!'); return }

    setLoading(true)
    try {
      const table = module === 'bolao' ? 'bolao_users' : 'pelada_users'
      const { data: existing, error } = await supabase
        .from(table).select('*').eq('phone', cleanPhone).single()

      if (error || !existing) {
        toast.error('Número não encontrado. Faz o cadastro!')
        setLoading(false)
        return
      }

      // Loga com os dados já salvos no banco
      const userWithModule = { ...existing, module }
      // Salva no localStorage via loginWithPhone sem alterar dados
      const result = await loginWithPhone(cleanPhone, existing.name, existing.photo_url, module, existing.position)
      if (result.success) {
        toast.success(`Bem-vindo de volta, ${existing.name}! 👋`)
        onSuccess(result.user)
      }
    } catch (err) {
      toast.error('Erro ao recuperar conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-5 space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-brand-yellow/10 border border-brand-yellow/30
                        flex items-center justify-center mx-auto mb-3">
          <Phone size={24} className="text-brand-yellow" />
        </div>
        <h3 className="font-black text-white text-lg">Recuperar conta</h3>
        <p className="text-zinc-500 text-sm mt-1">
          Digite seu WhatsApp para entrar de volta
        </p>
      </div>

      <form onSubmit={handleRecover} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">Seu WhatsApp</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(formatPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            className="input-field text-lg tracking-wider"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
        >
          {loading
            ? <span className="w-5 h-5 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
            : <><LogIn size={18} /> Entrar</>
          }
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-zinc-500 text-sm py-2 hover:text-zinc-300 transition-colors"
        >
          ← Fazer cadastro novo
        </button>
      </form>
    </div>
  )
}

// ── Modo cadastro ─────────────────────────────────────────────
export default function LoginModal({ module, onClose, onSuccess }) {
  const { loginWithPhone } = useAuth()
  const [mode, setMode] = useState('register') // 'register' | 'recover'
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [position, setPosition] = useState('Qualquer')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Foto muito grande! Máximo 5MB.'); return }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Coloca seu nome!'); return }
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) { toast.error('Telefone inválido!'); return }
    if (!photoPreview) { toast.error('Adiciona uma foto sua!'); return }

    setLoading(true)
    try {
      let photoUrl = photoPreview
      if (photo) {
        const ext = photo.name.split('.').pop()
        const fileName = `${module}/${cleanPhone}_${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos').upload(fileName, photo, { upsert: true })
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)
          photoUrl = urlData.publicUrl
        }
      }

      const result = await loginWithPhone(cleanPhone, name.trim(), photoUrl, module, position)
      if (result.success) {
        toast.success(`Bem-vindo, ${name.trim()}! 🎉`)
        onSuccess(result.user)
      } else {
        toast.error('Erro ao entrar. Tenta de novo!')
      }
    } catch (err) {
      toast.error('Erro inesperado.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const moduleLabel = module === 'bolao' ? '⚽ Bolão Copa' : '👟 Pelada'

  return (
    // No mobile: abre como sheet vindo de baixo. No desktop: modal centralizado
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md
                      max-h-[92vh] overflow-y-auto fade-in">
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-black text-white">
            {mode === 'recover' ? 'Recuperar conta' : `Entrar — ${moduleLabel}`}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo */}
        {mode === 'recover' ? (
          <RecoverMode
            module={module}
            onClose={onClose}
            onSuccess={onSuccess}
            onBack={() => setMode('register')}
          />
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Foto */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-24 h-24 rounded-full border-2 border-dashed border-brand-yellow
                           flex items-center justify-center overflow-hidden bg-zinc-800
                           active:scale-95 transition-transform"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-brand-yellow">
                    <Camera size={28} />
                    <span className="text-xs font-bold">Foto</span>
                  </div>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              <p className="text-zinc-500 text-xs">Toca para tirar ou escolher foto</p>
            </div>

            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <User size={14} /> Seu nome
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Como te chamam?"
                className="input-field text-base"
                maxLength={30}
                autoComplete="name"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Phone size={14} /> WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className="input-field text-base tracking-wide"
                autoComplete="tel"
                inputMode="numeric"
              />
              <p className="text-zinc-600 text-xs">Sua chave de acesso ao sistema</p>
            </div>

            {/* Posição (só pelada) */}
            {module === 'pelada' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">Posição no futsal</label>
                <div className="grid grid-cols-3 gap-2">
                  {POSITIONS.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPosition(p)}
                      className={`py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        position === p ? 'bg-brand-yellow text-black' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botão principal */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
                : 'Entrar 🚀'
              }
            </button>

            {/* Link recuperar conta */}
            <button
              type="button"
              onClick={() => setMode('recover')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                         bg-zinc-800/60 text-zinc-400 text-sm font-semibold
                         hover:text-white hover:bg-zinc-800 active:scale-95 transition-all"
            >
              <LogIn size={15} />
              Já tenho conta — entrar pelo celular
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
