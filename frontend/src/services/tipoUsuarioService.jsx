import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA',
})

export const fetchTipos = async (token) => {
  const res = await api.get('/tipos', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.sort((a, b) => a.descricao.localeCompare(b.descricao))
}

export const criarTipo = async (tipoData, token) => {
  const res = await api.post('/tipos', tipoData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const atualizarTipo = async (id, tipoData, token) => {
  const res = await api.put(`/tipos/${id}`, tipoData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const excluirTipo = async (id, token) => {
  const res = await api.delete(`/tipos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}
