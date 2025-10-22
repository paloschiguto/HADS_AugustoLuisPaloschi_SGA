import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './services/authContext'
import { ThemeProvider } from './hooks/ThemeContext'
import { Login } from './pages/login'
import Layout from './components/layout'
import Dashboard from './pages/dashboard'
import { TiposUsuario } from './pages/tipoUsuario'
import { Usuarios } from './pages/usuarios'
import { Pacientes } from './pages/pacientes'
import { Medicamentos } from './pages/medicamentos'
import { Atendimentos } from './pages/atendimento'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-6 text-center">Carregando...</div>

  return user ? children : <Navigate to="/login" />
}


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tipos-usuario" element={<TiposUsuario />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="pacientes" element={<Pacientes />} />
              <Route path="medicamentos" element={<Medicamentos />} />
              <Route path="atendimentos" element={<Atendimentos />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
