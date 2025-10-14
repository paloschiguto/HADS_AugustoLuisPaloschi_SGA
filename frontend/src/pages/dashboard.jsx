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
        const u = await fetchUsuarios(token)
        setUsuarios(u)

        const t = await fetchTiposUsuarios(token)
        setTipos(t)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      }
    }
    if (token) carregarDados()
  }, [token])

  const handleEditar = (id) => alert(`Editar usuário ${id}`)
  const handleExcluir = (id) => {
    if (confirm('Deseja realmente excluir este usuário?')) {
      setUsuarios(usuarios.filter(u => u.id !== id))
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* Conteúdo principal */}
      <main className="flex-1 p-6 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Usuários</h2>
            <p>Total: {usuarios.length}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Tipos de Usuário</h2>
            <p>Total: {tipos.length}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Relatórios</h2>
            <p>Visualize estatísticas em breve</p>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-textPrimary mb-4">Usuários Recentes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2">ID</th>
                  <th className="text-left px-4 py-2">Nome</th>
                  <th className="text-left px-4 py-2">E-mail</th>
                  <th className="text-left px-4 py-2">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {usuarios
                  .sort((a, b) => b.id - a.id)
                  .slice(0, 5)
                  .map(u => (
                    <tr key={u.id} className="border-t border-gray-200 hover:bg-gray-50">
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
      </main>
    </div>
  )
}
