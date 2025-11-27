import { useState } from 'react'
import { useAuth } from '../services/authContext'
import { ModalRedefinirSenha } from '../components/ModalRedefinirSenha'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/ThemeContext'
import {
  Mail,
  Lock,
  Sun,
  Moon,
  Loader2,
  ArrowRight
} from 'lucide-react'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [modalAberta, setModalAberta] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [erroEmail, setErroEmail] = useState('')
  const [erroSenha, setErroSenha] = useState('')

  const validarCampos = () => {
    let valido = true

    if (!email.trim()) {
      setErroEmail('Email é obrigatório')
      valido = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErroEmail('Email inválido')
      valido = false
    } else {
      setErroEmail('')
    }

    if (!senha.trim()) {
      setErroSenha('Senha é obrigatória')
      valido = false
    } else {
      setErroSenha('')
    }

    return valido
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validarCampos()) return

    setIsLoading(true)
    try {
      await login(email, senha)
      navigate('/dashboard')
    } catch (err) {
      setErro(err.message || 'Falha ao autenticar. Verifique suas credenciais.')
      setIsLoading(false)
    }
  }


  const inputClass = (erroCampo) =>
    `w-full border rounded-xl px-4 py-3 pl-10 mb-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
     ${erroCampo ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'}
     focus:outline-none focus:ring-2 transition-all`

  const erroClass = 'text-red-500 text-xs mt-1 ml-1 block'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors px-4">

      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md backdrop-blur-sm hover:scale-110 transition-transform text-gray-700 dark:text-gray-200"
        title="Alternar tema"
      >
        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700">

        <div className="flex flex-col items-center mb-3">
          <img
            src="/icone.png" 
            alt="Logo SGA"
            className="h-24 w-auto mb-1 drop-shadow-md"
          />

          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Bem-vindo ao SGA</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Faça login para gerenciar sua clínica</p>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 p-3 rounded-lg mb-6 text-sm text-center flex items-center justify-center gap-2 animate-pulse">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Input Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErroEmail(''); setErro('') }}
                className={inputClass(erroEmail)}
              />
            </div>
            {erroEmail && <span className={erroClass}>{erroEmail}</span>}
          </div>

          {/* Input Senha */}
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErroSenha(''); setErro('') }}
                className={inputClass(erroSenha)}
              />
            </div>
            {erroSenha && <span className={erroClass}>{erroSenha}</span>}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Entrando...
              </>
            ) : (
              <>
                Entrar <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:underline"
            onClick={() => setModalAberta(true)}
          >
            Esqueceu sua senha?
          </button>
        </div>

      </div>

      <div className="absolute bottom-4 text-center w-full text-xs text-gray-400 dark:text-gray-600">
        &copy; {new Date().getFullYear()} Sistema de Gestão de Asilo.
      </div>

      {modalAberta && <ModalRedefinirSenha isOpen={modalAberta} onClose={() => setModalAberta(false)} />}
    </div>
  )
}