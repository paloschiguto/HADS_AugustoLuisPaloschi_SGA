import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA',
  withCredentials: true
})

export const fetchMedicamentos = async () => {
  try {
    const res = await api.get('/medicamentos')
    return res.data
  } catch (err) {
    console.error('Erro ao buscar medicamentos:', err)
    return []
  }
}

export const createMedicamento = async (medicamento) => {
  try {
    const res = await api.post('/medicamentos', medicamento)
    return res.data
  } catch (err) {
    console.error('Erro ao criar medicamento:', err)
    throw err
  }
}

export const atualizarMedicamento = async (id, medicamento) => {
  try {
    const res = await api.put(`/medicamentos/${id}`, medicamento)
    return res.data
  } catch (err) {
    console.error('Erro ao atualizar medicamento:', err)
    throw err
  }
}

export const excluirMedicamento = async (id) => {
  try {
    const res = await api.delete(`/medicamentos/${id}`)
    return res.data
  } catch (err) {
    console.error('Erro ao excluir medicamento:', err)
    throw err
  }
}
