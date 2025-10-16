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

export const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([])
    const [tipos, setTipos] = useState([])
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
    const [modalAberto, setModalAberto] = useState(false)

    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [tpUsuId, setTpUsuId] = useState('')

    const carregarUsuarios = async () => {
        const data = await fetchUsuarios()
        const ordenados = data.sort((a, b) => a.nome.localeCompare(b.nome))
        setUsuarios(ordenados)
    }

    const carregarTipos = async () => {
        const data = await fetchTipos()
        setTipos(data)
    }

    useEffect(() => {
        carregarUsuarios()
        carregarTipos()
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
        setModalAberto(true)
    }

    const fecharModal = () => {
        setModalAberto(false)
        setNome('')
        setEmail('')
        setSenha('')
        setTpUsuId('')
        setUsuarioSelecionado(null)
    }

    const salvarUsuario = async () => {
        if (!nome || !email || !tpUsuId) return

        const usuarioData = { nome, email, senha, tpUsuId }

        if (usuarioSelecionado) {
            await atualizarUsuario(usuarioSelecionado.id, usuarioData)
        } else {
            await createUsuario(usuarioData)
        }

        await carregarUsuarios()
        fecharModal()
    }

    const confirmarExclusao = async () => {
        if (!usuarioSelecionado) return
        await excluirUsuario(usuarioSelecionado.id)
        await carregarUsuarios()
        fecharModal()
    }

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

            {/* Cabeçalho */}
            <div className="max-w-5xl mx-auto grid grid-cols-[80px_250px_300px_150px_120px] gap-4 px-4 py-2 font-semibold bg-gray-100 dark:bg-gray-700 rounded-t">
                <span>Código</span>
                <span>Nome</span>
                <span>Email</span>
                <span>Tipo</span>
                <span>Ações</span>
            </div>

            {/* Lista de usuários */}
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



            {/* Modal */}
            <Modal
                isOpen={modalAberto}
                title={usuarioSelecionado ? 'Editar Usuário' : 'Novo Usuário'}
                onClose={fecharModal}
            >
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome"
                    className="border rounded-md w-full p-2 mb-4 bg-white dark:bg-gray-700 text-textPrimary dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="border rounded-md w-full p-2 mb-4 bg-white dark:bg-gray-700 text-textPrimary dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                {!usuarioSelecionado && (
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Senha"
                        className="border rounded-md w-full p-2 mb-4 bg-white dark:bg-gray-700 text-textPrimary dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                )}
                <select
                    value={tpUsuId}
                    onChange={(e) => setTpUsuId(Number(e.target.value))}
                    className="border rounded-md w-full p-2 mb-4 bg-white dark:bg-gray-700 text-textPrimary dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
        </div>

    )
}
