import { useState } from 'react'
import { useAuth } from '../services/authContext'
import { ModalRedefinirSenha } from '../components/ModalRedefinirSenha'
import { useNavigate } from 'react-router-dom'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [modalAberta, setModalAberta] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, senha)
      navigate('/dashboard') // <-- redireciona para o dashboard
    } catch (err) {
      setErro(err.message) // mostra a mensagem do erro do authContext
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {erro && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4 text-sm">
          Esqueceu a senha?{' '}
          <button
            className="text-blue-600 hover:underline"
            onClick={() => setModalAberta(true)}
          >
            Redefinir senha
          </button>
        </p>
      </div>

      {modalAberta && (
        <ModalRedefinirSenha
          isOpen={modalAberta}
          onClose={() => setModalAberta(false)}
        />
      )}
    </div>
  )
}
