// dashboardService.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA',
  withCredentials: true
})

// Funções já existentes
export const fetchUsuarios = async () => {
  try {
    const res = await api.get('/usuarios')
    return res.data.sort((a, b) => a.nome.localeCompare(b.nome))
  } catch (err) {
    console.error('Erro ao buscar usuários:', err)
    return []
  }
}

export const fetchTiposUsuarios = async () => {
  try {
    const res = await api.get('/tipos')
    return res.data
  } catch (err) {
    console.error('Erro ao buscar tipos de usuários:', err)
    return []
  }
}

// FUNÇÕES PARA MÉDICO

export const fetchEstatisticasMedico = async () => {
  try {
    const res = await api.get('/dashboard/medico/estatisticas')
    return res.data
  } catch (err) {
    console.error('Erro ao buscar estatísticas do médico:', err)
    return { meusAtendimentos: 0, meusPendentes: 0, totalAtendimentos: 0 }
  }
}

export const fetchAtendimentosRecentesMedico = async () => {
  try {
    const res = await api.get('/dashboard/medico/recentes')
    return res.data
  } catch (err) {
    console.error('Erro ao buscar atendimentos recentes:', err)
    return []
  }
}


