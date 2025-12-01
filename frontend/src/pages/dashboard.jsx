import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../services/authContext'
import { fetchAgendaDoDia } from '../services/AgendaService'
import {
  fetchUsuarios,
  fetchTiposUsuarios,
  fetchEstatisticasMedico,
  fetchAtendimentosRecentesMedico
} from '../services/dashboardService'
import {
  Users,
  Activity,
  Calendar,
  Clock,
  FileText,
  Shield,
  ArrowRight,
  Pill,
  AlertCircle
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()

  const [usuarios, setUsuarios] = useState([])
  const [tipos, setTipos] = useState([])
  const [statsMedico, setStatsMedico] = useState({
    meusAtendimentos: 0,
    meusPendentes: 0,
    totalAtendimentos: 0
  })
  const [atendimentosRecentes, setAtendimentosRecentes] = useState([])
  const [pendenciasHoje, setPendenciasHoje] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const carregarDados = async () => {
      try {
        console.log("Carregando dados do dashboard para o usuário:", user)
        if (user.tipo === "Médico" || user.tipoUsuario?.descricao === 'Médico') {
          const stats = await fetchEstatisticasMedico()
          setStatsMedico({
            meusAtendimentos: stats.meusAtendimentos ?? 0,
            meusPendentes: stats.meusPendentes ?? 0,
            totalAtendimentos: stats.totalAtendimentos ?? 0
          })

          const recentes = await fetchAtendimentosRecentesMedico()
          setAtendimentosRecentes(recentes)

        } else {
          const u = await fetchUsuarios()
          setUsuarios(u)
          const t = await fetchTiposUsuarios()
          setTipos(t)

          try {
            const agendaHoje = await fetchAgendaDoDia() 
            const totalPendentes = agendaHoje.filter(item => item.status === 'PENDENTE').length
            setPendenciasHoje(totalPendentes)
          } catch (error) {
            console.error("Erro ao buscar agenda para dashboard:", error)
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [user])

  if (!user || loading) return <div className="p-6 text-center text-gray-500">Carregando informações...</div>

  const StatCard = ({ title, value, icon: Icon, colorClass, subtext, textColor }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between transition hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h3 className={`text-3xl font-bold ${textColor || 'text-gray-800 dark:text-gray-100'}`}>{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  )

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary dark:text-gray-100">
            Olá, {user.tipoUsuario?.descricao === 'Médico' ? 'Dr(a). ' : ''}{user.nome.split(' ')[0]}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Resumo operacional do sistema.
          </p>
        </div>

        {/* Botão Atalho Agenda (Para todos agora, se tiver permissão) */}
        {user.permissoes.some(p => p.nome === 'Agenda') && (
          <Link to="/agenda" className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition shadow-md">
            <Calendar size={18} /> Acessar Agenda
          </Link>
        )}
      </div>

      {user.tipo === "Médico" || user.tipoUsuario?.descricao === 'Médico' ? (
        <>
          {/* CARDS MÉDICO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Meus Atendimentos"
              value={statsMedico.meusAtendimentos}
              icon={Activity}
              colorClass="bg-blue-500"
              subtext="Total histórico realizado"
            />
            <StatCard
              title="Meus Pendentes"
              value={statsMedico.meusPendentes}
              icon={Clock}
              colorClass="bg-orange-500"
              subtext="Aguardando finalização"
            />
            <StatCard
              title="Total Geral"
              value={statsMedico.totalAtendimentos}
              icon={FileText}
              colorClass="bg-emerald-500"
              subtext="Atendimentos na unidade"
            />
          </div>

          {/* TABELA MÉDICO */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Atendimentos Recentes</h2>
              <Link to="/atendimentos" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Ver todos <ArrowRight size={16} />
              </Link>
            </div>

            {atendimentosRecentes.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-3 text-left">Paciente</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Data</th>
                      <th className="px-6 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {atendimentosRecentes.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">{a.pacienteNome}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.finalizado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {a.finalizado ? 'Finalizado' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                          {new Date(a.data).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/atendimentos/${a.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Detalhes</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Nenhum atendimento recente encontrado.
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* CARDS ADMIN / GERAL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <StatCard
              title="Usuários Ativos"
              value={usuarios.length}
              icon={Users}
              colorClass="bg-indigo-500"
            />
            <StatCard
              title="Tipos de Perfil"
              value={tipos.length}
              icon={Shield}
              colorClass="bg-purple-500"
            />

            {/* --- CARD ATUALIZADO: Prescrições do Dia --- */}
            <StatCard
              title="Prescrições Pendentes"
              value={pendenciasHoje}
              icon={pendenciasHoje > 0 ? AlertCircle : Pill}
              // Se tiver pendência fica Laranja, se zerou fica Verde
              colorClass={pendenciasHoje > 0 ? "bg-orange-500" : "bg-green-500"}
              textColor={pendenciasHoje > 0 ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}
              subtext="Agenda de hoje"
            />
            {/* ------------------------------------------- */}
          </div>

          {/* TABELA ADMIN */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Usuários Recentes</h2>
              <Link to="/usuarios" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Gerenciar <ArrowRight size={16} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3 text-left">Nome</th>
                    <th className="px-6 py-3 text-left">E-mail</th>
                    <th className="px-6 py-3 text-left">Perfil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {usuarios.slice(0, 5).map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">{u.nome}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs font-medium">
                          {u.tipo?.descricao || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}