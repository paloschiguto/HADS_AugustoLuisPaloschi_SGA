import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { useAuth } from '../services/authContext'
import { fetchTipos, criarTipo, atualizarTipo, excluirTipo } from '../services/tipoUsuarioService'
import Modal from '../components/modal'

export const TiposUsuario = () => {
  const { token, user } = useAuth()
  const [tipos, setTipos] = useState([])
  const [descricao, setDescricao] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [tipoSelecionado, setTipoSelecionado] = useState(null)

  const carregarTipos = async () => {
    const data = await fetchTipos(token)
    const ordenados = data.sort((a, b) => a.descricao.localeCompare(b.descricao))
    setTipos(ordenados)
  }

  useEffect(() => {
    if (token) carregarTipos()
  }, [token])

  const abrirModal = (tipo = null) => {
    if (tipo) {
      setDescricao(tipo.descricao)
      setEditandoId(tipo.id)
      setTipoSelecionado(tipo)
    } else {
      setDescricao('')
      setEditandoId(null)
      setTipoSelecionado(null)
    }
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setDescricao('')
    setEditandoId(null)
    setTipoSelecionado(null)
  }

  const salvarTipo = async () => {
    if (descricao.trim() === '') return

    if (editandoId) {
      await atualizarTipo(editandoId, { descricao, modifiedBy: user.id }, token)
    } else {
      await criarTipo({ descricao, createdBy: user.id }, token)
    }

    await carregarTipos()
    fecharModal()
  }

  const confirmarExclusao = async () => {
    if (!tipoSelecionado) return
    await excluirTipo(tipoSelecionado.id, token)
    await carregarTipos()
    fecharModal()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-center">Tipos de Usuário</h1>

      <div className="max-w-xl mx-auto flex justify-end mb-6">
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Novo Tipo
        </button>
      </div>


      <ul className="max-w-xl mx-auto bg-white rounded-lg shadow-md divide-y divide-gray-200">
        {tipos.map((tipo) => (
          <li key={tipo.id} className="flex justify-between items-center p-4">
            <span>{tipo.descricao}</span>
            <button
              onClick={() => abrirModal(tipo)}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Pencil size={18} />
              Editar
            </button>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={modalAberto}
        title={editandoId ? 'Editar Tipo de Usuário' : 'Novo Tipo de Usuário'}
        onClose={fecharModal}
      >
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição"
          className="border rounded-md w-full p-2 mb-4"
        />

        <div className="flex justify-between items-center">
          {editandoId ? (
            <button
              onClick={confirmarExclusao}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
            >
              Excluir
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-2">
            <button
              onClick={fecharModal}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              onClick={salvarTipo}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Salvar
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
