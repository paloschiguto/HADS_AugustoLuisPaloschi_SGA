import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA/redefinirSenha',
})

export const solicitarCodigo = async (email) => {
  try {
    const res = await api.post('/solicitar', { email })
    return res.data
  } catch (err) {
    console.error('Erro ao solicitar código:', err)
    throw err
  }
}

export const redefinirSenha = async (email, codigo, novaSenha) => {
  try {
    const res = await api.post('/redefinir', { email, codigo, novaSenha })
    return res.data
  } catch (err) {
    console.error('Erro ao redefinir senha:', err)
    throw err
  }
}
