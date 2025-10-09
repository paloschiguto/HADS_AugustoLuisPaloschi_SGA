import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="bg-surface w-64 min-h-screen border-r border-gray-200 p-6 flex flex-col gap-4">
      <Link to="/dashboard" className="text-textPrimary font-semibold hover:text-primary transition">
        Dashboard
      </Link>
      <Link to="/usuarios" className="text-textPrimary font-semibold hover:text-primary transition">
        Usuários
      </Link>
      <Link to="/tipos-usuario" className="text-textPrimary font-semibold hover:text-primary transition">
        Tipos de Usuário
      </Link>
    </aside>
  )
}
