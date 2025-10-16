import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import {
    fetchMedicamentos,
    createMedicamento,
    atualizarMedicamento,
    excluirMedicamento
} from '../services/medicamentoService'
import Modal from '../components/modal'

export const Medicamentos = () => {
    const [medicamentos, setMedicamentos] = useState([])
    const [medicamentoSelecionado, setMedicamentoSelecionado] = useState(null)
    const [modalAberto, setModalAberto] = useState(false)

    const [descricao, setDescricao] = useState('')
    const [dosagem, setDosagem] = useState('')

    const carregarMedicamentos = async () => {
        try {
            const data = await fetchMedicamentos()
            setMedicamentos(data)
        } catch (err) {
            console.error('Erro ao carregar medicamentos:', err)
        }
    }

    useEffect(() => {
        carregarMedicamentos()
    }, [])

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
        setModalAberto(true)
    }

    const fecharModal = () => {
        setModalAberto(false)
        setDescricao('')
        setDosagem('')
        setMedicamentoSelecionado(null)
    }

    const salvarMedicamento = async () => {
        if (!descricao || !dosagem) return

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
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4 text-center text-textPrimary dark:text-gray-200">
                Medicamentos
            </h1>

            <div className="max-w-4xl mx-auto flex justify-end mb-6">
                <button
                    onClick={() => abrirModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Novo Medicamento
                </button>
            </div>

            {/* Cabeçalho */}
            <div className="max-w-4xl mx-auto grid grid-cols-[80px_350px_150px_100px] gap-4 px-4 py-2 font-semibold bg-gray-100 dark:bg-gray-700 rounded-t">
                <span>Código</span>
                <span>Descrição</span>
                <span>Dosagem</span>
                <span>Ações</span>
            </div>

            {/* Lista de medicamentos */}
            <ul className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-b shadow-md divide-y divide-gray-200 dark:divide-gray-700">
                {medicamentos.map((medicamento) => (
                    <li
                        key={medicamento.id}
                        className="grid grid-cols-[80px_350px_150px_100px] gap-4 items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded"
                    >
                        <span className="text-textPrimary dark:text-gray-100">{medicamento.id}</span>
                        <span className="text-textPrimary dark:text-gray-100">{medicamento.descricao}</span>
                        <span className="text-gray-500 dark:text-gray-300">{medicamento.dosagem}</span>
                        <button
                            onClick={() => abrirModal(medicamento)}
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
                title={medicamentoSelecionado ? 'Editar Medicamento' : 'Novo Medicamento'}
                onClose={fecharModal}
            >
                <input
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descrição"
                    className="border rounded-md w-full p-2 mb-4 bg-white dark:bg-gray-700 text-textPrimary dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                <input
                    type="text"
                    value={dosagem}
                    onChange={(e) => setDosagem(e.target.value)}
                    placeholder="Dosagem"
                    className="border rounded-md w-full p-2 mb-4 bg-white dark:bg-gray-700 text-textPrimary dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />

                <div className="flex justify-between items-center">
                    {medicamentoSelecionado && (
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
                            onClick={salvarMedicamento}
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
