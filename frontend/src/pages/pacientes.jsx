import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { fetchPacientes, criarPaciente, atualizarPaciente } from '../services/pacienteService'
import { fetchUsuarios } from '../services/usuarioService'
import Modal from '../components/modal'

export const Pacientes = () => {
    const [pacientes, setPacientes] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
    const [modalAberto, setModalAberto] = useState(false)

    const [nome, setNome] = useState('')
    const [dataNasc, setDataNasc] = useState('')
    const [respId, setRespId] = useState('')

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
        setModalAberto(true)
    }

    const fecharModal = () => {
        setNome('')
        setDataNasc('')
        setRespId('')
        setPacienteSelecionado(null)
        setModalAberto(false)
    }

    const salvarPaciente = async () => {
        if (!nome || !respId) return
        const pacienteData = { nome, dataNasc, respId }
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

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4 text-center">Pacientes</h1>

            <div className="max-w-4xl mx-auto flex justify-end mb-6">
                <button
                    onClick={() => abrirModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Novo Paciente
                </button>
            </div>

            {/* Cabeçalho */}
            <div className="max-w-4xl mx-auto grid grid-cols-[80px_300px_200px_150px] gap-4 px-3 py-2 font-semibold bg-gray-100 dark:bg-gray-700 rounded-t">
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




            <Modal
                isOpen={modalAberto}
                title={pacienteSelecionado ? 'Editar Paciente' : 'Novo Paciente'}
                onClose={fecharModal}
            >
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome completo"
                    className="border rounded-md w-full p-2 mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-500 transition"
                />
                <input
                    type="date"
                    value={dataNasc}
                    onChange={(e) => setDataNasc(e.target.value)}
                    placeholder="Data de Nascimento"
                    className="border rounded-md w-full p-2 mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-500 transition"
                />
                <select
                    value={respId}
                    onChange={(e) => setRespId(Number(e.target.value))}
                    className="border rounded-md w-full p-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-500 transition"
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
        </div>
    )
}
