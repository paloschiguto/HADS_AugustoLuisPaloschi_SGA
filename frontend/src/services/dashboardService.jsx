import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA',
})

export const fetchUsuarios = async (token) => {
  const res = await api.get('/usuarios', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
}

export const fetchTiposUsuarios = async (token) => {
  const res = await api.get('/tipos', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
}
