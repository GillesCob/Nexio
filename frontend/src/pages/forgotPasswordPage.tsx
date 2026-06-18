import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForgotPassword } from '@/hooks/useAuth'
import type { IForgotPasswordPayload } from '@/types/auth'

export function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm<IForgotPasswordPayload>()
  const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword()

  if (isSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Email envoyé</h1>
          <p className="text-muted-foreground">
            Si cette adresse est associée à un compte, vous recevrez un lien de réinitialisation
            dans quelques minutes.
          </p>
          <Link to="/login" className="text-sm underline">
            Retour à la connexion
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-center">Mot de passe oublié</h1>
          <p className="text-sm text-muted-foreground text-center">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        <form onSubmit={handleSubmit((data) => forgotPassword(data))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email', { required: true })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Envoi…' : 'Envoyer le lien'}
          </Button>
        </form>

        <p className="text-center text-sm">
          <Link to="/login" className="underline text-muted-foreground">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  )
}
