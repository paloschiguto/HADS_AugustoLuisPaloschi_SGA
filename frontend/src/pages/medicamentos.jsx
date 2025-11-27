import { useEffect, useState } from 'react'
import {
    Pencil,
    Plus,
    Search,
    Trash2,
    Pill, // Ícone principal
    AlertTriangle
} from 'lucide-react'
import {
    fetchMedicamentos,
    createMedicamento,
    atualizarMedicamento,
    excluirMedicamento
} from '../services/medicamentoService'
import Modal from '../components/modal'
import { motion, AnimatePresence } from 'framer-motion'

export const Medicamentos = () => {
    const [medicamentos, setMedicamentos] = useState([])
    const [medicamentoSelecionado, setMedicamentoSelecionado] = useState(null)
    const [modalAberto, setModalAberto] = useState(false)
    const [loading, setLoading] = useState(true)
    const [busca, setBusca] = useState('') 

    const [descricao, setDescricao] = useState('')
    const [dosagem, setDosagem] = useState('')
    const [erros, setErros] = useState({})

    const [mostrarErroModal, setMostrarErroModal] = useState(false)
    const [mensagemErroModal, setMensagemErroModal] = useState('')

    const carregarMedicamentos = async () => {
        setLoading(true)
        try {
            const data = await fetchMedicamentos()
            setMedicamentos(data)
        } catch (err) {
            console.error('Erro ao carregar medicamentos:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarMedicamentos()
    }, [])

    const listaFiltrada = medicamentos.filter(m => {
        if (!busca) return true
        const termo = busca.toLowerCase()
        return (
            m.descricao.toLowerCase().includes(termo) ||
            m.dosagem.toLowerCase().includes(termo) ||
            m.id.toString().includes(termo)
        )
    })

    const abrirModal = (medicamento = null) => {
        if (medicamento) {
            setDescricao(medicamento.descricao)
            setDosagem(medicamento.dosagem)
            setMedicamentoSelecionado(medicamento)
        } else {
            setDescricao('')
            setDosagem('')
            setMedicamentoSelecionado(null)
        }
        setErros({})
        setModalAberto(true)
    }

    const fecharModal = () => {
        setModalAberto(false)
        setDescricao('')
        setDosagem('')
        setMedicamentoSelecionado(null)
        setErros({})
    }

    const validarCampos = () => {
        const novosErros = {}
        if (!descricao.trim()) novosErros.descricao = 'Descrição é obrigatória'
        if (!dosagem.trim()) novosErros.dosagem = 'Dosagem é obrigatória'
        return novosErros
    }

    const salvarMedicamento = async () => {
        const validacao = validarCampos()
        if (Object.keys(validacao).length) {
            setErros(validacao)
            return
        }

        try {
            if (medicamentoSelecionado) {
                await atualizarMedicamento(medicamentoSelecionado.id, { descricao, dosagem })
            } else {
                await createMedicamento({ descricao, dosagem })
            }
            await carregarMedicamentos()
            fecharModal()
        } catch (err) {
            console.error('Erro ao salvar medicamento:', err)
        }
    }

    const confirmarExclusao = async () => {
        if (!medicamentoSelecionado) return
        try {
            await excluirMedicamento(medicamentoSelecionado.id)
            await carregarMedicamentos()
            fecharModal()
        } catch (err) {
            console.error('Erro ao excluir medicamento:', err)
            setMensagemErroModal('Este medicamento já está vinculado a um atendimento ou prescrição.')
            setMostrarErroModal(true)
        }
    }

    const fecharErroModal = () => {
        setMostrarErroModal(false)
        setMensagemErroModal('')
    }

    // Helper de Estilo para Inputs
    const inputClass = (hasError) => `
        w-full p-2 rounded-lg bg-white dark:bg-gray-700 
        border ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
        focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm dark:text-white
    `

    return (
        <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">

            {/* --- CABEÇALHO --- */}
            <div className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-textPrimary dark:text-gray-100 flex items-center gap-2">
                        
                        Medicamentos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Gerencie o catálogo de remédios disponíveis.
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    {/* Barra de Busca */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar medicamento..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm dark:text-white"
                        />
                    </div>

                    <button
                        onClick={() => abrirModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition shadow-md whitespace-nowrap text-sm"
                    >
                        <Plus size={18} /> <span className="hidden sm:inline">Novo Medicamento</span>
                    </button>
                </div>
            </div>

            {/* --- TABELA --- */}
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                                <th className="px-6 py-4 w-20">ID</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4">Dosagem Padrão</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Carregando estoque...</td></tr>
                            ) : listaFiltrada.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Nenhum medicamento encontrado.</td></tr>
                            ) : (
                                listaFiltrada.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">#{m.id}</td>
                                        <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{m.descricao}</td>
                                        <td className="px-6 py-3">
                                            <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">
                                                {m.dosagem}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button
                                                onClick={() => abrirModal(m)}
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
                            title={medicamentoSelecionado ? 'Editar Medicamento' : 'Novo Medicamento'}
                            onClose={fecharModal}
                            maxWidth="max-w-lg w-full"
                        >
                            <div className="space-y-4">

                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Descrição *</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Dipirona Sódica"
                                        value={descricao}
                                        onChange={(e) => { setDescricao(e.target.value); setErros({ ...erros, descricao: '' }) }}
                                        className={inputClass(erros.descricao)}
                                        autoFocus
                                    />
                                    {erros.descricao && <span className="text-red-500 text-xs mt-1 block">{erros.descricao}</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Dosagem *</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 500mg"
                                        value={dosagem}
                                        onChange={(e) => { setDosagem(e.target.value); setErros({ ...erros, dosagem: '' }) }}
                                        className={inputClass(erros.dosagem)}
                                    />
                                    {erros.dosagem && <span className="text-red-500 text-xs mt-1 block">{erros.dosagem}</span>}
                                </div>

                                {/* RODAPÉ DA MODAL */}
                                <div className="flex justify-between items-center pt-4 mt-2 border-t dark:border-gray-700">
                                    <div>
                                        {medicamentoSelecionado && (
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
                                            onClick={salvarMedicamento}
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

            {/* --- MODAL DE ERRO (Delete Constraint) --- */}
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
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Não é possível excluir</h3>
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