import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA/redefinirSenha',
})

export const solicitarCodigo = async (email) => {
  try {
    const res = await api.post('/solicitar', { email })
    return res.data
  } catch (err) {
    const msg = err.response?.data?.error || err.response?.data?.message || 'Erro desconhecido'
    throw new Error(msg)
  }

}

export const redefinirSenha = async (email, codigo, novaSenha) => {
  try {
    const res = await api.post('/redefinir', { email, codigo, novaSenha })
    return res.data
  } catch (err) {
    const backendMsg = err.response?.data?.error || err.response?.data?.message || 'Erro ao redefinir senha'
    throw new Error(backendMsg)
  }
}

