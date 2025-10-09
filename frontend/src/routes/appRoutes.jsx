import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LayoutPrincipal from '../components/layout'
import Login from '../pages/login'
import Dashboard from '../pages/dashboard'
import TiposUsuario from '../pages/tipoUsuario'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<LayoutPrincipal />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tipos-usuario" element={<TiposUsuario />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
