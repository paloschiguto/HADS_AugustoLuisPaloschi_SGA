import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA',
  withCredentials: true 
})

export const fetchUsuarios = async () => {
  const res = await api.get('/usuarios')
  return res.data.sort((a, b) => a.nome.localeCompare(b.nome))
}

export const fetchTiposUsuarios = async () => {
  const res = await api.get('/tipos')
  return res.data
}
