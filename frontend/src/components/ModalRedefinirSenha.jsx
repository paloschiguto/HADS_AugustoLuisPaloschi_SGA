import { useState } from 'react'
import { solicitarCodigo, redefinirSenha } from '../services/redefinirSenhaService'

export function ModalRedefinirSenha({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [fase, setFase] = useState(1)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [erroEmail, setErroEmail] = useState('')
  const [erroCodigo, setErroCodigo] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSolicitarCodigo = async (e) => {
    e.preventDefault()
    setMensagem('')
    setErro('')
    setErroEmail('')
    if (!email.trim()) {
      setErroEmail('O email é obrigatório')
      return
    }
    setLoading(true)
    try {
      const res = await solicitarCodigo(email)
      setMensagem(res.message)
      setFase(2)
    } catch (err) {
      setErro(err.error || 'Erro ao enviar código')
    } finally {
      setLoading(false)
    }
  }

  const handleRedefinirSenha = async (e) => {
    e.preventDefault()
    setMensagem('')
    setErro('')
    setErroCodigo('')
    setErroSenha('')
    let valido = true
    if (!codigo.trim()) {
      setErroCodigo('O código é obrigatório')
      valido = false
    }
    if (!novaSenha.trim()) {
      setErroSenha('A senha é obrigatória')
      valido = false
    } else if (novaSenha.length < 6) {
      setErroSenha('A senha deve ter no mínimo 6 caracteres')
      valido = false
    }
    if (!valido) return

    setLoading(true)
    try {
      const res = await redefinirSenha(email, codigo, novaSenha)
      setMensagem(res.message)
      setFase(1)
      setEmail('')
      setCodigo('')
      setNovaSenha('')
    } catch (err) {
      setErro(err.error || 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md relative text-textPrimary dark:text-gray-200">
        <button
          className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
          onClick={onClose}
        >
          ✕
        </button>

        {fase === 1 ? (
          <>
            <h2 className="text-xl font-bold mb-4">Redefinir Senha</h2>
            {mensagem && <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-2 mb-2 rounded">{mensagem}</div>}
            {erro && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-2 mb-2 rounded">{erro}</div>}

            <form onSubmit={handleSolicitarCodigo}>
              <div className="mb-3">
                <input
                  type="email"
                  placeholder="Seu email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErroEmail('') }}
                  className={`w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-textPrimary dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${erroEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {erroEmail && <span className="text-red-500 text-sm mt-1 block">{erroEmail}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded text-white transition ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Enviando...
                  </div>
                ) : (
                  'Enviar Código'
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4">Digite o código e nova senha</h2>
            {mensagem && <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-2 mb-2 rounded">{mensagem}</div>}
            {erro && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-2 mb-2 rounded">{erro}</div>}

            <form onSubmit={handleRedefinirSenha}>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Código recebido"
                  value={codigo}
                  onChange={(e) => { setCodigo(e.target.value); setErroCodigo('') }}
                  className={`w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-textPrimary dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${erroCodigo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {erroCodigo && <span className="text-red-500 text-sm mt-1 block">{erroCodigo}</span>}
              </div>

              <div className="mb-3">
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={novaSenha}
                  onChange={(e) => { setNovaSenha(e.target.value); setErroSenha('') }}
                  className={`w-full border px-3 py-2 rounded bg-white dark:bg-gray-700 text-textPrimary dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${erroSenha ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                {erroSenha && <span className="text-red-500 text-sm mt-1 block">{erroSenha}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded text-white transition ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Processando...
                  </div>
                ) : (
                  'Redefinir Senha'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
