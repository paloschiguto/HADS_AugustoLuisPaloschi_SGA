import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { fetchPacientes, criarPaciente, atualizarPaciente } from '../services/pacienteService'
import { fetchUsuarios } from '../services/usuarioService'
import Modal from '../components/modal'
import { motion, AnimatePresence } from 'framer-motion'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export const Pacientes = () => {
  const [pacientes, setPacientes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)

  const [nome, setNome] = useState('')
  const [dataNasc, setDataNasc] = useState('')
  const [respId, setRespId] = useState('')

  const [erros, setErros] = useState({})
  const [erroModal, setErroModal] = useState(false)
  const [mensagemErroModal, setMensagemErroModal] = useState('')

  const carregarPacientes = async () => {
    try {
      const data = await fetchPacientes()
      setPacientes(data.sort((a, b) => a.nome.localeCompare(b.nome)))
    } catch (err) {
      console.error(err)
    }
  }

  const carregarUsuarios = async () => {
    try {
      const data = await fetchUsuarios()
      setUsuarios(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    carregarPacientes()
    carregarUsuarios()
  }, [])

  const abrirModal = (paciente = null) => {
    if (paciente) {
      setNome(paciente.nome)
      setDataNasc(paciente.dataNasc?.slice(0, 10) || '')
      setRespId(paciente.respId || '')
      setPacienteSelecionado(paciente)
    } else {
      setNome('')
      setDataNasc('')
      setRespId('')
      setPacienteSelecionado(null)
    }
    setErros({})
    setModalAberto(true)
  }

  const fecharModal = () => {
    setNome('')
    setDataNasc('')
    setRespId('')
    setPacienteSelecionado(null)
    setErros({})
    setModalAberto(false)
  }

  const validarCampos = () => {
    const novosErros = {}
    if (!nome.trim()) novosErros.nome = 'Nome é obrigatório'
    if (!dataNasc) novosErros.dataNasc = 'Data de nascimento é obrigatória'
    return novosErros
  }

  const salvarPaciente = async () => {
    const validacao = validarCampos()
    if (Object.keys(validacao).length > 0) {
      setErros(validacao)
      return
    }

    const pacienteData = { nome, dataNasc, respId: respId || null }
    try {
      if (pacienteSelecionado) {
        await atualizarPaciente(pacienteSelecionado.id, pacienteData)
      } else {
        await criarPaciente(pacienteData)
      }
      await carregarPacientes()
      fecharModal()
    } catch (err) {
      console.error(err)
    }
  }

  const excluirPaciente = async () => {
    if (!pacienteSelecionado) return
    try {
      await fetch(`/pacientes/${pacienteSelecionado.id}`, { method: 'DELETE' })
      await carregarPacientes()
      fecharModal()
    } catch (err) {
      setMensagemErroModal('Não foi possível excluir o paciente.')
      setErroModal(true)
    }
  }

  const fecharErroModal = () => {
    setErroModal(false)
    setMensagemErroModal('')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-center text-textPrimary dark:text-gray-200">
        Pacientes
      </h1>

      <div className="max-w-4xl mx-auto flex justify-end mb-6">
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Novo Paciente
        </button>
      </div>

      {/* Cabeçalho */}
      <div className="max-w-4xl mx-auto grid grid-cols-[80px_300px_200px_100px] gap-4 px-3 py-2 font-semibold bg-gray-100 dark:bg-gray-700 rounded-t">
        <span>Código</span>
        <span>Nome</span>
        <span>Data de Nascimento</span>
        <span>Ações</span>
      </div>

      {/* Lista de pacientes */}
      <ul className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-b shadow-md divide-y divide-gray-200 dark:divide-gray-700">
        {pacientes.map((paciente) => (
          <li
            key={paciente.id}
            className="grid grid-cols-[80px_300px_200px_100px] gap-4 items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-textPrimary dark:text-gray-100">{paciente.id}</span>
            <span className="text-textPrimary dark:text-gray-100">{paciente.nome}</span>
            <span className="text-gray-500 dark:text-gray-300">
              {paciente.dataNasc ? new Date(paciente.dataNasc).toLocaleDateString('pt-BR') : '-'}
            </span>
            <button
              onClick={() => abrirModal(paciente)}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 gap-1 transition-colors"
            >
              <Pencil size={18} className="m-0 p-0" />
              Editar
            </button>
          </li>
        ))}
      </ul>

      {/* Modal de cadastro/alteração */}
      <AnimatePresence>
        {modalAberto && (
          <>
            {/* Fundo desfocado */}
            <motion.div
              className="fixed inset-0 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <Modal
              isOpen={modalAberto}
              title={pacienteSelecionado ? 'Editar Paciente' : 'Novo Paciente'}
              onClose={fecharModal}
            >
              {erros.nome && <span className="text-red-500 text-sm mb-1 block">{erros.nome}</span>}
              <input
                type="text"
                value={nome}
                onChange={(e) => { setNome(e.target.value); setErros({ ...erros, nome: '' }) }}
                placeholder="Nome completo"
                className={`border rounded-md w-full p-2 mb-2 dark:bg-gray-700 dark:text-white
                  ${erros.nome ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              />

              {erros.dataNasc && (
                <span className="text-red-500 text-sm mb-1 block">{erros.dataNasc}</span>
              )}

              {erros.dataNasc && (
                <span className="text-red-500 text-sm mb-1 block">{erros.dataNasc}</span>
              )}

              <div className="relative mb-2">
                <input
                  type="date"
                  value={dataNasc}
                  onChange={(e) => {
                    setDataNasc(e.target.value)
                    setErros({ ...erros, dataNasc: '' })
                  }}
                  className={`border rounded-md w-full p-2 pl-3 bg-white dark:bg-gray-700 
                        text-gray-900 dark:text-white
                        ${erros.dataNasc ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                        appearance-none`}
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300">
                  📅
                </span>
              </div>



              <select
                value={respId}
                onChange={(e) => setRespId(Number(e.target.value))}
                className="border rounded-md w-full p-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="">Selecione o responsável</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={fecharModal}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarPaciente}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Salvar
                </button>
              </div>
            </Modal>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
