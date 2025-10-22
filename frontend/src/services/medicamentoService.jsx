import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA',
  withCredentials: true
})

const getAuthHeader = () => {
  const token = localStorage.getItem('token') 
  return { Authorization: `Bearer ${token}` }
}

export const fetchMedicamentos = async () => {
  const res = await api.get('/medicamentos')
  return res.data
}

export const createMedicamento = async (medicamento) => {
  const res = await api.post('/medicamentos', medicamento, { headers: getAuthHeader() })
  return res.data
}

export const atualizarMedicamento = async (id, medicamento) => {
  const res = await api.put(`/medicamentos/${id}`, medicamento, { headers: getAuthHeader() })
  return res.data
}

export const excluirMedicamento = async (id) => {
  const res = await api.delete(`/medicamentos/${id}`, { headers: getAuthHeader() })
  return res.data
}
