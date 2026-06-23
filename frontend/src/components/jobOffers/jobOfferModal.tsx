import { useState, useEffect } from 'react'
import type { IJobOffer, JobOfferStatus } from '@/types/jobOffer'
import { useUpdateJobOffer, useDeleteJobOffer } from '@/hooks/useJobOffers'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const STATUS_LABELS: Record<JobOfferStatus, string> = {
  wishlist: 'Wishlist',
  applied: 'Candidaté',
  interview: 'Entretien',
  offer: 'Offre reçue',
  rejected: 'Refusé',
  accepted: 'Accepté',
}

const STATUS_OPTIONS: JobOfferStatus[] = [
  'wishlist',
  'applied',
  'interview',
  'offer',
  'rejected',
  'accepted',
]

interface IJobOfferModalProps {
  jobOffer: IJobOffer | null
  onClose: () => void
}

export function JobOfferModal({ jobOffer, onClose }: IJobOfferModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editingField, setEditingField] = useState<'company' | 'url' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [localCompany, setLocalCompany] = useState('')
  const [localUrl, setLocalUrl] = useState('')
  const updateJobOffer = useUpdateJobOffer()
  const deleteJobOffer = useDeleteJobOffer()

  useEffect(() => {
    if (jobOffer) {
      setLocalCompany(jobOffer.company)
      setLocalUrl(jobOffer.url ?? '')
      setEditingField(null)
      setEditValue('')
      setConfirmDelete(false)
    }
  }, [jobOffer])

  if (!jobOffer) return null

  const handleStatusChange = (status: JobOfferStatus) => {
    updateJobOffer.mutate({ id: jobOffer.id, data: { status } })
  }

  const handleStartEdit = (field: 'company' | 'url', currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue)
  }

  const handleSaveField = () => {
    if (!editingField) return
    updateJobOffer.mutate(
      { id: jobOffer.id, data: { [editingField]: editValue } },
      {
        onSuccess: () => {
          if (editingField === 'company') setLocalCompany(editValue)
          if (editingField === 'url') setLocalUrl(editValue)
          setEditingField(null)
          setEditValue('')
        },
      }
    )
  }

  const handleDelete = () => {
    deleteJobOffer.mutate(jobOffer.id, { onSuccess: onClose })
  }

  return (
    <Dialog open={!!jobOffer} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="truncate">{jobOffer.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Entreprise</p>
            {editingField === 'company' ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={handleSaveField}
                  disabled={updateJobOffer.isPending}
                  className="shrink-0 text-xs font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {updateJobOffer.isPending ? 'Enreg…' : 'Sauvegarder'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <p
                className="text-foreground font-medium cursor-pointer hover:underline"
                onClick={() => handleStartEdit('company', localCompany)}
              >
                {localCompany}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Statut</p>
            <select
              value={jobOffer.status}
              onChange={(e) => handleStatusChange(e.target.value as JobOfferStatus)}
              disabled={updateJobOffer.isPending}
              className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {jobOffer.remote && (
              <span className="inline-block text-xs border border-border rounded px-1.5 py-0.5 text-foreground">
                Remote
              </span>
            )}
            {jobOffer.location && (
              <span className="text-xs text-muted-foreground">{jobOffer.location}</span>
            )}
            {jobOffer.salary && (
              <span className="text-xs text-muted-foreground">{jobOffer.salary}</span>
            )}
          </div>

          {jobOffer.stack.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Stack</p>
              <div className="flex flex-wrap gap-1">
                {jobOffer.stack.map((tech) => (
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

          {jobOffer.score !== undefined && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Correspondance</p>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    jobOffer.score > 7
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : jobOffer.score >= 4
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {jobOffer.score}/10
                </span>
              </div>
              {jobOffer.scoreMatches && jobOffer.scoreMatches.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {jobOffer.scoreMatches.map((tech) => (
                    <span
                      key={tech}
                      className="inline-block text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded px-1.5 py-0.5"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {jobOffer.scoreGaps && jobOffer.scoreGaps.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {jobOffer.scoreGaps.map((tech) => (
                    <span
                      key={tech}
                      className="inline-block text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded px-1.5 py-0.5"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {jobOffer.scoreComment && (
                <p className="text-xs text-muted-foreground italic">{jobOffer.scoreComment}</p>
              )}
            </div>
          )}

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Lien</p>
            {editingField === 'url' ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  autoFocus
                  type="url"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="https://..."
                  className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button
                  type="button"
                  onClick={handleSaveField}
                  disabled={updateJobOffer.isPending}
                  className="shrink-0 text-xs font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {updateJobOffer.isPending ? 'Enreg…' : 'Sauvegarder'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Annuler
                </button>
              </div>
            ) : localUrl ? (
              <div className="flex items-center gap-2">
                <a
                  href={localUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline truncate"
                >
                  {localUrl}
                </a>
                <button
                  type="button"
                  onClick={() => handleStartEdit('url', localUrl)}
                  className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Modifier
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleStartEdit('url', '')}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Ajouter l'URL
              </button>
            )}
          </div>

          {jobOffer.description && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Description</p>
              <p className="text-foreground text-xs leading-relaxed line-clamp-6">
                {jobOffer.description}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex-col gap-2 sm:flex-row">
          {!confirmDelete ? (
            <>
              <Button type="button" variant="outline" onClick={onClose}>
                Fermer
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
              >
                Supprimer
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-destructive mr-auto">Confirmer la suppression ?</p>
              <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteJobOffer.isPending}
                onClick={handleDelete}
              >
                {deleteJobOffer.isPending ? 'Suppression…' : 'Confirmer'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

JobOfferModal.displayName = 'JobOfferModal'
