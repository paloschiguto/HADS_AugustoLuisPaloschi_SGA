import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA',
  withCredentials: true
})

export const fetchUsuarios = async () => {
  try {
    const res = await api.get('/usuarios')
    return res.data.sort((a, b) => a.nome.localeCompare(b.nome))
  } catch (err) {
    console.error('Erro ao buscar usuários:', err)
    return []
  }
}

export const fetchTiposUsuarios = async () => {
  try {
    const res = await api.get('/tipos')
    return res.data
  } catch (err) {
    console.error('Erro ao buscar tipos de usuários:', err)
    return []
  }
}