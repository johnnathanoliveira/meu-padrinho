import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { X, Camera, User } from 'lucide-react'
import toast from 'react-hot-toast'

const POSITIONS = ['Goleiro', 'Fixo', 'Ala', 'Pivô', 'Atacante', 'Qualquer']

export default function EditProfileModal({ module, onClose, onSaved }) {
  const { getUserForModule, loginWithPhone } = useAuth()
  const currentUser = getUserForModule(module)

  const [name, setName] = useState(currentUser?.name || '')
  const [position, setPosition] = useState(currentUser?.position || 'Qualquer')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(currentUser?.photo_url || null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Foto muito grande! Máximo 5MB.'); return }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Nome não pode ficar vazio!'); return }

    setLoading(true)
    try {
      let photoUrl = currentUser?.photo_url

      // Faz upload da nova foto se mudou
      if (photo) {
        const ext = photo.name.split('.').pop()
        const fileName = `${module}/${currentUser.phone}_${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos').upload(fileName, photo, { upsert: true })
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)
          photoUrl = urlData.publicUrl
        }
      }

      // Atualiza no banco
      const table = module === 'bolao' ? 'bolao_users' : 'pelada_users'
      const updates = {
        name: name.trim(),
        photo_url: photoUrl,
        ...(module === 'pelada' ? { position } : {}),
      }

      const { error } = await supabase.from(table).update(updates).eq('id', currentUser.id)
      if (error) throw error

      // Atualiza sessão local re-usando o loginWithPhone (que faz upsert e salva no localStorage)
      await loginWithPhone(currentUser.phone, name.trim(), photoUrl, module, position)

      toast.success('Perfil atualizado! ✅')
      onSaved?.()
      onClose()
    } catch (err) {
      toast.error('Erro ao salvar. Tenta de novo!')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md
                      max-h-[92vh] overflow-y-auto fade-in">
        {/* Handle mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-black text-white">Editar perfil</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 active:scale-90">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-5">
          {/* Foto */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-brand-yellow
                         active:scale-95 transition-transform"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <Camera size={28} className="text-brand-yellow" />
                </div>
              )}
              {/* Overlay de edição */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0
                              hover:opacity-100 active:opacity-100 transition-opacity">
                <Camera size={22} className="text-white" />
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            <p className="text-zinc-500 text-xs">Toca na foto para alterar</p>
          </div>

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
              <User size={14} /> Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field text-base"
              maxLength={30}
              autoComplete="name"
            />
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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
              : 'Salvar alterações'
            }
          </button>
        </form>
      </div>
    </div>
  )
}
