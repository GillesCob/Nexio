import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogin } from '@/hooks/useAuth'
import type { ILoginPayload } from '@/types/auth'

export function LoginPage() {
  const { register, handleSubmit } = useForm<ILoginPayload>()
  const { mutate: login, isPending, error } = useLogin()

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-center">Connexion</h1>

        <form onSubmit={handleSubmit((data) => login(data))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email', { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password', { required: true })}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {(error as { response?: { data?: { message?: string } } }).response?.data?.message ??
                'Une erreur est survenue'}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>

        <div className="text-center text-sm space-y-1">
          <p>
            Pas de compte ?{' '}
            <Link to="/register" className="underline">
              S&apos;inscrire
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" className="underline text-muted-foreground">
              Mot de passe oublié ?
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
