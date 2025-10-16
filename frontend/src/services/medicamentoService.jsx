import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA',
  withCredentials: true 
})

export const fetchMedicamentos = async () => {
  const res = await api.get('/medicamentos')
  return res.data
}

export const createMedicamento = async (medicamento) => {
  const res = await api.post('/medicamentos', medicamento)
  return res.data
}

export const atualizarMedicamento = async (id, medicamento) => {
  const res = await api.put(`/medicamentos/${id}`, medicamento)
  return res.data
}

export const excluirMedicamento = async (id) => {
  const res = await api.delete(`/medicamentos/${id}`)
  return res.data
}
