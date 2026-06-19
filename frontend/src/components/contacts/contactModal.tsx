import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { IContact, ContactStatus, IUpdateContactPayload } from '@/types/contact'
import { useUpdateContact, useDeleteContact } from '@/hooks/useContacts'
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

interface IContactModalProps {
  contact: IContact | null
  onClose: () => void
}

export function ContactModal({ contact, onClose }: IContactModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const updateContact = useUpdateContact()
  const deleteContact = useDeleteContact()

  const { register, handleSubmit, reset } = useForm<IUpdateContactPayload>()

  useEffect(() => {
    if (contact) {
      reset({
        name: contact.name,
        company: contact.company ?? '',
        linkedinUrl: contact.linkedinUrl ?? '',
        status: contact.status,
        notes: contact.notes ?? '',
      })
      setIsEditing(false)
    }
  }, [contact, reset])

  if (!contact) return null

  const handleSave = handleSubmit((data) => {
    updateContact.mutate(
      { id: contact.id, data },
      { onSuccess: () => { setIsEditing(false); onClose() } }
    )
  })

  const handleDelete = () => {
    deleteContact.mutate(contact.id, { onSuccess: onClose })
  }

  return (
    <Dialog open={!!contact} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier le contact' : contact.name}</DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nom *</Label>
              <Input id="name" {...register('name', { required: true })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company">Entreprise</Label>
              <Input id="company" {...register('company')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="linkedinUrl">URL LinkedIn</Label>
              <Input id="linkedinUrl" type="url" {...register('linkedinUrl')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                {...register('status')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                {...register('notes')}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={updateContact.isPending}>
                {updateContact.isPending ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="mt-2 space-y-3 text-sm">
            {contact.company && (
              <div>
                <span className="text-slate-500">Entreprise</span>
                <p className="font-medium">{contact.company}</p>
              </div>
            )}
            <div>
              <span className="text-slate-500">Statut</span>
              <p className="font-medium">{STATUS_LABELS[contact.status]}</p>
            </div>
            {contact.linkedinUrl && (
              <div>
                <span className="text-slate-500">LinkedIn</span>
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block font-medium text-blue-600 hover:underline truncate"
                >
                  {contact.linkedinUrl}
                </a>
              </div>
            )}
            {contact.notes && (
              <div>
                <span className="text-slate-500">Notes</span>
                <p className="whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}
            <DialogFooter className="mt-4">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteContact.isPending}
              >
                {deleteContact.isPending ? 'Suppression…' : 'Supprimer'}
              </Button>
              <Button onClick={() => setIsEditing(true)}>Éditer</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

ContactModal.displayName = 'ContactModal'
