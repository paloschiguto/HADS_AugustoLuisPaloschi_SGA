import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import { useTheme } from '../hooks/ThemeContext'
import { useAuth } from '../services/authContext'

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Erro ao deslogar', err)
    }
  }

  const permissoes = user?.permissoes || []

  const handleLinkClick = () => {
    if (open) setOpen(false)
  }

  return (
    <>
      {/* Botão Hamburger mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-100 dark:bg-gray-700 rounded shadow"
        onClick={() => setOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`bg-surface dark:bg-gray-800 w-64 h-screen border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col transition-transform
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static z-50`}
      >
        {/* Botão fechar mobile */}
        <button className="md:hidden self-end mb-4 text-textPrimary dark:text-gray-200" onClick={() => setOpen(false)}>
          <X size={24} />
        </button>


        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-textPrimary dark:text-gray-200">SGA</h2>
          <nav className="flex flex-col gap-2">
            <Link
              to="/dashboard"
              onClick={handleLinkClick}
              className="text-textPrimary dark:text-gray-200 font-semibold px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Dashboard
            </Link>

            {permissoes.includes("Tipo de Usuário") && (
              <Link to="/tipos-usuario" onClick={handleLinkClick} className="text-textPrimary dark:text-gray-200 font-semibold px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">Tipos de Usuário</Link>
            )}
            {permissoes.includes("Usuário") && (
              <Link to="/usuarios" onClick={handleLinkClick} className="text-textPrimary dark:text-gray-200 font-semibold px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">Usuários</Link>
            )}
            {permissoes.includes("Paciente") && (
              <Link to="/pacientes" onClick={handleLinkClick} className="text-textPrimary dark:text-gray-200 font-semibold px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">Pacientes</Link>
            )}
            {permissoes.includes("Medicamento") && (
              <Link to="/medicamentos" onClick={handleLinkClick} className="text-textPrimary dark:text-gray-200 font-semibold px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">Medicamentos</Link>
            )}
            {permissoes.includes("Atendimento") && (
              <Link to="/atendimentos" onClick={handleLinkClick} className="text-textPrimary dark:text-gray-200 font-semibold px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">Atendimentos</Link>
            )}
          </nav>
        </div>

        <div className="mt-auto flex flex-col items-center gap-4">
          <label htmlFor="darkModeLogin" className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="darkModeLogin" checked={theme === 'dark'} onChange={toggleTheme} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:bg-blue-600 transition-colors"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
          </label>
          <span className="text-sm text-gray-700 dark:text-gray-300 select-none">Tema escuro</span>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition"
          >
            <LogOut size={18} />
            Sair
          </button>

          <div className="text-sm text-gray-700 dark:text-gray-300">
            Usuário: {user?.nome || 'Desconhecido'}
          </div>
        </div>
      </aside>
    </>
  )
}
