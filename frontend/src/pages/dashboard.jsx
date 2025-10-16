import { useState, useEffect } from 'react'
import { useAuth } from '../services/authContext'
import { fetchUsuarios, fetchTiposUsuarios } from '../services/dashboardService'

export default function Dashboard() {
  const { token } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [tipos, setTipos] = useState([])

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const u = await fetchUsuarios()
        setUsuarios(u)

        const t = await fetchTiposUsuarios()
        setTipos(t)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      }
    }

    carregarDados()
  }, [])


  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <h1 className="text-3xl font-bold mb-4 text-textPrimary dark:text-gray-200">
        Dashboard
      </h1>

      {/* Cards de estatísticas */}
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
    </div>
  )
}
