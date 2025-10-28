import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA',
  withCredentials: true // garante envio de cookies em todas as requisições
})

export const fetchTipos = async () => {
  try {
    const res = await api.get('/tipos')
    return res.data.sort((a, b) => a.descricao.localeCompare(b.descricao))
  } catch (err) {
    console.error('Erro ao buscar tipos:', err)
    throw err
  }
}

export const fetchTipoById = async (id) => {
  try {
    const res = await api.get(`/tipos/${id}`)
    return res.data
  } catch (err) {
    console.error('Erro ao buscar tipo por ID:', err)
    throw err
  }
}

export const fetchPermissoes = async () => {
  try {
    const res = await api.get('/permissoes')
    return (res.data || []).sort((a, b) => a.nome.localeCompare(b.nome))
  } catch (err) {
    console.error('Erro ao buscar permissões:', err)
    throw err
  }
}

export const criarTipo = async ({ descricao, permissoesIds }) => {
  try {
    const res = await api.post('/tipos', { descricao, permissoesIds })
    return res.data
  } catch (err) {
    console.error('Erro ao criar tipo:', err)
    throw err
  }
}

export const atualizarTipo = async (id, { descricao, permissoesIds }) => {
  try {
    const res = await api.put(`/tipos/${id}`, { descricao, permissoesIds })
    return res.data
  } catch (err) {
    console.error('Erro ao atualizar tipo:', err)
    throw err
  }
}

export const excluirTipo = async (id) => {
  try {
    const res = await api.delete(`/tipos/${id}`)
    return res.data
  } catch (err) {
    console.error('Erro ao excluir tipo:', err)
    throw err
  }
}
