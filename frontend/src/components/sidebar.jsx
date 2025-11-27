import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Shield,
  Users,
  User,
  Pill,
  ClipboardList,
  Calendar,
  Moon,
  Sun
} from 'lucide-react'
import { useTheme } from '../hooks/ThemeContext'
import { useAuth } from '../services/authContext'

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() 

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Erro ao deslogar', err)
    }
  }

  const permissoes = user?.permissoes || []

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: null }, // null = liberado geral
    { label: 'Tipos de Usuário', path: '/tipos-usuario', icon: Shield, permission: 'Tipo de Usuário' },
    { label: 'Usuários', path: '/usuarios', icon: Users, permission: 'Usuário' },
    { label: 'Pacientes', path: '/pacientes', icon: User, permission: 'Paciente' },
    { label: 'Medicamentos', path: '/medicamentos', icon: Pill, permission: 'Medicamento' },
    { label: 'Atendimentos', path: '/atendimentos', icon: ClipboardList, permission: 'Atendimento' },
    { label: 'Agenda', path: '/agenda', icon: Calendar, permission: 'Agenda' },
  ]

  const handleLinkClick = () => {
    if (open) setOpen(false)
  }

  const canShow = (permission) => {
    if (!permission) return true
    return permissoes.includes(permission)
  }

  return (
    <>
      {/* Botão Hamburger mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700"
        onClick={() => setOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Overlay Mobile */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          bg-white dark:bg-gray-800 
          w-72 h-screen 
          border-r border-gray-200 dark:border-gray-700 
          p-5 flex flex-col 
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 fixed md:sticky md:top-0 z-50 shadow-xl md:shadow-none
        `}
      >
        {/* Cabeçalho Sidebar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 px-2">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">SGA</h2>
          </div>

          <button className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400" onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
          {menuItems.map((item) => (
            canShow(item.permission) && (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group font-medium
                  ${location.pathname === item.path
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' // Estilo Ativo
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400' // Estilo Inativo
                  }
                `}
              >
                <item.icon
                  size={20}
                  className={location.pathname === item.path ? 'text-white' : 'text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'}
                />
                {item.label}
              </Link>
            )
          ))}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">

          {/* Toggle Dark Mode (Botão Melhorado) */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium flex items-center gap-2">
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
            {/* Mini Switch Visual */}
            <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`}></div>
            </div>
          </button>

          {/* Card do Usuário + Logout */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.nome?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user?.nome?.split(' ')[0] || 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.tipoUsuario?.descricao || 'Visitante'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>

        </div>
      </aside>
    </>
  )
}