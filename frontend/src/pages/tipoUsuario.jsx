import { useEffect, useState } from 'react'
import Select from 'react-select'
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  Shield,
  Key,
  AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../services/authContext'
import { fetchTipos, criarTipo, atualizarTipo, excluirTipo, fetchPermissoes } from '../services/tipoUsuarioService'
import Modal from '../components/modal'

export const TiposUsuario = () => {
  const { user } = useAuth()

  const [tipos, setTipos] = useState([])
  const [permissoes, setPermissoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  const [modalAberto, setModalAberto] = useState(false)
  const [tipoSelecionado, setTipoSelecionado] = useState(null)

  const [descricao, setDescricao] = useState('')
  const [permissoesIds, setPermissoesIds] = useState([])
  const [erroDescricao, setErroDescricao] = useState('')

  const [mostrarErroModal, setMostrarErroModal] = useState(false)
  const [mensagemErroModal, setMensagemErroModal] = useState('')

  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'))

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [tiposData, permData] = await Promise.all([
        fetchTipos(),
        fetchPermissoes()
      ])
      setTipos(tiposData.sort((a, b) => a.descricao.localeCompare(b.descricao)))
      setPermissoes(permData)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const listaFiltrada = tipos.filter(t => {
    if (!busca) return true
    const termo = busca.toLowerCase()
    return (
      t.descricao.toLowerCase().includes(termo) ||
      t.id.toString().includes(termo)
    )
  })

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
      await carregarDados()
      fecharModal()
    } catch (err) {
      console.error('Erro ao salvar tipo:', err)
    }
  }

  const confirmarExclusao = async () => {
    if (!tipoSelecionado) return

    try {
      await excluirTipo(tipoSelecionado.id)
      await carregarDados()
      fecharModal()
    } catch (err) {
      console.error('Erro ao excluir tipo:', err)
      if (err.response && err.response.status === 500) {
        setMensagemErroModal('Este perfil está vinculado a usuários e não pode ser excluído.')
      } else {
        setMensagemErroModal('Erro ao excluir tipo. Tente novamente mais tarde.')
      }
      setMostrarErroModal(true)
    }
  }

  const fecharErroModal = () => {
    setMostrarErroModal(false)
    setMensagemErroModal('')
  }

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDarkMode ? '#374151' : 'white',
      borderColor: state.isFocused ? '#3B82F6' : isDarkMode ? '#4B5563' : '#D1D5DB',
      minHeight: '38px',
      borderRadius: '0.375rem'
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999 
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? '#1F2937' : 'white'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#3B82F6' : 'transparent',
      color: state.isFocused ? 'white' : isDarkMode ? '#F3F4F6' : '#111827',
      cursor: 'pointer'
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? '#4B5563' : '#DBEAFE',
      borderRadius: '4px'
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDarkMode ? '#F3F4F6' : '#1E40AF',
      fontSize: '0.85rem'
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDarkMode ? '#F3F4F6' : '#1E40AF',
      ':hover': { backgroundColor: '#EF4444', color: 'white' }
    })
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
      <div className="max-w-4xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary dark:text-gray-100 flex items-center gap-2">
            Tipos de Usuário
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Gerencie perfis de acesso e permissões do sistema.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Barra de Busca */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar perfil..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm dark:text-white"
            />
          </div>

          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition shadow-md whitespace-nowrap text-sm"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Novo Tipo</span>
          </button>
        </div>
      </div>

      {/* --- TABELA --- */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                <th className="px-6 py-4 w-20">Código</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">Carregando tipos...</td></tr>
              ) : listaFiltrada.length === 0 ? (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">Nenhum perfil encontrado.</td></tr>
              ) : (
                listaFiltrada.map((tipo) => (
                  <tr key={tipo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{tipo.id}</td>
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        {tipo.descricao}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => abrirModal(tipo)}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      <AnimatePresence>
        {modalAberto && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={fecharModal} />

            <Modal
              isOpen={modalAberto}
              title={tipoSelecionado ? 'Editar Tipo' : 'Novo Tipo'}
              onClose={fecharModal}
              maxWidth="max-w-lg w-full"
            >
              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Descrição do Perfil *</label>
                  <input
                    type="text"
                    value={descricao}
                    onChange={(e) => { setDescricao(e.target.value); setErroDescricao('') }}
                    placeholder="Ex: Administrador"
                    className={inputClass(erroDescricao)}
                    autoFocus
                  />
                  {erroDescricao && <span className="text-red-500 text-xs mt-1 block">{erroDescricao}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Permissões de Acesso</label>
                  <Select
                    isMulti
                    placeholder="Selecione as permissões..."
                    options={permissoes.map(p => ({ value: p.id, label: p.nome }))}
                    value={permissoes
                      .filter(p => permissoesIds.includes(p.id))
                      .map(p => ({ value: p.id, label: p.nome }))
                    }
                    onChange={(selected) => setPermissoesIds(selected.map(s => s.value))}
                    styles={selectStyles}
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                  />
                </div>

                {/* RODAPÉ DA MODAL */}
                <div className="flex justify-between items-center pt-4 mt-2 border-t dark:border-gray-700">
                  <div>
                    {tipoSelecionado && (
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
                      onClick={salvarTipo}
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

      {/* --- MODAL ERRO --- */}
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
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Ação Bloqueada</h3>
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