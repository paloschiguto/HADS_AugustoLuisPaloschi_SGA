import axios from 'axios'

const API_URL = 'http://localhost:3000/SGA'

export const fetchAtendimentos = async () => {
  const { data } = await axios.get(`${API_URL}/atendimentos`, { withCredentials: true })
  return data
}

export const createAtendimento = async (payload) => {
  const { data } = await axios.post(`${API_URL}/atendimentos`, payload, { withCredentials: true })
  return data
}

export const atualizarAtendimento = async (id, payload) => {
  const { data } = await axios.put(`${API_URL}/atendimentos/${id}`, payload, { withCredentials: true })
  return data
}

export const excluirAtendimento = async (id) => {
  const { data } = await axios.delete(`${API_URL}/atendimentos/${id}`, { withCredentials: true })
  return data
}

export const createMedicamentoAtend = async (payload) => {
  const { data } = await axios.post(`${API_URL}/medicamentosAtend`, payload, { withCredentials: true })
  return data
}

export const fetchMedicamentos = async () => {
  const { data } = await axios.get(`${API_URL}/medicamentos`, { withCredentials: true })
  return data
}