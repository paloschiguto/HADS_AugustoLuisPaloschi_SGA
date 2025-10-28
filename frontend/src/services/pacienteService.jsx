import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA',
  withCredentials: true
})

export const fetchPacientes = async () => {
  try {
    const res = await api.get('/pacientes')
    return res.data
  } catch (err) {
    console.error('Erro ao buscar pacientes:', err)
    return []
  }
}

export const criarPaciente = async (pacienteData) => {
  try {
    const res = await api.post('/pacientes', pacienteData)
    return res.data
  } catch (err) {
    console.error('Erro ao criar paciente:', err)
    throw err
  }
}

export const atualizarPaciente = async (id, pacienteData) => {
  try {
    const res = await api.put(`/pacientes/${id}`, pacienteData)
    return res.data
  } catch (err) {
    console.error('Erro ao atualizar paciente:', err)
    throw err
  }
}

export const deletePaciente = async (id) => {
  try {
    const res = await api.delete(`/pacientes/${id}`)
    return res.data
  } catch (err) {
    console.error('Erro ao deletar paciente:', err)
    throw err
  }
}
