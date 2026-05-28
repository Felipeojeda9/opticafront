import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-bone-bg">
      <Sidebar />
      <main className="ml-sidebar min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}