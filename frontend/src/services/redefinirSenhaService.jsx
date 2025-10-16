import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA/redefinirSenha',
})

export const solicitarCodigo = async (email) => {
  const res = await api.post('/solicitar', { email })
  return res.data
}

export const redefinirSenha = async (email, codigo, novaSenha) => {
  const res = await api.post('/redefinir', { email, codigo, novaSenha })
  return res.data
}
