import axios from 'axios'

const API_URL = 'http://localhost:3000/SGA/redefinirSenha'

export const solicitarCodigo = async (email) => {
  try {
    const res = await axios.post(`${API_URL}/solicitar`, { email })
    return res.data
  } catch (error) {
    throw error.response?.data || { error: 'Erro ao solicitar código' }
  }
}

export const redefinirSenha = async (email, codigo, novaSenha) => {
  try {
    const res = await axios.post(`${API_URL}/redefinir`, { email, codigo, novaSenha })
    return res.data
  } catch (error) {
    throw error.response?.data || { error: 'Erro ao redefinir senha' }
  }
}
