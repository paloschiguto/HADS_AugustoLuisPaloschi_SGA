import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA',
  withCredentials: true,
})

export const fetchUsuarios = async () => {
  const res = await api.get('/usuarios')
  return res.data.sort((a, b) => a.nome.localeCompare(b.nome))
}

export const createUsuario = async (usuario) => {
  const res = await api.post('/usuarios', usuario)
  return res.data
}

export const atualizarUsuario = async (id, usuario) => {
  const res = await api.put(`/usuarios/${id}`, usuario)
  return res.data
}

export const excluirUsuario = async (id) => {
  const res = await api.delete(`/usuarios/${id}`)
  return res.data
}
