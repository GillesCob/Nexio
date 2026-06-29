import { useState, useEffect } from 'react'
import { Pencil, ChevronDown, ChevronUp } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { IContact, ICompany, ContactStatus, IUpdateContactPayload } from '@/types/contact'
import { useUpdateContact, useDeleteContact, useExtractCompany, useSuggestTemplate, useCreateMessage, useGetMessages, useGetRelances, useSuggestRelance, useTouchContact } from '@/hooks/useContacts'
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
import { StatusActions } from '@/components/contacts/statusActions'

const STATUS_LABELS: Record<ContactStatus, string> = {
  to_contact: 'À contacter',
  contacted: 'Contacté',
  replied: 'Echange en cours',
  meeting_scheduled: 'RDV planifié',
  follow_up: 'A relancer',
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

type ITimelineEvent =
  | { id: string; type: 'contact_added' | 'last_update'; date: Date; label: string }
  | { id: string; type: 'message'; date: Date; label: string; content: string }

interface IContactModalProps {
  contact: IContact | null
  onClose: () => void
}

export function ContactModal({ contact, onClose }: IContactModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [rawCompanyText, setRawCompanyText] = useState('')
  const [suggestedMessage, setSuggestedMessage] = useState<string | null>(null)
  const [suggestedRelance, setSuggestedRelance] = useState<string | null>(null)
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [copied, setCopied] = useState(false)
  const [copiedRelance, setCopiedRelance] = useState(false)
  const [localStatus, setLocalStatus] = useState<ContactStatus>(contact?.status ?? 'to_contact')
  const [localCompany, setLocalCompany] = useState<ICompany | undefined>(contact?.companyRef)
  const [openEventId, setOpenEventId] = useState<string | null>(null)
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)

  const updateContact = useUpdateContact()
  const deleteContact = useDeleteContact()
  const extractCompany = useExtractCompany()
  const suggestTemplate = useSuggestTemplate()
  const suggestRelance = useSuggestRelance()
  const createMessage = useCreateMessage()
  const touchContact = useTouchContact()
  const { data: messages = [] } = useGetMessages(contact?.id ?? '')
  const { data: relanceResult } = useGetRelances()
  const relanceInfo = contact ? relanceResult?.toFollowUp.find((r) => r.id === contact.id) : undefined
  const repliedRelanceInfo = contact ? relanceResult?.toCheckReplied.find((r) => r.id === contact.id) : undefined

  const { register, handleSubmit, reset } = useForm<IUpdateContactPayload>()

  useEffect(() => {
    if (contact) {
      reset({
        name: contact.name,
        company: contact.company ?? '',
        linkedinUrl: contact.linkedinUrl ?? '',
        jobTitle: contact.jobTitle ?? '',
        status: contact.status,
        notes: contact.notes ?? '',
      })
      setIsEditing(false)
      setRawCompanyText('')
      setSuggestedMessage(null)
      setSuggestedRelance(null)
      setExtractionStatus('idle')
      setLocalStatus(contact.status)
      setLocalCompany(contact.companyRef)
      setOpenEventId(null)
      setIsTimelineOpen(false)
    }
  }, [contact, reset])

  if (!contact) return null

  const formatDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const timelineEvents: ITimelineEvent[] = [
    { id: 'contact_added', type: 'contact_added' as const, date: new Date(contact.createdAt), label: 'Contact ajouté' },
    ...messages.map((msg) => ({
      id: msg.id,
      type: 'message' as const,
      date: new Date(msg.createdAt),
      label: 'Message envoyé',
      content: msg.content,
    })),
    ...(contact.updatedAt > contact.createdAt
      ? [{ id: 'last_update', type: 'last_update' as const, date: new Date(contact.updatedAt), label: 'Dernière mise à jour' }]
      : []),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  const handleStatusChange = (status: ContactStatus) => {
    updateContact.mutate(
      { id: contact.id, data: { status } },
      { onSuccess: () => setLocalStatus(status) }
    )
  }

  const handleSave = handleSubmit((data) => {
    updateContact.mutate(
      { id: contact.id, data },
      { onSuccess: () => { setIsEditing(false); onClose() } }
    )
  })

  const handleDelete = () => {
    deleteContact.mutate(contact.id, { onSuccess: onClose })
  }

  const handleExtractCompany = () => {
    setExtractionStatus('idle')
    extractCompany.mutate({ rawText: rawCompanyText, contactId: contact.id }, {
      onSuccess: (company) => {
        setLocalCompany(company)
        setExtractionStatus('success')
        setTimeout(() => setExtractionStatus('idle'), 3000)
      },
      onError: () => {
        setExtractionStatus('error')
        setTimeout(() => setExtractionStatus('idle'), 3000)
      },
    })
  }

  const handleSuggestTemplate = () => {
    suggestTemplate.mutate(contact.id, {
      onSuccess: (data) => {
        setSuggestedMessage(data.message)
      },
    })
  }

  const handleCopyMessage = () => {
    if (!suggestedMessage) return
    navigator.clipboard.writeText(suggestedMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    createMessage.mutate({ contactId: contact.id, content: suggestedMessage })
  }

  const handleSuggestRelance = () => {
    suggestRelance.mutate(contact.id, {
      onSuccess: (data) => {
        setSuggestedRelance(data.message)
      },
    })
  }

  const handleCopyRelance = () => {
    if (!suggestedRelance) return
    navigator.clipboard.writeText(suggestedRelance)
    setCopiedRelance(true)
    setTimeout(() => setCopiedRelance(false), 3000)
    createMessage.mutate({ contactId: contact.id, content: suggestedRelance })
    handleStatusChange('contacted')
  }

  return (
    <Dialog open={!!contact} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-10">
            <DialogTitle>{isEditing ? 'Modifier le contact' : contact.name}</DialogTitle>
            <Button
              variant={isEditing ? 'secondary' : 'ghost'}
              size="icon"
              type="button"
              onClick={() => setIsEditing(prev => !prev)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {relanceInfo && (
          <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
            Relance recommandée — {relanceInfo.daysSinceUpdate} jour{relanceInfo.daysSinceUpdate > 1 ? 's' : ''} sans nouvelles
          </div>
        )}

        {repliedRelanceInfo && (
          <div className="rounded-md border border-indigo-300 bg-indigo-50 text-indigo-800 px-3 py-2 text-sm">
            Echange toujours en cours ? — {repliedRelanceInfo.daysSinceUpdate} jour{repliedRelanceInfo.daysSinceUpdate > 1 ? 's' : ''} sans nouvelles
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                {...register('name', { required: true })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jobTitle">Poste</Label>
              <Input
                id="jobTitle"
                {...register('jobTitle')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                {...register('company')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="linkedinUrl">URL LinkedIn</Label>
              <Input
                id="linkedinUrl"
                type="url"
                {...register('linkedinUrl')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                {...register('status')}
                className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
            <DialogFooter className="mt-2">
              <Button type="submit" disabled={updateContact.isPending}>
                {updateContact.isPending ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="mt-2 space-y-4 text-sm">
            {contact.jobTitle && (
              <div>
                <span className="text-muted-foreground">Poste</span>
                <p className="font-medium">{contact.jobTitle}</p>
              </div>
            )}
            {contact.company && (
              <div>
                <span className="text-muted-foreground">Entreprise</span>
                <p className="font-medium">{contact.company}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Statut</span>
              <p className="font-medium mb-2">{STATUS_LABELS[localStatus]}</p>
              <StatusActions
                contact={{ ...contact, status: localStatus }}
                onStatusChange={handleStatusChange}
                isRepliedAlert={!!repliedRelanceInfo}
                onTouch={() => touchContact.mutate(contact.id)}
              />
            </div>
            {contact.linkedinUrl && (
              <div>
                <span className="text-muted-foreground">LinkedIn</span>
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block font-medium text-primary hover:underline truncate"
                >
                  {contact.linkedinUrl}
                </a>
              </div>
            )}
            {contact.notes && (
              <div>
                <span className="text-muted-foreground">Notes</span>
                <p className="whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}

            <div className="border-t border-border pt-4 flex flex-col gap-2">
              <span className="text-muted-foreground font-medium">Entreprise LinkedIn</span>
              {localCompany ? (
                <div className="rounded-md bg-muted px-3 py-2">
                  <p className="font-medium">{localCompany.name}</p>
                  {localCompany.sector && (
                    <p className="text-xs text-muted-foreground">{localCompany.sector}{localCompany.size ? ` · ${localCompany.size}` : ''}</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <textarea
                    value={rawCompanyText}
                    onChange={(e) => setRawCompanyText(e.target.value)}
                    rows={3}
                    placeholder="Colle ici le texte de la page LinkedIn entreprise…"
                    className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExtractCompany}
                    disabled={!rawCompanyText.trim() || extractCompany.isPending}
                    className="self-end"
                  >
                    {extractCompany.isPending ? 'Extraction…' : 'Extraire l\'entreprise'}
                  </Button>
                  {extractionStatus === 'success' && (
                    <p className="text-xs text-foreground">Entreprise extraite avec succès.</p>
                  )}
                  {extractionStatus === 'error' && (
                    <p className="text-xs text-foreground">Échec de l'extraction. Vérifie le texte saisi.</p>
                  )}
                </div>
              )}
            </div>

            {localStatus === 'to_contact' && messages.length === 0 && (
              <div className="border-t border-border pt-4 flex flex-col gap-2">
                <span className="text-muted-foreground font-medium">Message 1er contact</span>
                {suggestedMessage ? (
                  copied ? (
                    <p className="text-sm text-muted-foreground">Message copié — visible dans la timeline</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <textarea
                        readOnly
                        value={suggestedMessage}
                        rows={8}
                        className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm resize-none"
                      />
                      <Button type="button" variant="outline" onClick={handleCopyMessage} className="self-end">
                        Copier
                      </Button>
                    </div>
                  )
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSuggestTemplate}
                    disabled={suggestTemplate.isPending}
                    className="self-start"
                  >
                    {suggestTemplate.isPending ? 'Génération…' : 'Générer le message'}
                  </Button>
                )}
              </div>
            )}

            {localStatus === 'follow_up' && (
              <div className="border-t border-border pt-4 flex flex-col gap-2">
                <span className="text-muted-foreground font-medium">Relance</span>
                {suggestedRelance ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      readOnly
                      value={suggestedRelance}
                      rows={8}
                      className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm resize-none"
                    />
                    <Button type="button" variant="outline" onClick={handleCopyRelance} className="self-end">
                      {copiedRelance ? 'Copié ✓' : 'Copier'}
                    </Button>
                    {copiedRelance && (
                      <p className="text-sm text-muted-foreground">Message copié — contact repassé en Contacté</p>
                    )}
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSuggestRelance}
                    disabled={suggestRelance.isPending}
                    className="self-start"
                  >
                    {suggestRelance.isPending ? 'Génération…' : 'Générer une relance'}
                  </Button>
                )}
              </div>
            )}

            <div className="border-t border-border pt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsTimelineOpen((prev) => !prev)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-muted-foreground font-medium">Timeline</span>
                {isTimelineOpen
                  ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              {isTimelineOpen && (
                <ul className="flex flex-col">
                  {timelineEvents.map((event) => (
                    <li key={event.id} className="border-b border-border last:border-b-0">
                      <div
                        className={`flex items-center gap-3 py-2 px-1 text-sm${event.type === 'message' ? ' cursor-pointer hover:bg-muted rounded-md' : ''}`}
                        onClick={() => {
                          if (event.type !== 'message') return
                          setOpenEventId(openEventId === event.id ? null : event.id)
                        }}
                      >
                        <span className="text-xs text-muted-foreground shrink-0">{formatDate(event.date)}</span>
                        <span className="font-medium flex-1">{event.label}</span>
                        {event.type === 'message' && (
                          <span className="text-muted-foreground text-xs">{openEventId === event.id ? '▲' : '▼'}</span>
                        )}
                      </div>
                      {event.type === 'message' && openEventId === event.id && (
                        <p className="whitespace-pre-wrap text-sm text-foreground bg-muted rounded-md px-3 py-2 mb-2">
                          {event.content}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <DialogFooter className="mt-2">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteContact.isPending}
              >
                {deleteContact.isPending ? 'Suppression…' : 'Supprimer'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

ContactModal.displayName = 'ContactModal'
