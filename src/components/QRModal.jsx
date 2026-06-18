import { QRCodeSVG } from 'qrcode.react'
import { X, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QRModal({ url, onClose, title }) {
  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copiado!')
    })
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm fade-in">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Compartilhar — {title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-5">
          <div className="bg-white p-4 rounded-2xl">
            <QRCodeSVG value={url} size={180} />
          </div>

          <div className="w-full">
            <p className="text-zinc-500 text-xs text-center mb-3">ou compartilhe o link</p>
            <div className="flex items-center gap-2 bg-zinc-800 rounded-xl p-3">
              <p className="text-brand-yellow text-sm flex-1 truncate font-mono">{url}</p>
              <button
                onClick={copyLink}
                className="text-zinc-400 hover:text-brand-yellow transition-colors shrink-0"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>

          <p className="text-zinc-600 text-xs text-center">
            Seus amigos escaneiam o QR Code para entrar!
          </p>
        </div>
      </div>
    </div>
  )
}
