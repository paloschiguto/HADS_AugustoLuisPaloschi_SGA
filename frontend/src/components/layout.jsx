import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-background dark:bg-gray-900 text-textPrimary dark:text-gray-100 transition-colors">
        <Outlet />
      </main>


    </div>
  )
}
