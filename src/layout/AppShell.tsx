import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/layout/Sidebar'
import { Topbar } from '@/layout/Topbar'
import { IdleSessionPrompt } from '@/components/IdleSessionPrompt'
import { LoadingState } from '@/components/LoadingState'

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Suspense fallback={<LoadingState label="Loading…" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <IdleSessionPrompt />
    </div>
  )
}
