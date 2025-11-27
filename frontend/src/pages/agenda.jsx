import { useEffect, useState } from 'react'
import {
    format, parseISO, isPast, isSameDay, isToday,
    startOfMonth, endOfMonth, eachDayOfInterval,
    startOfWeek, endOfWeek, addMonths, subMonths
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    Pill, Clock, CheckCircle, AlertCircle, Thermometer,
    Calendar as CalendarIcon, Plus, FileText, ChevronLeft, ChevronRight, List,
    Search, X
} from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuth } from '../services/authContext'
import {
    fetchAgendaDoDia, realizarBaixa, criarPrescricao,
    fetchPacientes, fetchMedicamentos
} from '../services/AgendaService'
import Modal from '../components/modal'

export const Agenda = () => {
    const { user } = useAuth()

    const [agenda, setAgenda] = useState([])
    const [loading, setLoading] = useState(true)
    const [busca, setBusca] = useState('')

    const [viewMode, setViewMode] = useState('list')
    const [dataSelecionada, setDataSelecionada] = useState(new Date())

    const [modalBaixaAberto, setModalBaixaAberto] = useState(false)
    const [itemSelecionado, setItemSelecionado] = useState(null)
    const [temperatura, setTemperatura] = useState('')
    const [erroTemperatura, setErroTemperatura] = useState('')

    const [modalPrescricaoAberto, setModalPrescricaoAberto] = useState(false)
    const [listaPacientes, setListaPacientes] = useState([])
    const [listaMedicamentos, setListaMedicamentos] = useState([])
    const [novaPrescricao, setNovaPrescricao] = useState({
        pacienteId: '', medicamentoId: '', dosagem: '', frequenciaHoras: '', dataInicio: ''
    })
    const [errosPrescricao, setErrosPrescricao] = useState({})

    const listaFiltrada = agenda.filter((item) => {
        if (!busca) return true

        const termo = busca.toLowerCase()
        const nomePaciente = item.prescricao.paciente.nome.toLowerCase()
        const nomeRemedio = item.prescricao.medicamento.descricao.toLowerCase()
        const hora = format(parseISO(item.dataHoraPrevista), 'HH:mm')

        return nomePaciente.includes(termo) || nomeRemedio.includes(termo) || hora.includes(termo)
    }).sort((a, b) => {
        if (a.status === 'PENDENTE' && b.status !== 'PENDENTE') return -1
        if (a.status !== 'PENDENTE' && b.status === 'PENDENTE') return 1

        return new Date(a.dataHoraPrevista) - new Date(b.dataHoraPrevista)
    })

    const carregarAgenda = async (date = dataSelecionada) => {
        setLoading(true)
        try {
            const dataFormatada = format(date, 'yyyy-MM-dd')
            const data = await fetchAgendaDoDia(dataFormatada)
            setAgenda(data)

            if (listaPacientes.length === 0) {
                const pac = await fetchPacientes()
                const med = await fetchMedicamentos()
                setListaPacientes(pac || [])
                setListaMedicamentos(med || [])
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { carregarAgenda() }, [dataSelecionada])

    const handlePrevMonth = () => setDataSelecionada(subMonths(dataSelecionada, 1))
    const handleNextMonth = () => setDataSelecionada(addMonths(dataSelecionada, 1))
    const handleDayClick = (day) => {
        setDataSelecionada(day)
        if (window.innerWidth < 1024) setViewMode('list')
    }

    const salvarPrescricao = async () => {
        setErrosPrescricao({})
        let temErro = false; const novosErros = {}

        if (!novaPrescricao.pacienteId) { novosErros.paciente = 'Obrigatório'; temErro = true }
        if (!novaPrescricao.medicamentoId) { novosErros.medicamento = 'Obrigatório'; temErro = true }
        if (!novaPrescricao.dosagem) { novosErros.dosagem = 'Obrigatório'; temErro = true }
        if (!novaPrescricao.frequenciaHoras) { novosErros.frequencia = 'Obrigatório'; temErro = true }

        if (temErro) return setErrosPrescricao(novosErros)

        try {
            const dados = {
                ...novaPrescricao,
                pacienteId: Number(novaPrescricao.pacienteId),
                medicamentoId: Number(novaPrescricao.medicamentoId),
                frequenciaHoras: Number(novaPrescricao.frequenciaHoras),
                dataInicio: novaPrescricao.dataInicio || new Date().toISOString()
            }
            await criarPrescricao(dados)
            setModalPrescricaoAberto(false)
            setNovaPrescricao({ pacienteId: '', medicamentoId: '', dosagem: '', frequenciaHoras: '', dataInicio: '' })
            carregarAgenda()
        } catch (error) { console.error(error) }
    }

    const confirmarBaixa = async () => {
        if (!temperatura) return setErroTemperatura('Obrigatório')
        const tempFloat = parseFloat(temperatura.replace(',', '.'))
        if (isNaN(tempFloat) || tempFloat < 30 || tempFloat > 45) return setErroTemperatura('Inválido')

        try {
            await realizarBaixa(itemSelecionado.id, tempFloat)
            await carregarAgenda()
            setModalBaixaAberto(false)
            setItemSelecionado(null)
        } catch (e) { console.error(e) }
    }

    const renderCalendar = () => {
        const startDate = startOfWeek(startOfMonth(dataSelecionada))
        const endDate = endOfWeek(endOfMonth(dataSelecionada))
        const days = eachDayOfInterval({ start: startDate, end: endDate })
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" /></button>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 capitalize">{format(dataSelecionada, 'MMMM yyyy', { locale: ptBR })}</h2>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><ChevronRight size={20} className="text-gray-600 dark:text-gray-300" /></button>
                </div>
                <div className="grid grid-cols-7 mb-2">
                    {weekDays.map(day => <div key={day} className="text-center text-xs font-semibold text-gray-400 uppercase">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day) => {
                        const isSelected = isSameDay(day, dataSelecionada); const isCurrentMonth = day.getMonth() === dataSelecionada.getMonth(); const isTodayDay = isToday(day)
                        return (
                            <button key={day.toString()} onClick={() => handleDayClick(day)} className={`h-10 sm:h-12 rounded-lg flex flex-col items-center justify-center relative transition-all text-sm ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-200'} ${isSelected ? 'bg-blue-600 text-white shadow-md font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} ${isTodayDay && !isSelected ? 'border border-blue-400 text-blue-600 font-bold' : ''}`}>
                                {format(day, 'd')}
                                {isTodayDay && <span className="w-1.5 h-1.5 bg-blue-400 rounded-full absolute bottom-1"></span>}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    const getStatusStyle = (status, time) => {
        if (status === 'REALIZADO') return { border: 'border-green-500', bg: 'bg-green-50 dark:bg-green-900/20', icon: <CheckCircle className="text-green-500" size={24} />, text: 'text-green-700 dark:text-green-400' }
        if (status === 'PENDENTE' && isPast(parseISO(time)) && !isSameDay(parseISO(time), new Date())) return { border: 'border-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: <AlertCircle className="text-red-500" size={24} />, text: 'text-red-700 dark:text-red-400' }
        return { border: 'border-blue-300', bg: 'bg-white dark:bg-gray-800', icon: <Clock className="text-blue-500" size={24} />, text: 'text-gray-700 dark:text-gray-200' }
    }
    const inputClass = (err) => `border rounded-md w-full p-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${err ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`

    return (
        <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">

            {/* --- HEADER --- */}
            <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-textPrimary dark:text-gray-100 flex items-center gap-2">
                        Agenda de Medicação
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 capitalize">
                        {isToday(dataSelecionada) ? `Hoje, ${format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })}` : format(dataSelecionada, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {/* Toggle Lista/Calendário (Mobile) */}
                    <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border dark:border-gray-700 lg:hidden flex-1 md:flex-none justify-center">
                        <button onClick={() => setViewMode('list')} className={`flex-1 md:flex-none px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-600 dark:text-gray-400'}`}><List size={18} /> Lista</button>
                        <button onClick={() => setViewMode('calendar')} className={`flex-1 md:flex-none px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-600 dark:text-gray-400'}`}><CalendarIcon size={18} /> Calendário</button>
                    </div>
                    {/* Botão Prescrever */}
                    <button onClick={() => setModalPrescricaoAberto(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-md whitespace-nowrap ml-auto md:ml-0"><Plus size={20} /> <span className="hidden sm:inline">Prescrever</span></button>
                </div>
            </div>

            {/* --- SEARCH BAR --- */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Filtrar por paciente, medicamento ou horário..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                    />
                    {busca && (
                        <button onClick={() => setBusca('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* --- LAYOUT PRINCIPAL --- */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* CALENDÁRIO LATERAL */}
                <div className={`lg:col-span-1 ${viewMode === 'list' ? 'hidden lg:block' : 'block'}`}>
                    {renderCalendar()}
                    <div className="mt-4 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                        <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2 text-sm">Resumo do Dia</h4>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300"><span>Total:</span><span className="font-bold">{agenda.length}</span></div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mt-1"><span>Pendentes:</span><span className="font-bold text-orange-500">{agenda.filter(i => i.status === 'PENDENTE').length}</span></div>
                    </div>
                </div>

                {/* LISTA DE TAREFAS */}
                <div className={`lg:col-span-2 ${viewMode === 'calendar' ? 'hidden lg:block' : 'block'}`}>
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-center text-gray-500 py-8">Carregando...</p>
                        ) : listaFiltrada.length === 0 ? (
                            <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
                                <Search className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{busca ? 'Nenhum resultado' : 'Agenda Livre'}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">{busca ? `Não encontramos nada com "${busca}"` : 'Nenhuma medicação agendada para esta data.'}</p>
                            </div>
                        ) : (
                            listaFiltrada.map((item) => {
                                const styles = getStatusStyle(item.status, item.dataHoraPrevista)
                                return (
                                    <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`relative flex items-center p-4 rounded-xl border-l-4 shadow-sm bg-white dark:bg-gray-800 transition-all ${styles.border}`}>
                                        <div className="pr-4 border-r border-gray-100 dark:border-gray-700 mr-4 text-center min-w-[70px]">
                                            <span className={`text-xl font-bold block ${styles.text}`}>{format(parseISO(item.dataHoraPrevista), 'HH:mm')}</span>
                                            <span className="text-[10px] font-bold uppercase opacity-70 tracking-wide text-gray-500 dark:text-gray-400">{item.status}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800 dark:text-gray-100">{item.prescricao.paciente.nome}</h3>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-3 mt-1">
                                                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">💊 {item.prescricao.medicamento.descricao}</span>
                                                <span>{item.prescricao.dosagem}</span>
                                            </div>
                                            {item.status === 'REALIZADO' && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={12} /> Feito às {item.dataHoraRealizada ? format(parseISO(item.dataHoraRealizada), 'HH:mm') : '--:--'}</p>}
                                        </div>
                                        <div className="ml-2">
                                            {item.status === 'PENDENTE' ? (
                                                <button onClick={() => { setItemSelecionado(item); setTemperatura(''); setModalBaixaAberto(true) }} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition shadow-md" title="Administrar"><Thermometer size={20} /></button>
                                            ) : (
                                                <div className="opacity-50 p-2">{styles.icon}</div>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* --- MODAIS --- */}
            <Modal isOpen={modalBaixaAberto} title="Administrar Medicamento" onClose={() => setModalBaixaAberto(false)}>
                <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-4 border border-blue-100 dark:border-blue-800 text-sm">
                        <span className="font-bold text-blue-900 dark:text-blue-100">Paciente:</span> {itemSelecionado?.prescricao.paciente.nome} <br />
                        <span className="font-bold text-blue-900 dark:text-blue-100">Medicamento:</span> {itemSelecionado?.prescricao.medicamento.descricao}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temperatura (°C) *</label>
                        <input type="text" placeholder="Ex: 36.5" value={temperatura} onChange={e => { setTemperatura(e.target.value.replace(/[^0-9.,]/g, '')); setErroTemperatura('') }} className={inputClass(!!erroTemperatura)} autoFocus />
                        {erroTemperatura && <span className="text-red-500 text-sm">{erroTemperatura}</span>}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setModalBaixaAberto(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-sm">Cancelar</button>
                        <button onClick={confirmarBaixa} className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">Confirmar</button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={modalPrescricaoAberto} title="Nova Prescrição" onClose={() => setModalPrescricaoAberto(false)}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Paciente *</label>
                        <select className={inputClass(errosPrescricao.paciente)} value={novaPrescricao.pacienteId} onChange={e => setNovaPrescricao({ ...novaPrescricao, pacienteId: e.target.value })}><option value="">Selecione...</option>{listaPacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Medicamento *</label>
                        <select className={inputClass(errosPrescricao.medicamento)} value={novaPrescricao.medicamentoId} onChange={e => setNovaPrescricao({ ...novaPrescricao, medicamentoId: e.target.value })}><option value="">Selecione...</option>{listaMedicamentos.map(m => <option key={m.id} value={m.id}>{m.descricao} ({m.dosagem})</option>)}</select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Dosagem *</label><input type="text" placeholder="Ex: 1 cp" className={inputClass(errosPrescricao.dosagem)} value={novaPrescricao.dosagem} onChange={e => setNovaPrescricao({ ...novaPrescricao, dosagem: e.target.value })} /></div>
                        <div><label className="block text-sm font-medium mb-1 dark:text-gray-300 ">Intervalo (h) *</label><input type="number" placeholder="Ex: 8" className={`${inputClass(errosPrescricao.frequencia)} no-spin`} value={novaPrescricao.frequenciaHoras} onChange={e => setNovaPrescricao({ ...novaPrescricao, frequenciaHoras: e.target.value })} /></div>
                    </div>
                    <div><label className="block text-sm font-medium mb-1 dark:text-gray-300">Início (Opcional)</label><input type="datetime-local" className={inputClass(false)} value={novaPrescricao.dataInicio} onChange={e => setNovaPrescricao({ ...novaPrescricao, dataInicio: e.target.value })} /></div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={() => setModalPrescricaoAberto(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-sm">Cancelar</button>
                        <button onClick={salvarPrescricao} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-2"><FileText size={16} /> Criar Agenda</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}