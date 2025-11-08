import { useState } from 'react'
import { useAuth } from '../services/authContext'
import { ModalRedefinirSenha } from '../components/ModalRedefinirSenha'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/ThemeContext'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [modalAberta, setModalAberta] = useState(false)

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

    try {
      await login(email, senha)
      navigate('/dashboard')
    } catch (err) {
      setErro(err.message)
    }
  }

  const inputClass = (erroCampo) =>
    `w-full border rounded-lg px-3 py-2 mb-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
     ${erroCampo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
     focus:outline-none focus:ring-2 focus:ring-blue-500 transition`

  const erroClass = 'text-red-500 text-sm mb-2 block'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">Login</h2>

        {erro && (
          <div className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 p-2 rounded mb-4 text-center">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErroEmail(''); setErro('') }}
              className={inputClass(erroEmail)}
            />
            {erroEmail && <span className={erroClass}>{erroEmail}</span>}
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErroSenha(''); setErro('') }}
              className={inputClass(erroSenha)}
            />
            {erroSenha && <span className={erroClass}>{erroSenha}</span>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-4 text-sm">
          Esqueceu a senha?{' '}
          <button className="text-blue-600 hover:underline" onClick={() => setModalAberta(true)}>
            Redefinir senha
          </button>
        </p>

        <div className="mt-6 flex flex-col items-center">
          <label htmlFor="darkModeLogin" className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="darkModeLogin"
              checked={theme === 'dark'}
              onChange={toggleTheme}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:bg-blue-600 transition-colors"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
          </label>
          <span className="mt-2 text-sm text-gray-700 dark:text-gray-300 select-none">
            Tema escuro
          </span>
        </div>
      </div>

      {modalAberta && <ModalRedefinirSenha isOpen={modalAberta} onClose={() => setModalAberta(false)} />}
    </div>
  )
}