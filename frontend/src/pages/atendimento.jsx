import { useEffect, useState } from 'react'
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  FileText,
  Activity,
  MapPin,
  ClipboardList,
  Thermometer,
  Weight
} from 'lucide-react'
import Modal from '../components/modal'
import Select from 'react-select'
import { useAuth } from '../services/authContext'
import { AnimatePresence, motion } from 'framer-motion'
import {
  fetchAtendimentos,
  createAtendimento,
  atualizarAtendimento,
  excluirAtendimento,
  createMedicamentoAtend
} from '../services/atendimentoService'
import { fetchPacientes } from '../services/pacienteService'
import { fetchUsuarios } from '../services/usuarioService'
import { fetchMedicamentos } from '../services/medicamentoService'

export const Atendimentos = () => {
  const { user } = useAuth()

  const [atendimentos, setAtendimentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'))

  const [modalAberto, setModalAberto] = useState(false)
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null)

  const [usuarioId, setUsuarioId] = useState('')
  const [pacienteId, setPacienteId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [obs, setObs] = useState('')
  const [finalizado, setFinalizado] = useState(false)
  const [medicamentosSelected, setMedicamentosSelected] = useState([])

  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [temperatura, setTemperatura] = useState('')
  const [peso, setPeso] = useState('')
  const [diagnostico, setDiagnostico] = useState('')

  const [usuarios, setUsuarios] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [medicamentos, setMedicamentos] = useState([])

  const [erros, setErros] = useState({})

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])


  const carregarDados = async () => {
    setLoading(true)
    try {
      const [atendData, userData, pacData, medData] = await Promise.all([
        fetchAtendimentos(),
        fetchUsuarios(),
        fetchPacientes(),
        fetchMedicamentos()
      ])
      setAtendimentos(atendData)
      setUsuarios(userData)
      setPacientes(pacData)
      setMedicamentos(medData)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const listaFiltrada = atendimentos.filter(a => {
    if (!busca) return true
    const termo = busca.toLowerCase()
    return (
      a.paciente?.nome?.toLowerCase().includes(termo) ||
      a.descricao?.toLowerCase().includes(termo) ||
      a.id.toString().includes(termo)
    )
  })

  const abrirModal = (atendimento = null) => {
    if (atendimento) {
      setAtendimentoSelecionado(atendimento)
      setUsuarioId(atendimento.usuId || '')
      setPacienteId(atendimento.pacId || '')
      setDescricao(atendimento.descricao || '')
      setObs(atendimento.obs || '')
      setFinalizado(atendimento.finalizado || false)
      setDiagnostico(atendimento.diagnostico || '')
      setCidade(atendimento.cidade || '')
      setUf(atendimento.uf || '')
      setTemperatura(atendimento.temperatura || '')
      setPeso(atendimento.peso || '')
      setMedicamentosSelected(atendimento.medicamentos || [])
    } else {
      setAtendimentoSelecionado(null)
      setUsuarioId('')
      setPacienteId('')
      setDescricao('')
      setObs('')
      setFinalizado(false)
      setCidade('')
      setUf('')
      setTemperatura('')
      setPeso('')
      setDiagnostico('')
      setMedicamentosSelected([])
    }
    setErros({})
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setAtendimentoSelecionado(null)
    setErros({})
  }

  const salvarAtendimento = async () => {
    const novosErros = {}
    if (!pacienteId) novosErros.pacienteId = 'Selecione um paciente'
    if (!descricao) novosErros.descricao = 'Descrição é obrigatória'

    if (Object.keys(novosErros).length) {
      setErros(novosErros)
      return
    }

    const payload = {
      usuId: Number(usuarioId) || user.id,
      pacId: Number(pacienteId),
      descricao,
      obs,
      cidade,
      uf,
      temperatura: temperatura ? parseFloat(temperatura) : null,
      peso: peso ? parseFloat(peso) : null,
      diagnostico,
      finalizado
    }

    try {
      let atendimentoCriado
      if (atendimentoSelecionado) {
        atendimentoCriado = await atualizarAtendimento(atendimentoSelecionado.id, payload)
      } else {
        atendimentoCriado = await createAtendimento(payload)
      }

      if (medicamentosSelected.length > 0) {
        for (const m of medicamentosSelected) {
          await createMedicamentoAtend({
            atendimentoId: Number(atendimentoCriado.id),
            medicamentoId: Number(m.medicamentoId || m.id),
            frequencia: m.frequencia,
            duracao: m.duracao || '',
            dosagem: m.dosagem,
            observacao: m.observacao
          })
        }
      }

      await carregarDados()
      fecharModal()
    } catch (err) {
      console.error('Erro ao salvar atendimento:', err)
    }
  }

  const confirmarExclusao = async () => {
    if (!atendimentoSelecionado) return
    try {
      await excluirAtendimento(atendimentoSelecionado.id)
      await carregarDados()
      fecharModal()
    } catch (err) {
      console.error('Erro ao excluir atendimento:', err)
    }
  }

  const updateMedicamento = (index, field, value) => {
    const updated = [...medicamentosSelected]
    updated[index][field] = value
    setMedicamentosSelected(updated)
  }

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDarkMode ? '#374151' : 'white',
      borderColor: state.isFocused ? '#2563EB' : isDarkMode ? '#4B5563' : '#D1D5DB',
      minHeight: '38px',
      fontSize: '0.875rem',
      borderRadius: '0.375rem',
      color: isDarkMode ? 'white' : 'black'
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? '#1F2937' : 'white',
      zIndex: 9999
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#2563EB' : 'transparent',
      color: state.isFocused ? 'white' : isDarkMode ? '#F3F4F6' : '#111827',
      cursor: 'pointer',
      fontSize: '0.875rem',
      padding: '6px 10px'
    }),
    singleValue: (base) => ({
      ...base,
      color: isDarkMode ? '#F3F4F6' : '#111827'
    }),
    input: (base) => ({
      ...base,
      color: isDarkMode ? '#F3F4F6' : '#111827'
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? '#4B5563' : '#DBEAFE',
      borderRadius: '4px'
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDarkMode ? '#F3F4F6' : '#1E40AF',
      fontSize: '0.8rem'
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDarkMode ? '#F3F4F6' : '#1E40AF',
      ':hover': { backgroundColor: '#EF4444', color: 'white' }
    })
  }

  const inputClass = "w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm dark:text-white"

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">

      {/* CABEÇALHO */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary dark:text-gray-100 flex items-center gap-2">
            Atendimentos
          </h1>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm dark:text-white"
            />
          </div>

          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition shadow-md whitespace-nowrap text-sm"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Novo Atendimento</span>
          </button>
        </div>
      </div>

      {/* TABELA */}
      <div className="max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                <th className="px-6 py-3">Código</th>
                <th className="px-6 py-3">Paciente</th>
                <th className="px-6 py-3">Profissional</th>
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-6 text-center text-gray-500 text-sm">Carregando dados...</td></tr>
              ) : listaFiltrada.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-6 text-center text-gray-500 text-sm">Nenhum atendimento encontrado.</td></tr>
              ) : (
                listaFiltrada.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{a.id}</td>
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100 text-sm">{a.paciente?.nome}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{a.usuario?.nome}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{a.descricao}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${a.finalizado ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {a.finalizado ? 'Concluído' : 'Aberto'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => abrirModal(a)} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700" title="Editar">
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL COMPACTO --- */}
      <AnimatePresence>
        {modalAberto && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={fecharModal} />

            <Modal
              isOpen={modalAberto}
              title={atendimentoSelecionado ? 'Editar' : 'Novo Atendimento'}
              onClose={fecharModal}
              maxWidth="max-w-3xl w-full"
            >
              <div className="flex flex-col max-h-[85vh]">

                {/* ÁREA DE CONTEÚDO SCROLLABLE */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-1">
                  <div className="space-y-3">

                    {/* 1. Contexto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1 dark:text-gray-300">Paciente *</label>
                        <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)} className={`${inputClass} ${erros.pacienteId ? 'border-red-500' : ''}`}>
                          <option value="">Selecione...</option>
                          {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                        {erros.pacienteId && <p className="text-red-500 text-[10px] mt-0.5">{erros.pacienteId}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 dark:text-gray-300">Profissional</label>
                        <input type="text" value={user?.nome} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
                      </div>
                    </div>

                    {/* 2. Sinais Vitais (Compacto) */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-600">
                      <h4 className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1">
                        <Activity size={14} className="text-blue-500" /> Sinais Vitais
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="relative">
                          <Thermometer size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                          <input type="number" step="0.1" placeholder="Temp" value={temperatura} onChange={e => setTemperatura(e.target.value)} className={`${inputClass} pl-8`} />
                        </div>
                        <div className="relative">
                          <Weight size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                          <input type="number" step="0.1" placeholder="Peso" value={peso} onChange={e => setPeso(e.target.value)} className={`${inputClass} pl-8`} />
                        </div>
                        <div className="relative">
                          <MapPin size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                          <input type="text" placeholder="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} className={`${inputClass} pl-8`} />
                        </div>
                        <div>
                          <input type="text" placeholder="UF" maxLength={2} value={uf} onChange={e => setUf(e.target.value.toUpperCase())} className={`${inputClass} uppercase text-center`} />
                        </div>
                      </div>
                    </div>

                    {/* 3. Dados Clínicos */}
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium mb-1 dark:text-gray-300">Descrição *</label>
                        <textarea rows={2} value={descricao} onChange={e => setDescricao(e.target.value)} className={inputClass} placeholder="Motivo..." />
                        {erros.descricao && <p className="text-red-500 text-[10px] mt-0.5">{erros.descricao}</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1 dark:text-gray-300">Diagnóstico</label>
                          <input type="text" value={diagnostico} onChange={e => setDiagnostico(e.target.value)} className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 dark:text-gray-300">Observações</label>
                          <input type="text" value={obs} onChange={e => setObs(e.target.value)} className={inputClass} />
                        </div>
                      </div>
                    </div>

                    {/* 4. Medicamentos */}
                    <div className="border-t pt-3 dark:border-gray-600">
                      <h4 className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1">
                        <FileText size={14} className="text-purple-500" /> Prescrição
                      </h4>

                      <div className="mb-3">
                        <Select
                          isMulti
                          placeholder="Adicionar..."
                          options={medicamentos.map(m => ({ value: m.id, label: m.descricao }))}
                          value={medicamentosSelected.map(m => ({ value: m.medicamentoId, label: medicamentos.find(x => x.id === m.medicamentoId)?.descricao || 'Item' }))}
                          styles={selectStyles}
                          onChange={(selected) => {
                            const novos = selected.map(sel => {
                              const existente = medicamentosSelected.find(m => m.medicamentoId === sel.value)
                              return existente || { medicamentoId: sel.value, dosagem: '', frequencia: '', duracao: '', observacao: '' }
                            })
                            setMedicamentosSelected(novos)
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        {medicamentosSelected.map((m, index) => {
                          const medInfo = medicamentos.find(x => x.id === m.medicamentoId)
                          return (
                            <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-200 dark:border-gray-600 grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
                              <div className="col-span-2 md:col-span-4 font-semibold text-xs text-gray-700 dark:text-gray-200 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                {medInfo?.descricao}
                              </div>
                              <input type="text" placeholder="Dose" value={m.dosagem} onChange={e => updateMedicamento(index, 'dosagem', e.target.value)} className={inputClass} />
                              <input type="text" placeholder="Freq." value={m.frequencia} onChange={e => updateMedicamento(index, 'frequencia', e.target.value)} className={inputClass} />
                              <input type="text" placeholder="Dur." value={m.duracao} onChange={e => updateMedicamento(index, 'duracao', e.target.value)} className={inputClass} />
                              <input type="text" placeholder="Obs." value={m.observacao} onChange={e => updateMedicamento(index, 'observacao', e.target.value)} className={inputClass} />
                            </div>
                          )
                        })}
                      </div>
                    </div>

                  </div>
                </div>

                {/* RODAPÉ FIXO */}
                <div className="mt-3 pt-3 border-t dark:border-gray-600 bg-white dark:bg-gray-800 z-10">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={finalizado}
                          onChange={() => setFinalizado(!finalizado)}
                          className="sr-only peer"
                        />
                        {/* Fundo do Switch (Track) */}
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Finalizar atendimento</span>
                    </label>

                    <div className="flex gap-2 w-full md:w-auto justify-end">
                      {atendimentoSelecionado && (
                        <button
                          onClick={confirmarExclusao}
                          className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded text-xs font-medium transition flex items-center gap-1 shadow-sm"
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                      )}
                      <button onClick={fecharModal} className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded text-xs font-medium transition">Cancelar</button>
                      <button onClick={salvarAtendimento} className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded text-xs font-medium transition shadow-sm">Salvar</button>
                    </div>
                  </div>
                </div>

              </div>
            </Modal>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}