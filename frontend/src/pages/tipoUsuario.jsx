import { useEffect, useState } from 'react'
import Select from 'react-select'
import { Pencil } from 'lucide-react'
import { useAuth } from '../services/authContext'
import { fetchTipos, criarTipo, atualizarTipo, excluirTipo, fetchPermissoes } from '../services/tipoUsuarioService'
import Modal from '../components/modal'

export const TiposUsuario = () => {
  const { user } = useAuth()
  const [tipos, setTipos] = useState([])
  const [permissoes, setPermissoes] = useState([])
  const [descricao, setDescricao] = useState('')
  const [permissoesIds, setPermissoesIds] = useState([])
  const [tipoSelecionado, setTipoSelecionado] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [erroDescricao, setErroDescricao] = useState('')

  const carregarTipos = async () => {
    const data = await fetchTipos()
    setTipos(data)
  }

  const carregarPermissoes = async () => {
    const data = await fetchPermissoes()
    setPermissoes(data)
  }

  useEffect(() => {
    carregarTipos()
    carregarPermissoes()
  }, [])

  const abrirModal = (tipo = null) => {
    if (tipo) {
      setDescricao(tipo.descricao)
      setTipoSelecionado(tipo)
      setPermissoesIds(tipo.permissoes?.map(p => p.id) || [])
    } else {
      setDescricao('')
      setTipoSelecionado(null)
      setPermissoesIds([])
    }
    setErroDescricao('')
    setModalAberto(true)
  }

  const fecharModal = () => {
    setDescricao('')
    setTipoSelecionado(null)
    setPermissoesIds([])
    setErroDescricao('')
    setModalAberto(false)
  }

  const salvarTipo = async () => {
    if (!descricao.trim()) {
      setErroDescricao('Descrição é obrigatória')
      return
    }

    try {
      if (tipoSelecionado) {
        await atualizarTipo(tipoSelecionado.id, { descricao, permissoesIds })
      } else {
        await criarTipo({ descricao, permissoesIds })
      }
      await carregarTipos()
      fecharModal()
    } catch (err) {
      console.error('Erro ao salvar tipo:', err)
    }
  }

  const confirmarExclusao = async () => {
    if (!tipoSelecionado) return
    await excluirTipo(tipoSelecionado.id)
    await carregarTipos()
    fecharModal()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-center text-textPrimary dark:text-gray-200">
        Tipos de Usuário
      </h1>

      <div className="max-w-2xl mx-auto flex justify-end mb-4">
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Novo Tipo
        </button>
      </div>

      <ul className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded shadow divide-y divide-gray-200 dark:divide-gray-700">
        {tipos.map(tipo => (
          <li
            key={tipo.id}
            className="grid grid-cols-[1fr_100px] items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-textPrimary dark:text-gray-100">{tipo.descricao}</span>
            <button
              onClick={() => abrirModal(tipo)}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 gap-1 transition-colors"
            >
              <Pencil size={18} />
              Editar
            </button>
          </li>
        ))}
      </ul>

      <Modal
        isOpen={modalAberto}
        title={tipoSelecionado ? 'Editar Tipo' : 'Novo Tipo'}
        onClose={fecharModal}
      >
        {erroDescricao && <span className="text-red-500 text-sm mb-1 block">{erroDescricao}</span>}
        <input
          type="text"
          value={descricao}
          onChange={(e) => { setDescricao(e.target.value); setErroDescricao('') }}
          placeholder="Descrição do tipo"
          className={`border rounded-md w-full p-2 mb-4 dark:bg-gray-700 dark:text-white
            ${erroDescricao ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
        />

        <Select
          isMulti
          options={permissoes.map(p => ({ value: p.id, label: p.nome }))}
          value={permissoes.filter(p => permissoesIds.includes(p.id)).map(p => ({ value: p.id, label: p.nome }))}
          onChange={(selected) => setPermissoesIds(selected.map(s => s.value))}
          placeholder="Selecione permissões..."
          className="mb-4 text-textPrimary"
          styles={{
            control: (base, state) => ({
              ...base,
              backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
              borderColor: state.isFocused ? '#3B82F6' : document.documentElement.classList.contains('dark') ? '#4B5563' : '#D1D5DB',
              boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none'
            }),
            menu: (base) => ({ ...base, backgroundColor: document.documentElement.classList.contains('dark') ? '#1F2937' : 'white' }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? '#3B82F6' : document.documentElement.classList.contains('dark') ? '#1F2937' : 'white',
              color: state.isFocused ? 'white' : document.documentElement.classList.contains('dark') ? '#F9FAFB' : '#111827'
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: document.documentElement.classList.contains('dark') ? '#4B5563' : '#E5E7EB'
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: document.documentElement.classList.contains('dark') ? '#F9FAFB' : '#111827'
            }),
            multiValueRemove: (base) => ({
              ...base,
              color: document.documentElement.classList.contains('dark') ? '#F9FAFB' : '#111827',
              ':hover': { backgroundColor: '#EF4444', color: 'white' }
            })
          }}
        />

        <div className="flex justify-between">
          {tipoSelecionado && (
            <button
              onClick={confirmarExclusao}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Excluir
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button
              onClick={fecharModal}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition"
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
