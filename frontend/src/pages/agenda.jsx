import { useEffect, useState } from 'react'
import { format, parseISO, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    Pill,
    Clock,
    CheckCircle,
    AlertCircle,
    Thermometer,
    Calendar,
    Plus,
    FileText
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
// Ajuste os caminhos abaixo conforme a estrutura do seu projeto
import { useAuth } from '../services/authContext'
import {
    fetchAgendaDoDia,
    realizarBaixa,
    criarPrescricao,
    fetchPacientes,
    fetchMedicamentos
} from '../services/AgendaService'
import Modal from '../components/modal'

export const Agenda = () => {
    const { user } = useAuth()

    // --- ESTADOS ---

    // Dados da Agenda
    const [agenda, setAgenda] = useState([])
    const [loading, setLoading] = useState(true)

    // Modal de Baixa (Administrar Medicamento)
    const [modalBaixaAberto, setModalBaixaAberto] = useState(false)
    const [itemSelecionado, setItemSelecionado] = useState(null)
    const [temperatura, setTemperatura] = useState('')
    const [erroTemperatura, setErroTemperatura] = useState('')

    // Modal de Prescrição (Criar Nova)
    const [modalPrescricaoAberto, setModalPrescricaoAberto] = useState(false)
    const [listaPacientes, setListaPacientes] = useState([])
    const [listaMedicamentos, setListaMedicamentos] = useState([])

    // Formulário de Nova Prescrição
    const [novaPrescricao, setNovaPrescricao] = useState({
        pacienteId: '',
        medicamentoId: '',
        dosagem: '',
        frequenciaHoras: '',
        dataInicio: ''
    })

    // Estados de Erro do Formulário (Para não usar alert)
    const [errosPrescricao, setErrosPrescricao] = useState({
        paciente: '',
        medicamento: '',
        dosagem: '',
        frequencia: ''
    })

    // UI (Dark Mode)
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'))


    // --- FUNÇÕES DE CARREGAMENTO ---

    const carregarAgenda = async () => {
        setLoading(true)
        try {
            // 1. Busca Agenda
            const data = await fetchAgendaDoDia()
            setAgenda(data)

            // 2. Busca Listas para os Selects
            const pac = await fetchPacientes()
            const med = await fetchMedicamentos()
            setListaPacientes(pac || [])
            setListaMedicamentos(med || [])

        } catch (error) {
            console.error("Erro ao carregar dados:", error)
        } finally {
            setLoading(false)
        }
    }

    // Carrega tudo ao abrir a tela
    useEffect(() => {
        carregarAgenda()
    }, [])

    // Monitora Dark Mode
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'))
        })
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
        return () => observer.disconnect()
    }, [])


    // --- FUNÇÕES DE AÇÃO ---

    // 1. Salvar Nova Prescrição
    const salvarPrescricao = async () => {
        // Limpa erros anteriores
        setErrosPrescricao({ paciente: '', medicamento: '', dosagem: '', frequencia: '' })

        let temErro = false
        const novosErros = { paciente: '', medicamento: '', dosagem: '', frequencia: '' }

        // Validação Manual
        if (!novaPrescricao.pacienteId) {
            novosErros.paciente = 'Selecione um paciente.'
            temErro = true
        }
        if (!novaPrescricao.medicamentoId) {
            novosErros.medicamento = 'Selecione um medicamento.'
            temErro = true
        }
        if (!novaPrescricao.dosagem.trim()) {
            novosErros.dosagem = 'Informe a dosagem.'
            temErro = true
        }
        if (!novaPrescricao.frequenciaHoras) {
            novosErros.frequencia = 'Informe o intervalo.'
            temErro = true
        }

        if (temErro) {
            setErrosPrescricao(novosErros)
            return
        }

        try {
            const dadosParaEnviar = {
                ...novaPrescricao,
                pacienteId: Number(novaPrescricao.pacienteId),
                medicamentoId: Number(novaPrescricao.medicamentoId),
                frequenciaHoras: Number(novaPrescricao.frequenciaHoras),
                // Se não preencher data, usa a data atual
                dataInicio: novaPrescricao.dataInicio || new Date().toISOString()
            }

            await criarPrescricao(dadosParaEnviar)

            // Limpa form e fecha modal
            setModalPrescricaoAberto(false)
            setNovaPrescricao({ pacienteId: '', medicamentoId: '', dosagem: '', frequenciaHoras: '', dataInicio: '' })

            // Atualiza a lista na tela
            await carregarAgenda()
            // Opcional: toast de sucesso aqui se tiver bibliotecas de toast

        } catch (error) {
            console.error(error)
            // Aqui você pode setar um erro genérico se quiser mostrar no modal
        }
    }

    // Ao fechar modal de prescrição, limpa erros
    const fecharModalPrescricao = () => {
        setModalPrescricaoAberto(false)
        setErrosPrescricao({ paciente: '', medicamento: '', dosagem: '', frequencia: '' })
    }

    // 2. Preparar Baixa (Abrir Modal)
    const abrirModalBaixa = (item) => {
        setItemSelecionado(item)
        setTemperatura('')
        setErroTemperatura('')
        setModalBaixaAberto(true)
    }

    const fecharModalBaixa = () => {
        setModalBaixaAberto(false)
        setItemSelecionado(null)
        setErroTemperatura('')
    }

    // 3. Confirmar Baixa (Enviar ao Backend)
    const confirmarBaixa = async () => {
        if (!temperatura) return setErroTemperatura('A temperatura é obrigatória')

        // Validação simples de número
        const tempFloat = parseFloat(temperatura.replace(',', '.'))
        if (isNaN(tempFloat) || tempFloat < 30 || tempFloat > 45) {
            return setErroTemperatura('Temperatura inválida (ex: 36.5)')
        }

        try {
            await realizarBaixa(itemSelecionado.id, tempFloat)
            await carregarAgenda() // Atualiza a lista para ficar verde/check
            fecharModalBaixa()
        } catch (e) {
            console.error(e)
            setErroTemperatura('Erro ao registrar baixa.')
        }
    }


    // --- HELPER VISUAL (Estilos dos Cards) ---
    const getStatusStyle = (status, time) => {
        if (status === 'REALIZADO') {
            return {
                border: 'border-green-500',
                bg: 'bg-green-50 dark:bg-green-900/20',
                icon: <CheckCircle className="text-green-500" size={24} />,
                text: 'text-green-700 dark:text-green-400'
            }
        }

        const dataItem = parseISO(time)
        if (status === 'PENDENTE' && isPast(dataItem)) {
            return {
                border: 'border-red-400',
                bg: 'bg-red-50 dark:bg-red-900/20',
                icon: <AlertCircle className="text-red-500" size={24} />,
                text: 'text-red-700 dark:text-red-400'
            }
        }

        return {
            border: 'border-blue-300',
            bg: 'bg-white dark:bg-gray-800',
            icon: <Clock className="text-blue-500" size={24} />,
            text: 'text-gray-700 dark:text-gray-200'
        }
    }

    // Helper para classes de Input (DRY)
    const inputClass = (hasError) => `
        border rounded-md w-full p-2 mb-1 
        dark:bg-gray-700 dark:text-white 
        focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
        ${hasError
            ? 'border-red-500'
            : 'border-gray-300 dark:border-gray-600'
        }
    `

    return (
        <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">

            {/* Cabeçalho */}
            <div className="max-w-3xl mx-auto mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-textPrimary dark:text-gray-100 flex items-center gap-2">
                        <Pill className="text-blue-600" />
                        Agenda de Medicação
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Tarefas para hoje ({format(new Date(), "dd 'de' MMMM", { locale: ptBR })})
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={carregarAgenda}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        title="Atualizar Lista"
                    >
                        <Calendar size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>

                    <button
                        onClick={() => setModalPrescricaoAberto(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-md"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Prescrever</span>
                    </button>
                </div>
            </div>

            {/* Lista de Cards */}
            <div className="max-w-3xl mx-auto space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500 mt-8">Carregando agenda...</p>
                ) : agenda.length === 0 ? (
                    <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tudo em dia!</h3>
                        <p className="text-gray-500 dark:text-gray-400">Nenhuma tarefa pendente.</p>
                    </div>
                ) : (
                    agenda.map((item) => {
                        const styles = getStatusStyle(item.status, item.dataHoraPrevista)
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`relative flex items-center p-4 rounded-xl border-l-4 shadow-sm transition-all ${styles.border} ${styles.bg}`}
                            >
                                {/* Hora */}
                                <div className="pr-4 border-r border-gray-200 dark:border-gray-700 mr-4 text-center min-w-[80px]">
                                    <span className={`text-2xl font-bold block ${styles.text}`}>
                                        {format(parseISO(item.dataHoraPrevista), 'HH:mm')}
                                    </span>
                                    <span className="text-xs font-bold uppercase opacity-70 tracking-wide text-gray-500 dark:text-gray-400">
                                        {item.status}
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                                        {item.prescricao.paciente.nome}
                                    </h3>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex flex-col sm:flex-row sm:gap-4">
                                        <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                                            💊 {item.prescricao.medicamento.descricao}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            Dose: {item.prescricao.dosagem}
                                        </span>
                                    </div>
                                    {item.status === 'REALIZADO' && item.realizadoPor && (
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                                            <CheckCircle size={12} /> Realizado às {item.dataHoraRealizada ? format(parseISO(item.dataHoraRealizada), 'HH:mm') : ''}
                                        </p>
                                    )}
                                </div>

                                {/* Botão de Ação */}
                                <div className="ml-4">
                                    {item.status === 'PENDENTE' ? (
                                        <button
                                            onClick={() => abrirModalBaixa(item)}
                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                                        >
                                            <Thermometer size={16} />
                                            <span className="hidden sm:inline">Administrar</span>
                                        </button>
                                    ) : (
                                        <div className="opacity-80">
                                            {styles.icon}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>

            {/* --- MODAL 1: DAR BAIXA --- */}
            <Modal
                isOpen={modalBaixaAberto}
                title="Administrar Medicamento"
                onClose={fecharModalBaixa}
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-4 border border-blue-100 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <span className="font-bold">Paciente:</span> {itemSelecionado?.prescricao.paciente.nome} <br />
                            <span className="font-bold">Medicamento:</span> {itemSelecionado?.prescricao.medicamento.descricao}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Temperatura do Paciente (°C) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Thermometer className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={temperatura}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.,]/g, '')
                                    setTemperatura(val);
                                    setErroTemperatura('')
                                }}
                                placeholder="Ex: 36.5"
                                className={inputClass(!!erroTemperatura)}
                                autoFocus
                            />
                        </div>
                        {erroTemperatura && <span className="text-red-500 text-sm mt-1 block">{erroTemperatura}</span>}
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={fecharModalBaixa} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-300 transition">Cancelar</button>
                        <button onClick={confirmarBaixa} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2">
                            <CheckCircle size={18} /> Confirmar
                        </button>
                    </div>
                </div>
            </Modal>


            {/* --- MODAL 2: NOVA PRESCRIÇÃO --- */}
            <Modal
                isOpen={modalPrescricaoAberto}
                title="Nova Prescrição Médica"
                onClose={fecharModalPrescricao}
            >
                <div className="space-y-4">

                    {/* Select Paciente */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paciente</label>
                        <select
                            className={inputClass(!!errosPrescricao.paciente)}
                            value={novaPrescricao.pacienteId}
                            onChange={e => {
                                setNovaPrescricao({ ...novaPrescricao, pacienteId: e.target.value })
                                setErrosPrescricao({ ...errosPrescricao, paciente: '' })
                            }}
                        >
                            <option value="">Selecione...</option>
                            {listaPacientes.map(p => (
                                <option key={p.id} value={p.id}>{p.nome}</option>
                            ))}
                        </select>
                        {errosPrescricao.paciente && <span className="text-red-500 text-sm">{errosPrescricao.paciente}</span>}
                    </div>

                    {/* Select Medicamento */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medicamento</label>
                        <select
                            className={inputClass(!!errosPrescricao.medicamento)}
                            value={novaPrescricao.medicamentoId}
                            onChange={e => {
                                setNovaPrescricao({ ...novaPrescricao, medicamentoId: e.target.value })
                                setErrosPrescricao({ ...errosPrescricao, medicamento: '' })
                            }}
                        >
                            <option value="">Selecione...</option>
                            {listaMedicamentos.map(m => (
                                <option key={m.id} value={m.id}>{m.descricao} ({m.dosagem})</option>
                            ))}
                        </select>
                        {errosPrescricao.medicamento && <span className="text-red-500 text-sm">{errosPrescricao.medicamento}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Dosagem */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dosagem</label>
                            <input
                                type="text"
                                placeholder="Ex: 1 cp"
                                className={inputClass(!!errosPrescricao.dosagem)}
                                value={novaPrescricao.dosagem}
                                onChange={e => {
                                    setNovaPrescricao({ ...novaPrescricao, dosagem: e.target.value })
                                    setErrosPrescricao({ ...errosPrescricao, dosagem: '' })
                                }}
                            />
                            {errosPrescricao.dosagem && <span className="text-red-500 text-sm">{errosPrescricao.dosagem}</span>}
                        </div>

                        {/* Frequência */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Intervalo (Horas)</label>
                            <input
                                type="number"
                                placeholder="Ex: 8"
                                className={inputClass(!!errosPrescricao.frequencia)}
                                value={novaPrescricao.frequenciaHoras}
                                onChange={e => {
                                    setNovaPrescricao({ ...novaPrescricao, frequenciaHoras: e.target.value })
                                    setErrosPrescricao({ ...errosPrescricao, frequencia: '' })
                                }}
                            />
                            {errosPrescricao.frequencia && <span className="text-red-500 text-sm">{errosPrescricao.frequencia}</span>}
                        </div>
                    </div>

                    {/* Data Início */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Início (Opcional - Padrão: Agora)</label>
                        <input
                            type="datetime-local"
                            className={inputClass(false)} // Sem erro para data, pois é opcional
                            value={novaPrescricao.dataInicio}
                            onChange={e => setNovaPrescricao({ ...novaPrescricao, dataInicio: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            onClick={fecharModalPrescricao}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-white rounded hover:bg-gray-300 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={salvarPrescricao}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <FileText size={18} />
                            Criar Agenda
                        </button>
                    </div>

                </div>
            </Modal>

        </div>
    )
}