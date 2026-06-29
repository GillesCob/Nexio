import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useAuth";
import type { ILoginPayload } from "@/types/auth";

export function LoginPage() {
  const { register, handleSubmit, setValue } = useForm<ILoginPayload>();
  const { mutate: login, isPending, error } = useLogin();

  const handleDemoLogin = () => {
    setValue("email", "guest@nexio.dev");
    setValue("password", "guest1234");
    login({ email: "guest@nexio.dev", password: "guest1234" });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "1") {
      handleDemoLogin();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-center">Connexion</h1>

        <form onSubmit={handleSubmit((data) => login(data))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email", { required: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password", { required: true })}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {(error as { response?: { data?: { message?: string } } }).response?.data?.message ??
                "Une erreur est survenue"}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Connexion…" : "Se connecter"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <Button type="button" variant="outline" className="w-full" disabled={isPending} onClick={handleDemoLogin}>
          Voir la démo
        </Button>

        <div className="text-center text-sm space-y-1">
          <p>
            Pas de compte ?{" "}
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
  );
}
