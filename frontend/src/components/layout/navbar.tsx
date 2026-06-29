import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, LayoutDashboard, Briefcase, BarChart3, LogOut, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { useLogout } from '@/hooks/useAuth'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useAuthStore } from '@/store/authStore'
import { TutorialModal } from '@/components/tutorial/tutorialModal'
import type { LucideIcon } from 'lucide-react'

interface INavLink {
  label: string
  href: string
  icon: LucideIcon
}

const NAV_LINKS: INavLink[] = [
  { label: 'Contacts', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Annonces', href: '/job-offers', icon: Briefcase },
  { label: 'Stats', href: '/stats', icon: BarChart3 },
]

export function Navbar() {
  const location = useLocation()
  const logout = useLogout()
  const { theme, toggle } = useDarkMode()
  const user = useAuthStore((s) => s.user)
  const [tutorialOpen, setTutorialOpen] = useState(false)

  return (
    <>
    <nav className="flex items-center gap-2 sm:gap-8 py-3 border-b border-border mb-6">
      <Link to="/dashboard">
        <Logo className="h-8 w-auto" />
      </Link>
      <div className="flex items-center gap-2 sm:gap-6">
        {NAV_LINKS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            aria-label={label}
            className={cn(
              'flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-foreground',
              location.pathname === href
                ? 'text-foreground border-b-2 border-primary pb-0.5'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {user?.role === 'guest' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTutorialOpen(true)}
            aria-label="Tutoriel"
            className="flex items-center gap-1.5"
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Tutoriel</span>
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={toggle} aria-label="Basculer le thème">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          aria-label="Se déconnecter"
          className="flex items-center gap-1.5"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Se déconnecter</span>
        </Button>
      </div>
    </nav>
    <TutorialModal open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </>
  )
}

Navbar.displayName = 'Navbar'
