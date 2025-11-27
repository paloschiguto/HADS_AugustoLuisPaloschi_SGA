import { useState } from 'react'
import { solicitarCodigo, redefinirSenha } from '../services/redefinirSenhaService'
import {
  X,
  Mail,
  Lock,
  Key,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

  const inputClass = (hasError) => `
        w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all
        ${hasError
      ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10'
      : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
    }
    `

  const handleSolicitarCodigo = async (e) => {
    e.preventDefault()
    setMensagem('')
    setErro('')
    setErroEmail('')

    if (!email.trim()) {
      setErroEmail('O e-mail é obrigatório.')
      return
    }

    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(email)) {
      setErroEmail('Por favor, insira um endereço de e-mail válido.')
      return
    }

    setLoading(true)
    try {
      const res = await solicitarCodigo(email)
      setMensagem(res.message || 'Código enviado com sucesso!')
      setFase(2)
    } catch (err) {
      setErro(err.message || 'Não foi possível enviar o código. Verifique o e-mail.')
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
      setErroCodigo('O código é obrigatório');
      valido = false
    }

    const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/

    if (!novaSenha.trim()) {
      setErroSenha('A senha é obrigatória');
      valido = false
    }
    else if (!senhaRegex.test(novaSenha)) {
      setErroSenha('Mínimo 8 caracteres, apenas letras e números.')
      valido = false
    }

    if (!valido) return

    setLoading(true)
    try {
      const res = await redefinirSenha(email, codigo, novaSenha)
      setMensagem(res.message || 'Senha redefinida com sucesso!')

      setTimeout(() => {
        resetarEstado()
        onClose()
      }, 2000)
    } catch (err) {
      setErro(err.message || 'Erro ao redefinir senha. Verifique o código.')
      setLoading(false)
    }
  }

  const resetarEstado = () => {
    setFase(1)
    setEmail('')
    setCodigo('')
    setNovaSenha('')
    setMensagem('')
    setErro('')
    setErroEmail('')
    setLoading(false)
  }

  const handleClose = () => {
    resetarEstado()
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-8">

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {fase === 1 ? 'Recuperar Acesso' : 'Criar Nova Senha'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {fase === 1
                    ? 'Informe seu e-mail para receber o código.'
                    : `Código enviado para ${email}`
                  }
                </p>
              </div>

              <AnimatePresence mode='wait'>
                {mensagem && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 p-3 rounded-lg mb-4 text-sm flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> {mensagem}
                  </motion.div>
                )}
                {erro && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 p-3 rounded-lg mb-4 text-sm flex items-center gap-2"
                  >
                    <AlertCircle size={16} /> {erro}
                  </motion.div>
                )}
              </AnimatePresence>

              {fase === 1 && (
                <form onSubmit={handleSolicitarCodigo} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Seu E-mail</label>
                    <div className="relative">
                      <Mail className={`absolute left-3 top-3.5 size={18} transition-colors ${erroEmail ? 'text-red-500' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        placeholder="exemplo@email.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErroEmail('') }}
                        className={inputClass(!!erroEmail)}
                        autoFocus
                      />
                    </div>

                    <AnimatePresence>
                      {erroEmail && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="flex items-center gap-1 text-red-500 text-xs mt-1.5 ml-1 font-medium"
                        >
                          <AlertCircle size={12} />
                          {erroEmail}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-70 focus:ring-4 focus:ring-blue-500/30"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <>Enviar Código <ArrowRight size={18} /></>}
                  </button>
                </form>
              )}

              {fase === 2 && (
                <form onSubmit={handleRedefinirSenha} className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Código de Verificação</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Digite o código"
                        value={codigo}
                        onChange={(e) => { setCodigo(e.target.value); setErroCodigo('') }}
                        className={inputClass(!!erroCodigo)}
                        autoFocus
                      />
                    </div>
                    {erroCodigo && <span className="text-red-500 text-xs mt-1 ml-1 font-medium">{erroCodigo}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Nova Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={novaSenha}
                        onChange={(e) => { setNovaSenha(e.target.value); setErroSenha('') }}
                        className={inputClass(!!erroSenha)}
                      />
                    </div>
                    {erroSenha && <span className="text-red-500 text-xs mt-1 ml-1 font-medium">{erroSenha}</span>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-70 focus:ring-4 focus:ring-blue-500/30"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Redefinir Senha'}
                  </button>

                  <div className="text-center mt-2">
                    <button
                      type="button"
                      onClick={() => setFase(1)}
                      className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 transition-colors"
                    >
                      Voltar e corrigir e-mail
                    </button>
                  </div>
                </form>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}