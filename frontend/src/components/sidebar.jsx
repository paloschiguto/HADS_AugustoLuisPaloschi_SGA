import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/ThemeContext'
import { LogOut } from 'lucide-react'
import { useAuth } from '../services/authContext'

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout() 
      navigate('/login')
    } catch (err) {
      console.error('Erro ao deslogar', err)
    }
  }

  return (
    <aside className="bg-surface dark:bg-gray-800 w-64 min-h-screen border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col transition-colors">

      {/* Topo: logo + links */}
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-textPrimary dark:text-gray-200">
          SGA
        </h2>

        <nav className="flex flex-col gap-2">
          <Link to="/dashboard" className="text-textPrimary dark:text-gray-200 font-semibold px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">Dashboard</Link>
          <Link to="/tipos-usuario" className="text-textPrimary dark:text-gray-200 font-semibold px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">Tipos de Usuário</Link>
          <Link to="/usuarios" className="text-textPrimary dark:text-gray-200 font-semibold px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">Usuários</Link>
          <Link to="/pacientes" className="text-textPrimary dark:text-gray-200 font-semibold px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">Pacientes</Link>
          <Link to="/medicamentos" className="text-textPrimary dark:text-gray-200 font-semibold px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">Medicamentos</Link>
          <Link to="/atendimentos" className="text-textPrimary dark:text-gray-200 font-semibold px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">Atendimentos</Link>
        </nav>
      </div>

      {/* Rodapé: switch de tema + logout */}
      <div className="mt-auto flex flex-col items-center gap-4">

        {/* Switch de tema */}
        <label htmlFor="darkModeLogin" className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="darkModeLogin" checked={theme === 'dark'} onChange={toggleTheme} className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:bg-blue-600 transition-colors"></div>
          <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
        </label>
        <span className="text-sm text-gray-700 dark:text-gray-300 select-none">Tema escuro</span>

        {/* Botão de logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>

    </aside>
  )
}
