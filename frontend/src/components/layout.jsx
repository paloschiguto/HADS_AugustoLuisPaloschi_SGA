import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-6">SGA</h2>
        <nav className="flex flex-col gap-4">
          <Link to="/" className="hover:bg-gray-700 px-3 py-2 rounded">Dashboard</Link>
          <Link to="/tipos-usuario" className="hover:bg-gray-700 px-3 py-2 rounded">Tipos de Usuário</Link>
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 bg-background p-6">
        <Outlet />
      </main>
    </div>
  )
}
