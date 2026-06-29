import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Inscription désactivée</h1>

        <p className="text-sm text-muted-foreground">
          L&apos;inscription publique n&apos;est pas disponible pour le moment.
          Nexio est en cours de transition vers une version multi-utilisateurs.
        </p>

        <Button asChild className="w-full">
          <Link to="/login">Voir la démo</Link>
        </Button>
      </div>
    </main>
  )
}
