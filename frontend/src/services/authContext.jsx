import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const res = await axios.get('http://localhost:3000/SGA/me', {
          withCredentials: true
        })
        setUser(res.data)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    carregarUsuario()
  }, [])

  const login = async (email, senha) => {
  try {
    const res = await axios.post(
      'http://localhost:3000/SGA/login',
      { email, senha },
      { withCredentials: true }
    )
    setUser(res.data.usuario)
  } catch (err) {
    const status = err.response?.status
    const message = err.response?.data?.error

    if (status === 401) {
      throw new Error('Email ou senha incorretos ou usuário inativo.')
    } else if (status === 400) {
      throw new Error('Preencha todos os campos')
    } else if (status === 500) {
      throw new Error('Erro no servidor. Tente novamente mais tarde.')
    } else {
      throw new Error(message || 'Erro ao fazer login')
    }
  }
}


  const logout = async () => {
    try {
      await axios.post('http://localhost:3000/SGA/logout', {}, { withCredentials: true })
    } catch (err) { }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
