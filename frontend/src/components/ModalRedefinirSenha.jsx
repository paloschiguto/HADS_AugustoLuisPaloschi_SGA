import { useState } from 'react'
import { solicitarCodigo, redefinirSenha } from '../services/redefinirSenhaService'

export function ModalRedefinirSenha({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [fase, setFase] = useState(1) // 1 = solicitar código, 2 = redefinir senha
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  if (!isOpen) return null

  const handleSolicitarCodigo = async (e) => {
    e.preventDefault()
    setMensagem('')
    setErro('')
    try {
      const res = await solicitarCodigo(email)
      setMensagem(res.message)
      setFase(2)
    } catch (err) {
      setErro(err.error || 'Erro ao enviar código')
    }
  }

  const handleRedefinirSenha = async (e) => {
    e.preventDefault()
    setMensagem('')
    setErro('')
    try {
      const res = await redefinirSenha(email, codigo, novaSenha)
      setMensagem(res.message)
      setFase(1)
      setEmail('')
      setCodigo('')
      setNovaSenha('')
    } catch (err) {
      setErro(err.error || 'Erro ao redefinir senha')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>

        {fase === 1 ? (
          <>
            <h2 className="text-xl font-bold mb-4">Redefinir Senha</h2>
            {mensagem && <div className="bg-green-100 text-green-700 p-2 mb-2">{mensagem}</div>}
            {erro && <div className="bg-red-100 text-red-700 p-2 mb-2">{erro}</div>}

            <form onSubmit={handleSolicitarCodigo} className="space-y-4">
              <input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                Enviar Código
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Digite o código e nova senha</h2>
            {mensagem && <div className="bg-green-100 text-green-700 p-2 mb-2">{mensagem}</div>}
            {erro && <div className="bg-red-100 text-red-700 p-2 mb-2">{erro}</div>}

            <form onSubmit={handleRedefinirSenha} className="space-y-4">
              <input
                type="text"
                placeholder="Código recebido"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="password"
                placeholder="Nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                Redefinir Senha
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}