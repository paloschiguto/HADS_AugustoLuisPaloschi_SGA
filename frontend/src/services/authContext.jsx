import { createContext, useState, useContext } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || '')

  const login = async (email, senha) => {
    try {
      const res = await axios.post('http://localhost:3000/SGA/login', { email, senha })
      setUser(res.data.usuario)
      setToken(res.data.token)
      localStorage.setItem('token', res.data.token)
      return res.data.usuario
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) throw new Error('Email ou senha incorretos.')
        if (err.response.status === 400) throw new Error(err.response.data.error || 'Dados incompletos.')
        throw new Error('Erro ao tentar fazer login. Tente novamente.')
      } else {
        throw new Error('Erro de conexão. Verifique o servidor.')
      }
    }
  }

  const logout = () => {
    setUser(null)
    setToken('')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
