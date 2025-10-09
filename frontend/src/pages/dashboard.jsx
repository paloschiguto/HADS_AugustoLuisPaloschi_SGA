import { useState } from 'react'

export default function Dashboard() {
  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: 'Augusto', email: 'augusto@email.com', tipo: 'Administrador' },
    { id: 2, nome: 'Maria', email: 'maria@email.com', tipo: 'Operador' },
    { id: 3, nome: 'João', email: 'joao@email.com', tipo: 'Usuário' }
  ])

  const handleEditar = (id) => alert(`Editar usuário ${id}`)
  const handleExcluir = (id) => {
    if (confirm('Deseja realmente excluir este usuário?')) {
      setUsuarios(usuarios.filter(u => u.id !== id))
    }
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <h1 className="text-3xl font-bold text-textPrimary mb-6">Dashboard</h1>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-textPrimary mb-2">Usuários</h2>
          <p className="text-textSecondary">Total: {usuarios.length}</p>
        </div>

        <div className="bg-surface p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-textPrimary mb-2">Tipos de Usuário</h2>
          <p className="text-textSecondary">Total: 3</p>
        </div>

        <div className="bg-surface p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-textPrimary mb-2">Relatórios</h2>
          <p className="text-textSecondary">Visualize estatísticas em breve</p>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-surface p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-textPrimary mb-4">Lista de Usuários</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2">ID</th>
                <th className="text-left px-4 py-2">Nome</th>
                <th className="text-left px-4 py-2">E-mail</th>
                <th className="text-left px-4 py-2">Tipo</th>
                <th className="text-center px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2">{u.id}</td>
                  <td className="px-4 py-2">{u.nome}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.tipo}</td>
                  <td className="px-4 py-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleEditar(u.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleExcluir(u.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
