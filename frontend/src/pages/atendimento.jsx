import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import Modal from '../components/modal'
import Select from 'react-select'
import {
  fetchAtendimentos,
  createAtendimento,
  atualizarAtendimento,
  excluirAtendimento
} from '../services/atendimentoService'
import { fetchPacientes } from '../services/pacienteService'
import { fetchUsuarios } from '../services/usuarioService'
import { fetchMedicamentos } from '../services/medicamentoService'

export const Atendimentos = () => {
  const [atendimentos, setAtendimentos] = useState([])
  const [modalAberto, setModalAberto] = useState(false)
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null)

  const [usuarioId, setUsuarioId] = useState('')
  const [pacienteId, setPacienteId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [obs, setObs] = useState('')
  const [finalizado, setFinalizado] = useState(false)
  const [medicamentosIds, setMedicamentosIds] = useState([])

  const [usuarios, setUsuarios] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [medicamentos, setMedicamentos] = useState([])

  const [erros, setErros] = useState({})

  const carregarDados = async () => {
    try {
      setAtendimentos(await fetchAtendimentos())
      setUsuarios(await fetchUsuarios())
      setPacientes(await fetchPacientes())
      setMedicamentos(await fetchMedicamentos())
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const abrirModal = (atendimento = null) => {
    if (atendimento) {
      setAtendimentoSelecionado(atendimento)
      setUsuarioId(atendimento.usuId || '')
      setPacienteId(atendimento.pacId || '')
      setDescricao(atendimento.descricao || '')
      setObs(atendimento.obs || '')
      setFinalizado(atendimento.finalizado || false)
      setMedicamentosIds(atendimento.medicamentos?.map(m => m) || [])
    } else {
      setAtendimentoSelecionado(null)
      setUsuarioId('')
      setPacienteId('')
      setDescricao('')
      setObs('')
      setFinalizado(false)
      setMedicamentosIds([])
    }
    setErros({})
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setAtendimentoSelecionado(null)
    setErros({})
  }

  const validarCampos = () => {
    const novosErros = {}
    if (!usuarioId) novosErros.usuarioId = 'Selecione um usuário'
    if (!pacienteId) novosErros.pacienteId = 'Selecione um paciente'
    if (!descricao) novosErros.descricao = 'Descrição é obrigatória'
    return novosErros
  }

  const salvarAtendimento = async () => {
    const validacao = validarCampos()
    if (Object.keys(validacao).length) {
      setErros(validacao)
      return
    }

    const payload = {
      usuId: usuarioId,
      pacId: pacienteId,
      descricao,
      obs,
      finalizado,
      medicamentos: medicamentosIds
    }


    try {
      if (atendimentoSelecionado) {
        await atualizarAtendimento(atendimentoSelecionado.id, payload)
      } else {
        await createAtendimento(payload)
      }
      await carregarDados()
      fecharModal()
    } catch (err) {
      console.error('Erro ao salvar atendimento:', err)
    }
  }

  const confirmarExclusao = async () => {
    if (!atendimentoSelecionado) return
    try {
      await excluirAtendimento(atendimentoSelecionado.id)
      await carregarDados()
      fecharModal()
    } catch (err) {
      console.error('Erro ao excluir atendimento:', err)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-center text-textPrimary dark:text-gray-200">
        Atendimentos
      </h1>

      <div className="max-w-6xl mx-auto flex justify-end mb-6">
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Novo Atendimento
        </button>
      </div>

      {/* Cabeçalho */}
      <div className="max-w-6xl mx-auto grid grid-cols-[80px_200px_200px_200px_150px_100px] gap-4 px-4 py-2 font-semibold bg-gray-100 dark:bg-gray-700 rounded-t">
        <span>Código</span>
        <span>Usuário</span>
        <span>Paciente</span>
        <span>Descrição</span>
        <span>Status</span>
        <span>Ações</span>
      </div>

      {/* Lista */}
      <ul className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-b shadow-md divide-y divide-gray-200 dark:divide-gray-700">
        {atendimentos.map((a) => (
          <li
            key={a.id}
            className="grid grid-cols-[80px_200px_200px_200px_150px_100px] gap-4 items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded"
          >
            <span className="text-textPrimary dark:text-gray-100">{a.id}</span>
            <span className="text-textPrimary dark:text-gray-100">{a.usuario?.nome}</span>
            <span className="text-textPrimary dark:text-gray-100">{a.paciente?.nome}</span>
            <span className="text-gray-500 dark:text-gray-300">{a.descricao}</span>
            <span className="text-gray-500 dark:text-gray-300">{a.finalizado ? 'Finalizado' : 'Aberto'}</span>
            <button
              onClick={() => abrirModal(a)}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 gap-1 transition-colors"
            >
              <Pencil size={18} className="m-0 p-0" />
              Editar
            </button>
          </li>
        ))}
      </ul>

      {/* Modal */}
      <Modal
        isOpen={modalAberto}
        title={atendimentoSelecionado ? 'Editar Atendimento' : 'Novo Atendimento'}
        onClose={fecharModal}
      >
        {/** Mensagem de erro acima do select */}
        {erros.usuarioId && <span className="text-red-500 text-sm mb-1 block">{erros.usuarioId}</span>}
        <select
          value={usuarioId}
          onChange={(e) => setUsuarioId(e.target.value)}
          className={`border rounded-md w-full p-2 mb-4 bg-white dark:bg-gray-700 text-textPrimary dark:text-gray-100
            ${erros.usuarioId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
        >
          <option value="">Selecione o usuário</option>
          {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
        </select>

        {erros.pacienteId && <span className="text-red-500 text-sm mb-1 block">{erros.pacienteId}</span>}
        <select
          value={pacienteId}
          onChange={(e) => setPacienteId(e.target.value)}
          className={`border rounded-md w-full p-2 mb-4 bg-white dark:bg-gray-700 text-textPrimary dark:text-gray-100
            ${erros.pacienteId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
        >
          <option value="">Selecione o paciente</option>
          {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>

        {erros.descricao && <span className="text-red-500 text-sm mb-1 block">{erros.descricao}</span>}
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição"
          className={`border rounded-md w-full p-2 mb-4 bg-white dark:bg-gray-700 text-textPrimary dark:text-gray-100
            ${erros.descricao ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
        />

        <input
          type="text"
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          placeholder="Observação"
          className="border rounded-md w-full p-2 mb-4 bg-white dark:bg-gray-700 text-textPrimary dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />

        <Select
          isMulti
          options={medicamentos.map(m => ({ value: m.id, label: m.descricao }))}
          value={medicamentos.filter(m => medicamentosIds.includes(m.id)).map(m => ({ value: m.id, label: m.descricao }))}
          onChange={(selected) => setMedicamentosIds(selected.map(s => s.value))}
          placeholder="Selecione medicamentos..."
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

        <div className="flex justify-between items-center">
          {atendimentoSelecionado && (
            <button
              onClick={confirmarExclusao}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
            >
              Excluir
            </button>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={fecharModal}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white transition"
            >
              Cancelar
            </button>
            <button
              onClick={salvarAtendimento}
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
