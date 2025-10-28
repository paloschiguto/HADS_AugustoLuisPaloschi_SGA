import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/SGA',
  withCredentials: true
})

export const fetchUsuarios = async () => {
  try {
    const res = await api.get('/usuarios')
    return res.data.sort((a, b) => a.nome.localeCompare(b.nome))
  } catch (err) {
    console.error('Erro ao buscar usuários:', err)
    throw err
  }
}

export const fetchUsuarioById = async (id) => {
  try {
    const res = await api.get(`/usuarios/${id}`)
    return res.data
  } catch (err) {
    console.error('Erro ao buscar usuário:', err)
    throw err
  }
}

export const createUsuario = async ({ nome, email, senha, tpUsuId }) => {
  try {
    const res = await api.post('/usuarios', { nome, email, senha, tpUsuId })
    return res.data
  } catch (err) {
    console.error('Erro ao criar usuário:', err)
    throw err
  }
}

export const atualizarUsuario = async (id, { nome, email, senha, tpUsuId }) => {
  try {
    const res = await api.put(`/usuarios/${id}`, { nome, email, senha, tpUsuId })
    return res.data
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err)
    throw err
  }
}

export const excluirUsuario = async (id) => {
  try {
    const res = await api.delete(`/usuarios/${id}`)
    return res.data
  } catch (err) {
    console.error('Erro ao excluir usuário:', err)
    throw err
  }
}
