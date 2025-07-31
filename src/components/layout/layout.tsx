import { Header, MainNav } from "./header"

interface LayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Appointments",
    href: "/appointments",
  },
  {
    title: "Doctors",
    href: "/doctors",
  },
  {
    title: "Profile",
    href: "/profile",
  },
]

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header>
        <MainNav items={navigationItems} />
        <div className="ml-auto flex items-center space-x-4">
          {/* Add user menu or login/logout buttons here */}
        </div>
      </Header>
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  )
}
