import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA',
  withCredentials: true, 
})

export const fetchTipos = async () => {
  const res = await api.get('/tipos')
  return res.data.sort((a, b) => a.descricao.localeCompare(b.descricao))
}

export const criarTipo = async (tipoData) => {
  const res = await api.post('/tipos', tipoData)
  return res.data
}

export const atualizarTipo = async (id, tipoData) => {
  const res = await api.put(`/tipos/${id}`, tipoData)
  return res.data
}

export const excluirTipo = async (id) => {
  const res = await api.delete(`/tipos/${id}`)
  return res.data
}