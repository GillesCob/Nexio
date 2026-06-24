import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/hooks/useAuth'
import { useDarkMode } from '@/hooks/useDarkMode'

interface INavLink {
  label: string
  href: string
}

const NAV_LINKS: INavLink[] = [
  { label: 'Contacts', href: '/dashboard' },
  { label: 'Annonces', href: '/job-offers' },
  { label: 'Stats', href: '/stats' },
]

export function Navbar() {
  const location = useLocation()
  const logout = useLogout()
  const { theme, toggle } = useDarkMode()

  return (
    <nav className="flex items-center gap-8 py-3 border-b border-border mb-6">
      <Link to="/dashboard">
        <img src="/logo.png" alt="Nexio" className="h-8 w-auto" />
      </Link>
      <div className="flex items-center gap-6">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-foreground',
              location.pathname === link.href
                ? 'text-foreground border-b-2 border-primary pb-0.5'
                : 'text-muted-foreground'
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={toggle} aria-label="Basculer le thème">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          Se déconnecter
        </Button>
      </div>
    </nav>
  )
}

Navbar.displayName = 'Navbar'
