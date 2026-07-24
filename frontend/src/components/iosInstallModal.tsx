import { PlusSquare, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface IIosInstallModalProps {
  open: boolean
  onClose: () => void
  onDismiss: () => void
}

const steps = [
  {
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    text: (
      <>
        Appuyez sur le bouton <strong>Partager</strong>{' '}
        <Upload className="inline h-3.5 w-3.5 align-middle text-blue-500" /> en bas de Safari.
      </>
    ),
  },
  {
    bgClass: 'bg-green-50 dark:bg-green-950/30',
    text: (
      <>
        Faites défiler et choisissez <strong>« Sur l'écran d'accueil »</strong>{' '}
        <PlusSquare className="inline h-3.5 w-3.5 align-middle text-green-600" />.
      </>
    ),
  },
  {
    bgClass: 'bg-muted',
    text: (
      <>
        Confirmez en appuyant sur <strong>« Ajouter »</strong> en haut à droite.
      </>
    ),
  },
]

export function IosInstallModal({ open, onClose, onDismiss }: IIosInstallModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex justify-center">
            <img src="/icon-192.png" alt="Nexio" className="h-20 w-20 rounded-2xl shadow" />
          </div>
          <DialogTitle className="text-center text-xl">Installer Nexio</DialogTitle>
          <DialogDescription className="text-center">
            Accédez à l'app directement depuis votre écran d'accueil, gérez vos contacts et vos messages sans repasser par le navigateur.
          </DialogDescription>
        </DialogHeader>

        <ol className="mt-2 space-y-3">
          {steps.map((step, i) => (
            <li key={i} className={`flex items-start gap-3 rounded-xl p-3 ${step.bgClass}`}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background shadow-sm text-sm font-bold text-foreground">
                {i + 1}
              </span>
              <p className="text-sm leading-snug text-foreground">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-col gap-2">
          <Button onClick={onDismiss} className="w-full">
            Ne plus afficher
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Plus tard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
