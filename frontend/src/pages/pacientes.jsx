import { useEffect, useState } from 'react'
import {
  Pencil,
  Plus,
  Search,
  User,
  Calendar,
  Trash2,
  Shield
} from 'lucide-react'
import { fetchPacientes, criarPaciente, atualizarPaciente } from '../services/pacienteService'
import { fetchUsuarios } from '../services/usuarioService'
import Modal from '../components/modal'
import { motion, AnimatePresence } from 'framer-motion'

export const Pacientes = () => {
  const [pacientes, setPacientes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  const [nome, setNome] = useState('')
  const [dataNasc, setDataNasc] = useState('')
  const [respId, setRespId] = useState('')

  const [erros, setErros] = useState({})
  const [mostrarErroModal, setMostrarErroModal] = useState(false)
  const [mensagemErroModal, setMensagemErroModal] = useState('')

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [pacData, usuData] = await Promise.all([
        fetchPacientes(),
        fetchUsuarios()
      ])
      setPacientes(pacData.sort((a, b) => a.nome.localeCompare(b.nome)))
      setUsuarios(usuData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const listaFiltrada = pacientes.filter(p => {
    if (!busca) return true
    const termo = busca.toLowerCase()
    return (
      p.nome.toLowerCase().includes(termo) ||
      p.id.toString().includes(termo)
    )
  })

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
    setModalAberto(false)
    setPacienteSelecionado(null)
    setErros({})
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
      await carregarDados()
      fecharModal()
    } catch (err) {
      console.error(err)
    }
  }

  const confirmarExclusao = async () => {
    if (!pacienteSelecionado) return
    try {
      await fetch(`/pacientes/${pacienteSelecionado.id}`, { method: 'DELETE' })

      await carregarDados()
      fecharModal()
    } catch (err) {
      setMensagemErroModal('Não foi possível excluir. Verifique se o paciente possui atendimentos vinculados.')
      setMostrarErroModal(true)
    }
  }

  const fecharErroModal = () => {
    setMostrarErroModal(false)
    setMensagemErroModal('')
  }

  // Input Helper
  const inputClass = (hasError) => `
        w-full p-2.5 rounded-lg bg-white dark:bg-gray-700 
        border ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
        focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm dark:text-white
    `

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">

      {/* --- CABEÇALHO --- */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary dark:text-gray-100 flex items-center gap-2">
            Pacientes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Gerencie o cadastro de residentes.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Barra de Busca */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm dark:text-white"
            />
          </div>

          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition shadow-md whitespace-nowrap text-sm"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Novo Paciente</span>
          </button>
        </div>
      </div>

      {/* --- TABELA --- */}
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                <th className="px-6 py-4 w-20">Código</th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Data Nasc.</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Carregando pacientes...</td></tr>
              ) : listaFiltrada.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Nenhum paciente encontrado.</td></tr>
              ) : (
                listaFiltrada.map((p) => {
                  // Encontra nome do responsável
                  const responsavel = usuarios.find(u => u.id === p.respId)?.nome || '-'

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{p.id}</td>
                      <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{p.nome}</td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {p.dataNasc ? new Date(p.dataNasc).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {responsavel}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => abrirModal(p)}
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE CADASTRO --- */}
      <AnimatePresence>
        {modalAberto && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={fecharModal} />

            <Modal
              isOpen={modalAberto}
              title={pacienteSelecionado ? 'Editar Paciente' : 'Novo Paciente'}
              onClose={fecharModal}
              maxWidth="max-w-lg w-full"
            >
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nome Completo *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Ex: Maria da Silva"
                      value={nome}
                      onChange={(e) => { setNome(e.target.value); setErros({ ...erros, nome: '' }) }}
                      className={`${inputClass(erros.nome)} pl-10`}
                      autoFocus
                    />
                  </div>
                  {erros.nome && <span className="text-red-500 text-xs mt-1 block">{erros.nome}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Data Nascimento *</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dataNasc}
                        onChange={(e) => { setDataNasc(e.target.value); setErros({ ...erros, dataNasc: '' }) }}
                        className={inputClass(erros.dataNasc)}
                      />
                    </div>
                    {erros.dataNasc && <span className="text-red-500 text-xs mt-1 block">{erros.dataNasc}</span>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Responsável</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
                      <select
                        value={respId}
                        onChange={(e) => setRespId(Number(e.target.value))}
                        className={`${inputClass(false)} pl-10 appearance-none`}
                      >
                        <option value="">Selecione...</option>
                        {usuarios.map((u) => (
                          <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* RODAPÉ DA MODAL */}
                <div className="flex justify-between items-center pt-4 mt-2 border-t dark:border-gray-700">
                  <div>
                    {pacienteSelecionado && (
                      <button
                        onClick={confirmarExclusao}
                        className="bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
                      >
                        <Trash2 size={16} /> Excluir
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={fecharModal}
                      className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={salvarPaciente}
                      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition shadow-md"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL DE ERRO --- */}
      <AnimatePresence>
        {mostrarErroModal && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={fecharErroModal} />

            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-sm text-center relative z-10"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Erro ao Excluir</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                {mensagemErroModal}
              </p>
              <button
                onClick={fecharErroModal}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition"
              >
                Entendi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}