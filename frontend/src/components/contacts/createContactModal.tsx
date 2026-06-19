import { useForm } from 'react-hook-form'
import type { ICreateContactPayload, ContactStatus } from '@/types/contact'
import { useCreateContact } from '@/hooks/useContacts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const STATUS_LABELS: Record<ContactStatus, string> = {
  to_contact: 'À contacter',
  contacted: 'Contacté',
  replied: 'A répondu',
  meeting_scheduled: 'RDV planifié',
  follow_up: 'Relance',
  closed: 'Fermé',
}

const STATUS_OPTIONS: ContactStatus[] = [
  'to_contact',
  'contacted',
  'replied',
  'meeting_scheduled',
  'follow_up',
  'closed',
]

interface ICreateContactModalProps {
  open: boolean
  onClose: () => void
}

export function CreateContactModal({ open, onClose }: ICreateContactModalProps) {
  const createContact = useCreateContact()
  const { register, handleSubmit, reset } = useForm<ICreateContactPayload>({
    defaultValues: { status: 'to_contact' },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = handleSubmit((data) => {
    createContact.mutate(data, { onSuccess: handleClose })
  })

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-name">Nom *</Label>
            <Input id="create-name" {...register('name', { required: true })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-company">Entreprise</Label>
            <Input id="create-company" {...register('company')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-linkedinUrl">URL LinkedIn</Label>
            <Input id="create-linkedinUrl" type="url" {...register('linkedinUrl')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-status">Statut</Label>
            <select
              id="create-status"
              {...register('status')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-notes">Notes</Label>
            <textarea
              id="create-notes"
              {...register('notes')}
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={createContact.isPending}>
              {createContact.isPending ? 'Création…' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

CreateContactModal.displayName = 'CreateContactModal'
