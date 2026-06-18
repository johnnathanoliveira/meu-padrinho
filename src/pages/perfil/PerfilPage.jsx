import { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Camera, User, Phone, LogOut, Check, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

const POSITIONS = ['Goleiro', 'Fixo', 'Ala', 'Pivô', 'Atacante', 'Qualquer']

export default function PerfilPage({ module }) {
  const { getUserForModule, loginWithPhone, logout } = useAuth()
  const user = getUserForModule(module)

  const [name, setName] = useState(user?.name || '')
  const [position, setPosition] = useState(user?.position || 'Qualquer')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(user?.photo_url || null)
  const [saving, setSaving] = useState(false)
  const [edited, setEdited] = useState(false)
  const fileRef = useRef()

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Foto muito grande! Máximo 5MB.'); return }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setEdited(true)
  }

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Nome não pode ficar vazio!'); return }
    setSaving(true)
    try {
      let photoUrl = user?.photo_url

      if (photo) {
        const ext = photo.name.split('.').pop()
        const fileName = `${module}/${user.phone}_${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos').upload(fileName, photo, { upsert: true })
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)
          photoUrl = urlData.publicUrl
        }
      }

      await loginWithPhone(user.phone, name.trim(), photoUrl, module, position)
      setEdited(false)
      setPhoto(null)
      toast.success('Perfil atualizado! ✅')
    } catch (err) {
      toast.error('Erro ao salvar.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout(module)
    toast.success('Você saiu.')
  }

  if (!user) return null

  return (
    <div className="p-4 space-y-5 pb-10">
      {/* Avatar + câmera */}
      <div className="flex flex-col items-center pt-4 gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-brand-yellow
                     active:scale-95 transition-transform shadow-lg shadow-brand-yellow/20"
        >
          {photoPreview ? (
            <img src={photoPreview} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <User size={40} className="text-zinc-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center
                          opacity-0 hover:opacity-100 active:opacity-100 transition-opacity">
            <Camera size={24} className="text-white" />
            <span className="text-white text-xs font-bold mt-1">Alterar</span>
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        <p className="text-zinc-500 text-xs">Toca na foto para alterar</p>
      </div>

      {/* Campos */}
      <div className="card space-y-4">
        {/* Nome */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
            <User size={14} /> Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setEdited(true) }}
            className="input-field text-base font-semibold"
            maxLength={30}
            autoComplete="name"
          />
        </div>

        {/* Telefone (somente leitura) */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
            <Phone size={14} /> WhatsApp
          </label>
          <div className="input-field bg-zinc-800/50 text-zinc-500 font-mono flex items-center justify-between">
            <span>{user.phone}</span>
            <span className="text-xs text-zinc-700 font-sans">não editável</span>
          </div>
        </div>

        {/* Posição (só pelada) */}
        {module === 'pelada' && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-400">Posição no futsal</label>
            <div className="grid grid-cols-3 gap-2">
              {POSITIONS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setPosition(p); setEdited(true) }}
                  className={`py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    position === p
                      ? 'bg-brand-yellow text-black'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botão salvar — só aparece quando há mudanças */}
      {edited && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base fade-in"
        >
          {saving
            ? <span className="w-5 h-5 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
            : <><Check size={18} /> Salvar alterações</>
          }
        </button>
      )}

      {/* Sair */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl
                   bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold
                   active:scale-95 transition-all hover:border-red-800 hover:text-red-400"
      >
        <LogOut size={16} />
        Sair da conta
      </button>

      {/* Módulo / info */}
      <p className="text-center text-zinc-700 text-xs">
        {module === 'bolao' ? '⚽ Bolão Copa 2026' : '👟 Pelada'} · ID: {user.id?.slice(0, 8)}
      </p>
    </div>
  )
}
