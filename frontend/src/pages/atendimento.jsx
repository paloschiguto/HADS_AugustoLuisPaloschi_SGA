import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import Modal from '../components/modal'
import Select from 'react-select'
import { AnimatePresence, motion } from 'framer-motion'
import {
  fetchAtendimentos,
  createAtendimento,
  atualizarAtendimento,
  excluirAtendimento,
  createMedicamentoAtend,
  atualizarMedicamentoAtend,
  excluirMedicamentoAtend
} from '../services/atendimentoService'
import { fetchPacientes } from '../services/pacienteService'
import { fetchUsuarios } from '../services/usuarioService'
import { fetchMedicamentos } from '../services/medicamentoService'

export const Atendimentos = () => {
  const [atendimentos, setAtendimentos] = useState([])
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

  const carregarDados = async () => {
    try {
      setAtendimentos(await fetchAtendimentos())
      setUsuarios(await fetchUsuarios())
      setPacientes(await fetchPacientes())
      setMedicamentos(await fetchMedicamentos())
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

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

  const validarCampos = () => {
    const novosErros = {}
    if (!usuarioId) novosErros.usuarioId = 'Selecione um usuário'
    if (!pacienteId) novosErros.pacienteId = 'Selecione um paciente'
    if (!descricao) novosErros.descricao = 'Descrição é obrigatória'
    return novosErros
  }

  const salvarAtendimento = async () => {
    const validacao = validarCampos()
    if (Object.keys(validacao).length) {
      setErros(validacao)
      return
    }

    const payload = {
      usuId: Number(usuarioId),
      pacId: Number(pacienteId),
      descricao,
      obs,
      cidade,
      uf,
      temperatura,
      peso,
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

      if (medicamentosSelected.length) {
        for (const m of medicamentosSelected) {
          await createMedicamentoAtend({
            atendimentoId: atendimentoCriado.id,
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



  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-center text-textPrimary dark:text-gray-200">
        Atendimentos
      </h1>

      <div className="max-w-6xl mx-auto flex justify-end mb-6">
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Novo Atendimento
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-[80px_200px_200px_200px_150px_100px] gap-4 px-4 py-2 font-semibold bg-gray-100 dark:bg-gray-700 rounded-t">
        <span>Código</span>
        <span>Usuário</span>
        <span>Paciente</span>
        <span>Descrição</span>
        <span>Status</span>
        <span>Ações</span>
      </div>

      <ul className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-b shadow-md divide-y divide-gray-200 dark:divide-gray-700">
        {atendimentos.map((a) => (
          <li
            key={a.id}
            className="grid grid-cols-[80px_200px_200px_200px_150px_100px] gap-4 items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded"
          >
            <span className="text-textPrimary dark:text-gray-100">{a.id}</span>
            <span className="text-textPrimary dark:text-gray-100">{a.usuario?.nome}</span>
            <span className="text-textPrimary dark:text-gray-100">{a.paciente?.nome}</span>
            <span className="text-gray-500 dark:text-gray-300">{a.descricao}</span>
            <span className="text-gray-500 dark:text-gray-300">{a.finalizado ? 'Finalizado' : 'Aberto'}</span>
            <button
              onClick={() => abrirModal(a)}
              className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 gap-1 transition-colors"
            >
              <Pencil size={18} className="m-0 p-0" />
              Editar
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {modalAberto && (
          <>
            <motion.div
              className="fixed inset-0 backdrop-blur-sm bg-black/20 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <Modal
              isOpen={modalAberto}
              title={atendimentoSelecionado ? 'Editar Atendimento' : 'Novo Atendimento'}
              onClose={fecharModal}
            >
              <div className="space-y-8">

                {/* ===================== */}
                {/* SEÇÃO: DADOS DO ATENDIMENTO */}
                {/* ===================== */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Informações do Atendimento
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Usuário */}
                    <div>
                      {erros.usuarioId && <p className="text-red-500 text-sm">{erros.usuarioId}</p>}
                      <select
                        value={usuarioId}
                        onChange={(e) => setUsuarioId(e.target.value)}
                        className="w-full p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      >
                        <option value="">Selecione o usuário</option>
                        {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                      </select>
                    </div>

                    {/* Paciente */}
                    <div>
                      {erros.pacienteId && <p className="text-red-500 text-sm">{erros.pacienteId}</p>}
                      <select
                        value={pacienteId}
                        onChange={(e) => setPacienteId(e.target.value)}
                        className="w-full p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      >
                        <option value="">Selecione o paciente</option>
                        {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                      </select>
                    </div>

                    {/* Cidade */}
                    <input
                      type="text"
                      value={cidade}
                      onChange={e => setCidade(e.target.value)}
                      placeholder="Cidade"
                      className="w-full p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                    />

                    {/* UF */}
                    <input
                      type="text"
                      maxLength={2}
                      value={uf}
                      onChange={e => setUf(e.target.value.toUpperCase())}
                      placeholder="UF"
                      className="w-full p-2 uppercase rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                    />

                    {/* Temperatura */}
                    <input
                      type="number"
                      step="0.1"
                      value={temperatura}
                      onChange={e => setTemperatura(e.target.value)}
                      placeholder="Temperatura (°C)"
                      className="w-full p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                    />

                    {/* Peso */}
                    <input
                      type="number"
                      step="0.1"
                      value={peso}
                      onChange={e => setPeso(e.target.value)}
                      placeholder="Peso (kg)"
                      className="w-full p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                    />

                    {/* Descrição */}
                    <div className="col-span-full">
                      {erros.descricao && <p className="text-red-500 text-sm mb-1">{erros.descricao}</p>}
                      <textarea
                        rows={3}
                        value={descricao}
                        onChange={e => setDescricao(e.target.value)}
                        placeholder="Descrição do atendimento"
                        className="w-full p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    {/* Diagnóstico */}
                    <textarea
                      rows={2}
                      value={diagnostico}
                      onChange={e => setDiagnostico(e.target.value)}
                      placeholder="Diagnóstico"
                      className="w-full p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 col-span-full"
                    />

                    {/* Observação */}
                    <textarea
                      rows={2}
                      value={obs}
                      onChange={e => setObs(e.target.value)}
                      placeholder="Observações"
                      className="w-full p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 col-span-full"
                    />

                    <label className="flex items-center gap-3 col-span-full cursor-pointer select-none">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={finalizado}
                          onChange={() => setFinalizado(!finalizado)}
                          className="sr-only peer"
                        />

                        {/* Switch */}
                        <div className="
                            w-11 h-6 rounded-full 
                            bg-gray-300 dark:bg-gray-600
                            peer-checked:bg-blue-600 
                            transition-colors
                          "></div>

                        {/* Bolinha */}
                        <div className="
                            absolute top-0.5 left-0.5 
                            w-5 h-5 rounded-full 
                            bg-white dark:bg-gray-200
                            transition-all peer-checked:translate-x-5
                          "></div>
                      </div>

                      <span className="text-gray-900 dark:text-gray-100">
                        Atendimento finalizado
                      </span>
                    </label>


                  </div>
                </div>

                {/* ===================== */}
                {/* SEÇÃO: MEDICAMENTOS */}
                {/* ===================== */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 " >
                    Medicamentos
                  </h3>

                  <Select
                    isMulti
                    options={medicamentos.map(m => ({ value: m.id, label: m.descricao }))}
                    value={medicamentosSelected.map(m => {
                      const med = medicamentos.find(x => x.id === m.medicamentoId)
                      return { value: m.medicamentoId, label: med?.descricao || 'Medicamento' }
                    })}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                        borderColor: state.isFocused ? '#3B82F6' : document.documentElement.classList.contains('dark') ? '#4B5563' : '#D1D5DB',
                        boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none'
                      }),
                      menu: (base) => ({ ...base, backgroundColor: document.documentElement.classList.contains('dark') ? '#1F2937' : 'white' }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? '#3B82F6' : document.documentElement.classList.contains('dark') ? '#1F2937' : 'white',
                        color: state.isFocused ? 'white' : document.documentElement.classList.contains('dark') ? '#F9FAFB' : '#111827'
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#4B5563' : '#E5E7EB'
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: document.documentElement.classList.contains('dark') ? '#F9FAFB' : '#111827'
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: document.documentElement.classList.contains('dark') ? '#F9FAFB' : '#111827',
                        ':hover': { backgroundColor: '#EF4444', color: 'white' }
                      })
                    }}
                    onChange={(selected) => {
                      const novos = selected.map(sel => {
                        const existente = medicamentosSelected.find(m => m.medicamentoId === sel.value)
                        return existente || {
                          medicamentoId: sel.value,
                          dosagem: '',
                          frequencia: '',
                          duracao: '',
                          observacao: ''
                        }
                      })
                      setMedicamentosSelected(novos)
                    }}
                  />

                  {/* Inputs individuais por medicamento */}
                  {medicamentosSelected.map((m, index) => {
                    const medInfo = medicamentos.find(x => x.id === m.medicamentoId)

                    return (
                      <div key={index} className="p-4 border rounded-md border-gray-300 dark:border-gray-500 dark:bg-gray-700 space-y-3">
                        <h4 className="font-semibold ">
                          {medInfo?.descricao || 'Medicamento'}
                        </h4>

                        <input
                          type="text"
                          placeholder="Dosagem"
                          className="w-full p-2 rounded-md bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100"
                          value={m.dosagem}
                          onChange={(e) => updateMedicamento(index, 'dosagem', e.target.value)}
                        />

                        <input
                          type="text"
                          placeholder="Frequência"
                          className="w-full p-2 rounded-md bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100"
                          value={m.frequencia}
                          onChange={(e) => updateMedicamento(index, 'frequencia', e.target.value)}
                        />

                        <input
                          type="text"
                          placeholder="Duração"
                          className="w-full p-2 rounded-md bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100"
                          value={m.duracao}
                          onChange={(e) => updateMedicamento(index, 'duracao', e.target.value)}
                        />

                        <textarea
                          placeholder="Observação"
                          className="w-full p-2 rounded-md bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-900 dark:text-gray-100"
                          value={m.observacao}
                          onChange={(e) => updateMedicamento(index, 'observacao', e.target.value)}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* BOTÕES */}
                <div className="flex justify-between pt-4 border-t dark:border-gray-600">

                  {atendimentoSelecionado && (
                    <button
                      onClick={confirmarExclusao}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Excluir
                    </button>
                  )}

                  <div className="flex gap-3 ml-auto">
                    <button
                      onClick={fecharModal}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-600"
                    >
                      Cancelar
                    </button>

                    <button
                      onClick={salvarAtendimento}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
