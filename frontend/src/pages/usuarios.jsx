import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import {
  fetchUsuarios,
  createUsuario,
  atualizarUsuario,
  excluirUsuario
} from '../services/usuarioService'
import Modal from '../components/modal'
import { fetchTipos } from '../services/tipoUsuarioService'
import { motion, AnimatePresence } from 'framer-motion'

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [tipos, setTipos] = useState([])
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [erroModal, setErroModal] = useState(false)
  const [mensagemErroModal, setMensagemErroModal] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'))

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [tpUsuId, setTpUsuId] = useState('')

  const [erroNome, setErroNome] = useState('')
  const [erroEmail, setErroEmail] = useState('')
  const [erroSenha, setErroSenha] = useState('')
  const [erroTipo, setErroTipo] = useState('')

  const carregarUsuarios = async () => {
    const data = await fetchUsuarios()
    setUsuarios(data.sort((a, b) => a.nome.localeCompare(b.nome)))
  }

  const carregarTipos = async () => {
    const data = await fetchTipos()
    setTipos(data)
  }

  useEffect(() => {
    carregarUsuarios()
    carregarTipos()
  }, [])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

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
    setErroNome('')
    setErroEmail('')
    setErroSenha('')
    setErroTipo('')
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setNome('')
    setEmail('')
    setSenha('')
    setTpUsuId('')
    setUsuarioSelecionado(null)
    setErroNome('')
    setErroEmail('')
    setErroSenha('')
    setErroTipo('')
  }

  const validarCampos = () => {
    let valido = true
    if (!nome.trim()) { setErroNome('Nome é obrigatório'); valido = false } else setErroNome('')
    if (!email.trim()) { setErroEmail('Email é obrigatório'); valido = false }
    else if (!/\S+@\S+\.\S+/.test(email)) { setErroEmail('Email inválido'); valido = false } else setErroEmail('')
    if (!tpUsuId) { setErroTipo('Selecione um tipo de usuário'); valido = false } else setErroTipo('')
    if (!usuarioSelecionado) {
      if (!senha) { setErroSenha('Senha é obrigatória'); valido = false }
      else if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
        setErroSenha('Senha deve ter pelo menos 8 caracteres, letras e números'); valido = false
      } else setErroSenha('')
    }
    return valido
  }

  const salvarUsuario = async () => {
    if (!validarCampos()) return
    const usuarioData = { nome, email, senha, tpUsuId }
    try {
      if (usuarioSelecionado) await atualizarUsuario(usuarioSelecionado.id, usuarioData)
      else await createUsuario(usuarioData)
      await carregarUsuarios()
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
      await carregarUsuarios()
      fecharModal()
    } catch (err) {
      setMensagemErroModal('O usuário está vinculado a um atendimento e não pode ser excluído.')
      setErroModal(true)
    }
  }

  const fecharErroModal = () => {
    setErroModal(false)
    setMensagemErroModal('')
  }

  const inputClass = (erro) =>
    `border rounded-md w-full p-2 mb-4 bg-white dark:bg-gray-700 text-textPrimary dark:text-gray-100
     ${erro ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
     focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-center text-textPrimary dark:text-gray-200">
        Usuários
      </h1>

      <div className="max-w-5xl mx-auto flex justify-end mb-6">
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Novo Usuário
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-[80px_250px_300px_150px_120px] gap-4 px-4 py-2 font-semibold bg-gray-100 dark:bg-gray-700 rounded-t">
        <span>Código</span>
        <span>Nome</span>
        <span>Email</span>
        <span>Tipo</span>
        <span>Ações</span>
      </div>

      <ul className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-b shadow-md divide-y divide-gray-200 dark:divide-gray-700">
        {usuarios.map((usuario) => {
          const tipo = tipos.find((t) => t.id === usuario.tpUsuId)
          return (
            <li
              key={usuario.id}
              className="grid grid-cols-[80px_250px_300px_150px_120px] gap-4 items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded"
            >
              <span className="text-textPrimary dark:text-gray-100">{usuario.id}</span>
              <span className="text-textPrimary dark:text-gray-100">{usuario.nome}</span>
              <span className="text-gray-500 dark:text-gray-300">{usuario.email}</span>
              <span className="text-gray-500 dark:text-gray-300">{tipo?.descricao || '-'}</span>
              <button
                onClick={() => abrirModal(usuario)}
                className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 gap-1 transition-colors"
              >
                <Pencil size={18} className="m-0 p-0" />
                Editar
              </button>
            </li>
          )
        })}
      </ul>

      {/* Modal de edição/adição com fundo desfocado */}
      <AnimatePresence>
        {modalAberto && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* overlay desfocado */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

            {/* modal original */}
            <Modal
              isOpen={modalAberto}
              title={usuarioSelecionado ? 'Editar Usuário' : 'Novo Usuário'}
              onClose={fecharModal}
            >
              {erroNome && <span className="text-red-500 text-sm mb-1 block">{erroNome}</span>}
              <input
                type="text"
                value={nome}
                onChange={(e) => { setNome(e.target.value); setErroNome('') }}
                placeholder="Nome"
                className={inputClass(erroNome)}
              />
              {erroEmail && <span className="text-red-500 text-sm mb-1 block">{erroEmail}</span>}
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErroEmail('') }}
                placeholder="Email"
                className={inputClass(erroEmail)}
              />
              {!usuarioSelecionado && (
                <>
                  {erroSenha && <span className="text-red-500 text-sm mb-1 block">{erroSenha}</span>}
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => { setSenha(e.target.value); setErroSenha('') }}
                    placeholder="Senha"
                    className={inputClass(erroSenha)}
                  />
                </>
              )}
              {erroTipo && <span className="text-red-500 text-sm mb-1 block">{erroTipo}</span>}
              <select
                value={tpUsuId}
                onChange={(e) => { setTpUsuId(Number(e.target.value)); setErroTipo('') }}
                className={inputClass(erroTipo)}
              >
                <option value="">Selecione o tipo de usuário</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.descricao}
                  </option>
                ))}
              </select>
              <div className="flex justify-between items-center">
                {usuarioSelecionado && (
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
                    onClick={salvarUsuario}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </Modal>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de erro do usuário */}
      <AnimatePresence>
        {erroModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            <motion.div
              className={`rounded-2xl shadow-xl p-6 text-center w-96 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
                }`}
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="text-red-500 text-6xl mb-4">⚠️</div>

              <p className="text-lg font-semibold mb-2">Erro ao excluir usuário</p>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{mensagemErroModal}</p>

              <button
                onClick={fecharErroModal}
                className={`px-6 py-2 rounded-md transition-colors ${isDarkMode
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
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
