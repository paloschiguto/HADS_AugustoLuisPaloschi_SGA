import { useEffect, useState } from 'react'
import { useAuth } from '../services/authContext'
import { fetchTipos, criarTipo, atualizarTipo } from '../services/tipoUsuarioService'

export const TiposUsuario = () => {
  const { token, user } = useAuth()
  const [tipos, setTipos] = useState([])
  const [novaDescricao, setNovaDescricao] = useState('')

  const carregarTipos = async () => {
    const data = await fetchTipos(token)
    setTipos(data)
  }

  const handleCriar = async () => {
    if (!novaDescricao) return
    await criarTipo({ descricao: novaDescricao, createdBy: user.id }, token)
    setNovaDescricao('')
    carregarTipos()
  }

  const handleAtualizar = async (id, descricao) => {
    await atualizarTipo(id, { descricao, modifiedBy: user.id }, token)
    carregarTipos()
  }

  useEffect(() => {
    if (token) carregarTipos()
  }, [token])

  return (
    <div>
      <h2>Tipos de Usuário</h2>
      <input value={novaDescricao} onChange={e => setNovaDescricao(e.target.value)} placeholder="Nova descrição" />
      <button onClick={handleCriar}>Criar Tipo</button>
      <ul>
        {tipos.map(tipo => (
          <li key={tipo.id}>
            {tipo.descricao}
            <button onClick={() => handleAtualizar(tipo.id, prompt('Nova descrição', tipo.descricao))}>
              Editar
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
