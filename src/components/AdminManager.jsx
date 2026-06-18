import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Shield, Plus, Trash2, Phone, X, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

function formatPhone(value) {
  const nums = value.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 2) return nums.length ? `(${nums}` : ''
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
}

export default function AdminManager({ currentUserModule }) {
  const { isAdmin, addAdmin, removeAdmin, adminPhones, reloadAdmins } = useAuth()
  const [open, setOpen] = useState(false)
  const [admins, setAdmins] = useState([]) // { phone, name, photo_url }
  const [newPhone, setNewPhone] = useState('')
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  // Só renderiza se o usuário for admin
  if (!isAdmin(currentUserModule)) return null

  useEffect(() => {
    if (open) loadAdminDetails()
  }, [open])

  const loadAdminDetails = async () => {
    setLoading(true)
    // Busca detalhes dos admins nos dois módulos
    const results = await Promise.all(
      adminPhones.map(async (phone) => {
        // Tenta bolao_users primeiro, depois pelada_users
        const { data: b } = await supabase.from('bolao_users').select('name, photo_url, phone').eq('phone', phone).single()
        if (b) return b
        const { data: p } = await supabase.from('pelada_users').select('name, photo_url, phone').eq('phone', phone).single()
        if (p) return p
        return { phone, name: phone, photo_url: null }
      })
    )
    setAdmins(results)
    setLoading(false)
  }

  const handleAdd = async () => {
    const clean = newPhone.replace(/\D/g, '')
    if (clean.length < 10) { toast.error('Telefone inválido!'); return }
    if (adminPhones.includes(clean)) { toast.error('Já é admin!'); return }

    setAdding(true)
    const ok = await addAdmin(clean)
    if (ok) {
      toast.success('Admin adicionado! ✅')
      setNewPhone('')
      await reloadAdmins()
      loadAdminDetails()
    } else {
      toast.error('Erro ao adicionar admin.')
    }
    setAdding(false)
  }

  const handleRemove = async (phone) => {
    // Impede remover a si mesmo se for o único admin
    if (adminPhones.length <= 1) {
      toast.error('Não pode remover o único admin!')
      return
    }
    const ok = await removeAdmin(phone)
    if (ok) {
      toast.success('Admin removido.')
      await reloadAdmins()
      loadAdminDetails()
    }
  }

  return (
    <div className="card border-brand-yellow/20">
      {/* Header clicável */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-brand-yellow/10 border border-brand-yellow/20
                        flex items-center justify-center shrink-0">
          <Shield size={16} className="text-brand-yellow" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-white text-sm">Gerenciar Admins</p>
          <p className="text-zinc-500 text-xs">{adminPhones.length} admin{adminPhones.length !== 1 ? 's' : ''} ativos</p>
        </div>
        {open ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
      </button>

      {/* Conteúdo */}
      {open && (
        <div className="mt-4 space-y-4 border-t border-zinc-800 pt-4">
          {/* Adicionar novo admin */}
          <div>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-2">
              Adicionar admin
            </p>
            <div className="flex gap-2">
              <input
                type="tel"
                value={newPhone}
                onChange={e => setNewPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                inputMode="numeric"
                className="input-field flex-1 text-sm py-2.5"
              />
              <button
                onClick={handleAdd}
                disabled={adding}
                className="btn-primary px-4 py-2.5 text-sm flex items-center gap-1.5 shrink-0"
              >
                {adding
                  ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  : <><Plus size={16} /> Adicionar</>
                }
              </button>
            </div>
            <p className="text-zinc-700 text-xs mt-1">
              A pessoa precisa ter conta cadastrada no sistema
            </p>
          </div>

          {/* Lista de admins */}
          <div>
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-2">
              Admins ativos
            </p>
            {loading ? (
              <p className="text-zinc-600 text-sm text-center py-3">Carregando...</p>
            ) : (
              <div className="space-y-2">
                {admins.map(admin => (
                  <div key={admin.phone}
                    className="flex items-center gap-3 bg-zinc-800/50 rounded-xl p-2.5"
                  >
                    {admin.photo_url ? (
                      <img src={admin.photo_url} alt={admin.name}
                        className="w-9 h-9 rounded-full object-cover border border-zinc-700 shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                        <Phone size={14} className="text-zinc-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{admin.name}</p>
                      <p className="text-xs text-zinc-500 font-mono">{admin.phone}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20
                                       rounded-full px-2 py-0.5 font-bold">ADMIN</span>
                      {adminPhones.length > 1 && (
                        <button
                          onClick={() => handleRemove(admin.phone)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center
                                     text-zinc-600 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
