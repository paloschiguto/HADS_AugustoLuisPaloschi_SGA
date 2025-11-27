import { useEffect, useState } from 'react'
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  Users as UsersIcon,
  Mail,
  Shield,
  Lock,
  User
} from 'lucide-react'
import { fetchUsuarios, createUsuario, atualizarUsuario, excluirUsuario } from '../services/usuarioService'
import { fetchTipos } from '../services/tipoUsuarioService'
import Modal from '../components/modal'
import { motion, AnimatePresence } from 'framer-motion'

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [tipos, setTipos] = useState([])
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [tpUsuId, setTpUsuId] = useState('')

  const [erros, setErros] = useState({})
  const [erroModal, setErroModal] = useState(false)
  const [mensagemErroModal, setMensagemErroModal] = useState('')

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [usersData, typesData] = await Promise.all([
        fetchUsuarios(),
        fetchTipos()
      ])
      setUsuarios(usersData.sort((a, b) => a.nome.localeCompare(b.nome)))
      setTipos(typesData)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const listaFiltrada = usuarios.filter(u => {
    if (!busca) return true
    const termo = busca.toLowerCase()
    return (
      u.nome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo) ||
      u.id.toString().includes(termo)
    )
  })

  const abrirModal = (usuario = null) => {
    if (usuario) {
      setNome(usuario.nome)
      setEmail(usuario.email)
      setTpUsuId(usuario.tpUsuId)
      setUsuarioSelecionado(usuario)
    } else {
      setNome('')
      setEmail('')
      setSenha('')
      setTpUsuId('')
      setUsuarioSelecionado(null)
    }
    setErros({})
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setUsuarioSelecionado(null)
    setErros({})
  }

  const validarCampos = () => {
    const novosErros = {}
    if (!nome.trim()) novosErros.nome = 'Nome é obrigatório'

    if (!email.trim()) novosErros.email = 'Email é obrigatório'
    else if (!/\S+@\S+\.\S+/.test(email)) novosErros.email = 'Email inválido'

    if (!tpUsuId) novosErros.tipo = 'Selecione um tipo de usuário'

    if (!usuarioSelecionado) {
      if (!senha) novosErros.senha = 'Senha é obrigatória'
      else if (senha.length < 8) novosErros.senha = 'Senha deve ter no mínimo 8 caracteres'
    }
    return novosErros
  }

  const salvarUsuario = async () => {
    const validacao = validarCampos()
    if (Object.keys(validacao).length > 0) {
      setErros(validacao)
      return
    }

    const usuarioData = { nome, email, senha, tpUsuId }
    try {
      if (usuarioSelecionado) await atualizarUsuario(usuarioSelecionado.id, usuarioData)
      else await createUsuario(usuarioData)

      await carregarDados()
      fecharModal()
    } catch (err) {
      setMensagemErroModal('Erro ao salvar usuário. Tente novamente.')
      setErroModal(true)
    }
  }

  const confirmarExclusao = async () => {
    if (!usuarioSelecionado) return
    try {
      await excluirUsuario(usuarioSelecionado.id)
      await carregarDados()
      fecharModal()
    } catch (err) {
      setMensagemErroModal('Não é possível excluir este usuário pois ele possui vínculos no sistema.')
      setErroModal(true)
    }
  }

  const fecharErroModal = () => {
    setErroModal(false)
    setMensagemErroModal('')
  }

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
            Usuários do Sistema
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Gerencie acessos de médicos, enfermeiros e administradores.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Barra de Busca */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar usuário..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm dark:text-white"
            />
          </div>

          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition shadow-md whitespace-nowrap text-sm"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Novo Usuário</span>
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
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Carregando usuários...</td></tr>
              ) : listaFiltrada.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Nenhum usuário encontrado.</td></tr>
              ) : (
                listaFiltrada.map((u) => {
                  const tipo = tipos.find(t => t.id === u.tpUsuId)
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{u.id}</td>
                      <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{u.nome}</td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{u.email}</td>
                      <td className="px-6 py-3">
                        <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-1 rounded text-xs font-medium border border-indigo-100 dark:border-indigo-800">
                          {tipo?.descricao || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => abrirModal(u)}
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
              title={usuarioSelecionado ? 'Editar Usuário' : 'Novo Usuário'}
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
                      placeholder="Ex: João Silva"
                      value={nome}
                      onChange={(e) => { setNome(e.target.value); setErros({ ...erros, nome: '' }) }}
                      className={`${inputClass(erros.nome)} pl-10`}
                      autoFocus
                    />
                  </div>
                  {erros.nome && <span className="text-red-500 text-xs mt-1 block">{erros.nome}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">E-mail *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="email"
                      placeholder="Ex: joao@sga.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErros({ ...erros, email: '' }) }}
                      className={`${inputClass(erros.email)} pl-10`}
                    />
                  </div>
                  {erros.email && <span className="text-red-500 text-xs mt-1 block">{erros.email}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tipo de Perfil *</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
                      <select
                        value={tpUsuId}
                        onChange={(e) => { setTpUsuId(Number(e.target.value)); setErros({ ...erros, tipo: '' }) }}
                        className={`${inputClass(erros.tipo)} pl-10 appearance-none`}
                      >
                        <option value="">Selecione...</option>
                        {tipos.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
                      </select>
                    </div>
                    {erros.tipo && <span className="text-red-500 text-xs mt-1 block">{erros.tipo}</span>}
                  </div>

                  {!usuarioSelecionado && (
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Senha *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                          type="password"
                          placeholder="********"
                          value={senha}
                          onChange={(e) => { setSenha(e.target.value); setErros({ ...erros, senha: '' }) }}
                          className={`${inputClass(erros.senha)} pl-10`}
                        />
                      </div>
                      {erros.senha && <span className="text-red-500 text-xs mt-1 block">{erros.senha}</span>}
                    </div>
                  )}
                </div>

                {/* RODAPÉ DA MODAL */}
                <div className="flex justify-between items-center pt-4 mt-2 border-t dark:border-gray-700">
                  <div>
                    {usuarioSelecionado && (
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
                      onClick={salvarUsuario}
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
        {erroModal && (
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