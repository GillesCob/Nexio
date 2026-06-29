import { useState } from 'react'
import { useExtractAndCreateJobOffer } from '@/hooks/useJobOffers'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { IJobOffer } from '@/types/jobOffer'

interface ICreateJobOfferModalProps {
  open: boolean
  onClose: () => void
  onCreated: (jobOffer: IJobOffer) => void
}

export function CreateJobOfferModal({ open, onClose, onCreated }: ICreateJobOfferModalProps) {
  const [rawText, setRawText] = useState('')
  const [preview, setPreview] = useState<IJobOffer | null>(null)
  const extractAndCreate = useExtractAndCreateJobOffer()

  const handleClose = () => {
    setRawText('')
    setPreview(null)
    extractAndCreate.reset()
    onClose()
  }

  const handleExtract = () => {
    setPreview(null)
    extractAndCreate.mutate(rawText, {
      onSuccess: (jobOffer) => {
        setPreview(jobOffer)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une annonce</DialogTitle>
        </DialogHeader>

        {!preview && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="create-rawText">
                Coller l'annonce LinkedIn
              </label>
              <textarea
                id="create-rawText"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={8}
                placeholder="Colle ici le texte de l'annonce d'emploi..."
                className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            {extractAndCreate.isError && (
              <p className="text-sm text-destructive">
                Extraction échouée. Vérifie le texte et réessaie.
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleExtract}
                disabled={!rawText.trim() || extractAndCreate.isPending}
              >
                {extractAndCreate.isPending ? 'Extraction…' : 'Extraire'}
              </Button>
            </DialogFooter>
          </>
        )}

        {preview && (
          <>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Poste</p>
                <p className="font-medium text-foreground">{preview.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Entreprise</p>
                <p className="text-foreground">{preview.company}</p>
              </div>
              {preview.location && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Localisation</p>
                  <p className="text-foreground">{preview.location}</p>
                </div>
              )}
              {preview.salary && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Salaire</p>
                  <p className="text-foreground">{preview.salary}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                {preview.remote && (
                  <span className="inline-block text-xs border border-border rounded px-1.5 py-0.5 text-foreground">
                    Remote
                  </span>
                )}
              </div>
              {preview.stack.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Stack</p>
                  <div className="flex flex-wrap gap-1">
                    {preview.stack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-block text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setPreview(null)}>
                Recommencer
              </Button>
              <Button type="button" onClick={() => { onCreated(preview!); handleClose() }}>
                Annonce créée ✓
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

CreateJobOfferModal.displayName = 'CreateJobOfferModal'
