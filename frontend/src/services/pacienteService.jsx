import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA',
  withCredentials: true,
})

export const fetchPacientes = async () => {
  const res = await api.get('/pacientes')
  return res.data
}

export const criarPaciente = async (pacienteData) => {
  const res = await api.post('/pacientes', pacienteData)
  return res.data
}

export const atualizarPaciente = async (id, pacienteData) => {
  const res = await api.put(`/pacientes/${id}`, pacienteData)
  return res.data
}
