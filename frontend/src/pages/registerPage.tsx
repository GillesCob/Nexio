import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRegister } from '@/hooks/useAuth'
import type { IRegisterPayload } from '@/types/auth'

export function RegisterPage() {
  const { register, handleSubmit } = useForm<IRegisterPayload>()
  const { mutate: registerUser, isPending, error } = useRegister()

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-center">Créer un compte</h1>

        <form onSubmit={handleSubmit((data) => registerUser(data))} className="space-y-4">
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
              autoComplete="new-password"
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
            {isPending ? 'Création…' : 'Créer mon compte'}
          </Button>
        </form>

        <p className="text-center text-sm">
          Déjà un compte ?{' '}
          <Link to="/login" className="underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  )
}
