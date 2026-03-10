import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { MobileNav } from "@/components/layout/MobileNav"
import { InstallBanner } from "@/components/pwa/InstallBanner"
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <OfflineIndicator />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
          {children}
        </main>
        <MobileNav />
      </div>
      <InstallBanner />
    </div>
  )
}
