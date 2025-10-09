import { AuthProvider } from './services/authContext'
import { Login } from './pages/login'
import { TiposUsuario } from './pages/tipoUsuario'
import { useAuth } from './services/authContext'

function AppContent() {
  const { user } = useAuth()
  return user ? <TiposUsuario /> : <Login />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
