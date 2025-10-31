import { useState, useEffect } from 'react'
import { useAuth } from '../services/authContext'
import {
  fetchUsuarios,
  fetchTiposUsuarios,
  fetchEstatisticasMedico,
  fetchAtendimentosRecentesMedico
} from '../services/dashboardService'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const carregarDados = async () => {
      try {
        if (user.tipoUsuario?.descricao === 'Médico') {
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
        }
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [user])

  if (!user || loading) return <div className="p-6 text-center">Carregando...</div>

  if (!user?.permissoes?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Acesso restrito
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Seu tipo de usuário ainda não possui permissões para visualizar informações no dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {user.tipoUsuario?.descricao === 'Médico' ? (
        <>
          <h1 className="text-3xl font-bold text-textPrimary dark:text-gray-200">
            Olá, Dr. {user.nome.split(' ')[0]}
          </h1>
          <p className="text-textSecondary dark:text-gray-400">
            Acompanhe seu desempenho.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-textPrimary dark:text-gray-100">
                Atendimentos
              </h2>
              <p>{statsMedico.meusAtendimentos}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-textPrimary dark:text-gray-100">
                Atendimentos Pendentes
              </h2>
              <p>{statsMedico.meusPendentes}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-textPrimary dark:text-gray-100">
                Total de Atendimentos
              </h2>
              <p>{statsMedico.totalAtendimentos}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-2xl font-semibold text-textPrimary dark:text-gray-100 mb-4">
              Atendimentos Recentes
            </h2>
            {atendimentosRecentes.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 dark:border-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="text-left px-4 py-2">Código</th>
                      <th className="text-left px-4 py-2">Paciente</th>
                      <th className="text-left px-4 py-2">Status</th>
                      <th className="text-left px-4 py-2">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atendimentosRecentes.map(a => (
                      <tr key={a.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-2">{a.id}</td>
                        <td className="px-4 py-2">{a.pacienteNome}</td>
                        <td className="px-4 py-2">{a.finalizado ? 'Finalizado' : 'Pendente'}</td>
                        <td className="px-4 py-2">{new Date(a.data).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Nenhum atendimento recente.</p>
            )}
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-textPrimary dark:text-gray-200 mt-8 sm:mt-0">
            Olá, {user.nome.split(' ')[0]}
          </h1>

          <p className="text-textSecondary dark:text-gray-400">
            Dados gerais do sistema.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-textPrimary dark:text-gray-100">
                Usuários
              </h2>
              <p>Total: {usuarios.length}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-textPrimary dark:text-gray-100">
                Tipos de Usuário
              </h2>
              <p>Total: {tipos.length}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2 text-textPrimary dark:text-gray-100">
                Relatórios
              </h2>
              <p>Visualize estatísticas em breve</p>
            </div>
          </div>

          {/* Tabela de usuários recentes */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-textPrimary dark:text-gray-100 mb-4">
              Usuários Recentes
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="text-left px-4 py-2">ID</th>
                    <th className="text-left px-4 py-2">Nome</th>
                    <th className="text-left px-4 py-2">E-mail</th>
                    <th className="text-left px-4 py-2">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios
                    .sort((a, b) => a.id - b.id)
                    .map(u => (
                      <tr
                        key={u.id}
                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-2">{u.id}</td>
                        <td className="px-4 py-2">{u.nome}</td>
                        <td className="px-4 py-2">{u.email}</td>
                        <td className="px-4 py-2">{u.tipo?.descricao || '—'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )
      }
    </div >
  )
}
