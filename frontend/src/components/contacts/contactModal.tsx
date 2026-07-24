import { useState, useEffect } from 'react'
import { Pencil, ChevronDown, ChevronUp, Clipboard, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { IContact, ICompany, ContactStatus, IUpdateContactPayload, FluxCode } from '@/types/contact'
import { useUpdateContact, useDeleteContact, useExtractContact, useExtractCompany, useEnrichCompany, useUpdateCompany, useScoreContact, useSuggestTemplate, useCreateMessage, useGetMessages, useGetRelances, useSuggestRelance, useTouchContact } from '@/hooks/useContacts'
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
  to_contact: 'Invitation envoyée',
  to_message: 'Message à envoyer',
  contacted: 'Contacté',
  replied: 'Echange en cours',
  meeting_scheduled: 'RDV planifié',
  follow_up: 'A relancer',
  closed: 'Fermé',
}

const FLUX_LABELS: Record<FluxCode, string> = {
  '1a': 'RH / Recrutement — ESN',
  '1b': 'RH / Recrutement — Entreprise classique',
  '2': 'CTO / Dirigeant technique',
  '3': 'Lead Dev / Tech Lead',
  '4': 'Business Manager — ESN',
}

const FLUX_OPTIONS: FluxCode[] = ['1a', '1b', '2', '3', '4']

const STATUS_OPTIONS: ContactStatus[] = [
  'to_contact',
  'to_message',
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
  const [rawContactText, setRawContactText] = useState('')
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [relanceError, setRelanceError] = useState<string | null>(null)
  const [extractionStatus, setExtractionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [contactExtractionStatus, setContactExtractionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [companyExtractionError, setCompanyExtractionError] = useState<string | null>(null)
  const [contactExtractionError, setContactExtractionError] = useState<string | null>(null)
  const [outOfScopeNotice, setOutOfScopeNotice] = useState<string | null>(null)
  const [localStatus, setLocalStatus] = useState<ContactStatus>(contact?.status ?? 'to_contact')
  const [localCompany, setLocalCompany] = useState<ICompany | undefined>(contact?.companyRef)
  const [localJobTitle, setLocalJobTitle] = useState(contact?.jobTitle ?? null)
  const [localNotes, setLocalNotes] = useState(contact?.notes ?? '')
  const [notesSaved, setNotesSaved] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [isContactInfoModalOpen, setIsContactInfoModalOpen] = useState(false)
  const [localSector, setLocalSector] = useState('')
  const [sectorSaved, setSectorSaved] = useState(false)

  const updateContact = useUpdateContact()
  const deleteContact = useDeleteContact()
  const extractContact = useExtractContact()
  const extractCompany = useExtractCompany()
  const enrichCompany = useEnrichCompany()
  const updateCompany = useUpdateCompany()
  const scoreContact = useScoreContact()
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
      setRawContactText('')
      setTemplateError(null)
      setRelanceError(null)
      setExtractionStatus('idle')
      setContactExtractionStatus('idle')
      setCompanyExtractionError(null)
      setContactExtractionError(null)
      setOutOfScopeNotice(null)
      setIsCompanyModalOpen(false)
      setIsContactInfoModalOpen(false)
      setLocalStatus(contact.status)
      setLocalCompany(contact.companyRef)
      setLocalJobTitle(contact.jobTitle ?? null)
      setLocalNotes(contact.notes ?? '')
      setNotesSaved(false)
      setLocalSector(contact.companyRef?.sector ?? '')
      setSectorSaved(false)
      setCopiedMessageId(null)
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
      {
        onSuccess: () => {
          setLocalStatus(status)
          if (status === 'closed') onClose()
        },
      }
    )
  }

  const handleSave = handleSubmit((data) => {
    updateContact.mutate(
      { id: contact.id, data },
      { onSuccess: () => { setIsEditing(false) } }
    )
  })

  const handleSaveNotes = () => {
    updateContact.mutate(
      { id: contact.id, data: { notes: localNotes } },
      {
        onSuccess: () => {
          setNotesSaved(true)
          setTimeout(() => setNotesSaved(false), 2000)
        },
      }
    )
  }

  const handleFluxChange = (flux: FluxCode) => {
    updateContact.mutate({ id: contact.id, data: { flux } })
  }

  const handleSaveSector = () => {
    if (!localCompany) return
    updateCompany.mutate(
      { companyId: localCompany.id, data: { sector: localSector } },
      {
        onSuccess: () => {
          setSectorSaved(true)
          setTimeout(() => setSectorSaved(false), 2000)
        },
      }
    )
  }

  const handleDelete = () => {
    deleteContact.mutate(contact.id, { onSuccess: onClose })
  }

  const handleExtractCompany = () => {
    setExtractionStatus('idle')
    setCompanyExtractionError(null)
    extractCompany.mutate({ rawText: rawCompanyText, contactId: contact.id }, {
      onSuccess: (company) => {
        setLocalCompany(company)
        setIsCompanyModalOpen(false)
        setExtractionStatus('success')
        setTimeout(() => setExtractionStatus('idle'), 3000)
      },
      onError: (err) => {
        const message =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
          "Échec de l'extraction. Vérifie le texte saisi."
        setCompanyExtractionError(message)
      },
    })
  }

  const handleEnrichCompany = () => {
    if (!localCompany) return
    setExtractionStatus('idle')
    setCompanyExtractionError(null)
    enrichCompany.mutate(
      { companyId: localCompany.id, rawText: rawCompanyText },
      {
        onSuccess: (company) => {
          setLocalCompany(company)
          setRawCompanyText('')
          setIsCompanyModalOpen(false)
          setExtractionStatus('success')
          setTimeout(() => setExtractionStatus('idle'), 3000)
        },
        onError: (err) => {
          const message =
            (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
            "Échec de l'extraction. Vérifie le texte saisi."
          setCompanyExtractionError(message)
        },
      }
    )
  }

  const handleExtractContactInfo = () => {
    setContactExtractionStatus('idle')
    setContactExtractionError(null)
    setOutOfScopeNotice(null)
    extractContact.mutate(rawContactText, {
      onSuccess: (data) => {
        const updatedName = data.name || contact.name
        const updatedJobTitle = data.jobTitle || localJobTitle || undefined
        const updatedCompany = data.company || contact.company || undefined

        updateContact.mutate(
          {
            id: contact.id,
            data: {
              ...(data.name ? { name: data.name } : {}),
              ...(data.company ? { company: data.company } : {}),
              ...(data.linkedinUrl ? { linkedinUrl: data.linkedinUrl } : {}),
              ...(data.jobTitle ? { jobTitle: data.jobTitle } : {}),
              ...(data.location ? { location: data.location } : {}),
            },
          },
          {
            onSuccess: () => {
              if (data.jobTitle) setLocalJobTitle(data.jobTitle)
              setRawContactText('')
              setIsContactInfoModalOpen(false)
              setContactExtractionStatus('success')
              setTimeout(() => setContactExtractionStatus('idle'), 3000)

              // Vérifie le scope à chaque mise à jour LinkedIn — hors scope : fermé automatiquement
              // (jamais supprimé, un Contact fermé garde son historique de messages)
              scoreContact.mutate(
                {
                  name: updatedName,
                  jobTitle: updatedJobTitle,
                  company: updatedCompany,
                  location: data.location || contact.location || undefined,
                },
                {
                  onSuccess: (result) => {
                    if (!result.compatible) {
                      const scopeNote = `Hors scope (détecté automatiquement) : ${result.reasons.join(', ')}`
                      updateContact.mutate({
                        id: contact.id,
                        data: {
                          status: 'closed',
                          notes: contact.notes ? `${contact.notes}\n\n${scopeNote}` : scopeNote,
                        },
                      }, {
                        onSuccess: () => {
                          setLocalStatus('closed')
                          setOutOfScopeNotice(`Fermé automatiquement, hors scope : ${result.reasons.join(', ')}`)
                          setTimeout(onClose, 2500)
                        },
                      })
                    }
                  },
                }
              )
            },
            onError: (err) => {
              const message =
                (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
                "Échec de l'extraction. Vérifie le texte saisi."
              setContactExtractionError(message)
            },
          }
        )
      },
      onError: (err) => {
        const message =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
          "Échec de l'extraction. Vérifie le texte saisi."
        setContactExtractionError(message)
      },
    })
  }

  // Ouvre le profil LinkedIn du contact dans un nouvel onglet et ferme la fiche : le texte est
  // déjà dans le presse-papier, Gilles n'a plus qu'à coller sur la page qui s'ouvre.
  const openLinkedInAndClose = () => {
    if (contact.linkedinUrl) {
      window.open(contact.linkedinUrl, '_blank', 'noopener')
    }
    onClose()
  }

  // Génère, copie et enchaîne sur LinkedIn en un seul clic : Gilles ne relit le texte qu'une
  // fois collé, pas la peine d'un aller-retour "Générer" puis "Copier" puis changer d'onglet.
  const handleSuggestTemplate = () => {
    setTemplateError(null)
    suggestTemplate.mutate(contact.id, {
      onSuccess: (data) => {
        navigator.clipboard.writeText(data.message)
        createMessage.mutate({ contactId: contact.id, content: data.message })
        handleStatusChange('contacted')
        openLinkedInAndClose()
      },
      onError: (err) => {
        const message =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
          'Impossible de générer le message.'
        setTemplateError(message)
      },
    })
  }

  const handleSuggestRelance = () => {
    setRelanceError(null)
    suggestRelance.mutate(contact.id, {
      onSuccess: (data) => {
        navigator.clipboard.writeText(data.message)
        createMessage.mutate({ contactId: contact.id, content: data.message })
        handleStatusChange('contacted')
        openLinkedInAndClose()
      },
      onError: (err) => {
        const message =
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
          'Impossible de générer la relance.'
        setRelanceError(message)
      },
    })
  }

  return (
    <>
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
            Relance recommandée : {relanceInfo.daysSinceUpdate} jour{relanceInfo.daysSinceUpdate > 1 ? 's' : ''} sans nouvelles
          </div>
        )}

        {repliedRelanceInfo && (
          <div className="rounded-md border border-indigo-300 bg-indigo-50 text-indigo-800 px-3 py-2 text-sm">
            Echange toujours en cours ? {repliedRelanceInfo.daysSinceUpdate} jour{repliedRelanceInfo.daysSinceUpdate > 1 ? 's' : ''} sans nouvelles
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
          <div className="mt-2 min-w-0 space-y-4 text-sm">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Contact</h3>
              {localJobTitle && (
                <div>
                  <span className="text-muted-foreground">Poste</span>
                  <p className="font-medium">{localJobTitle}</p>
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
              <div>
                <span className="text-muted-foreground">Notes</span>
                <textarea
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  rows={3}
                  placeholder="Ajouter une note…"
                  className="mt-1 flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
                <div className="flex items-center gap-2 mt-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleSaveNotes}
                    disabled={updateContact.isPending || localNotes === (contact.notes ?? '')}
                  >
                    {updateContact.isPending ? 'Enregistrement…' : 'Enregistrer la note'}
                  </Button>
                  {notesSaved && <span className="text-xs text-muted-foreground">Note enregistrée</span>}
                </div>
              </div>

              <div className="rounded-lg border border-indigo-200/70 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-950/20 p-3 flex flex-col gap-2">
                <span className="text-muted-foreground font-medium">
                  {localJobTitle ? 'Infos LinkedIn du contact' : 'Poste manquant'}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsContactInfoModalOpen(true)}
                  className="self-start"
                >
                  {localJobTitle ? 'Mettre à jour les infos LinkedIn' : 'Extraire les infos'}
                </Button>
                {contactExtractionStatus === 'success' && (
                  <p className="text-xs text-foreground">Infos mises à jour.</p>
                )}
                {outOfScopeNotice && (
                  <p className="text-xs text-foreground">{outOfScopeNotice}</p>
                )}
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground">Entreprise</h3>
              {contact.company && (
                <div>
                  <span className="text-muted-foreground">Entreprise</span>
                  <p className="font-medium">{contact.company}</p>
                </div>
              )}
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3 flex flex-col gap-2">
                <span className="text-muted-foreground font-medium">Entreprise LinkedIn</span>
                {localCompany && (
                  <div className="rounded-md bg-background/60 px-3 py-2">
                    <p className="font-medium">{localCompany.name}</p>
                    {localCompany.sector && (
                      <p className="text-xs text-muted-foreground">{localCompany.sector}{localCompany.size ? ` · ${localCompany.size}` : ''}</p>
                    )}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCompanyModalOpen(true)}
                  className="self-start"
                >
                  {localCompany ? 'Mettre à jour les infos entreprise' : "Extraire l'entreprise"}
                </Button>
                {extractionStatus === 'success' && (
                  <p className="text-xs text-foreground">Entreprise mise à jour.</p>
                )}
                {localCompany && !localCompany.sector && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <Label htmlFor="company-sector" className="text-xs">
                      Secteur manquant (bloque la classification) — complète-le à la main
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="company-sector"
                        value={localSector}
                        onChange={(e) => setLocalSector(e.target.value)}
                        placeholder="ex: Services et conseil en informatique"
                        className="text-base"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveSector}
                        disabled={updateCompany.isPending || !localSector.trim()}
                      >
                        {updateCompany.isPending ? 'Enregistrement…' : 'Enregistrer'}
                      </Button>
                    </div>
                    {sectorSaved && <span className="text-xs text-muted-foreground">Secteur enregistré, classification relancée.</span>}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact-flux" className="text-xs text-muted-foreground font-medium">
                  Flux de prospection {contact.flux && contact.fluxConfidence === 1 ? '(choisi manuellement)' : contact.flux ? '(estimé par l\'IA)' : '(non classifié)'}
                </Label>
                <select
                  id="contact-flux"
                  value={contact.flux ?? ''}
                  onChange={(e) => handleFluxChange(e.target.value as FluxCode)}
                  className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="" disabled>
                    Choisir le flux…
                  </option>
                  {FLUX_OPTIONS.map((code) => (
                    <option key={code} value={code}>
                      {FLUX_LABELS[code]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {localStatus === 'to_message' && messages.length === 0 && (
              <div className="border-t border-border pt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground font-medium">Message 1er contact</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSuggestTemplate}
                      disabled={suggestTemplate.isPending}
                    >
                      {suggestTemplate.isPending ? 'Génération…' : 'Générer le message'}
                    </Button>
                  </div>
                </div>
                {templateError && (
                  <p className="text-xs text-foreground">{templateError}</p>
                )}
              </div>
            )}

            {(localStatus === 'follow_up' || localStatus === 'contacted') && (
              <div className="border-t border-border pt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground font-medium">Relance</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSuggestRelance}
                      disabled={suggestRelance.isPending}
                    >
                      {suggestRelance.isPending ? 'Génération…' : 'Générer une relance'}
                    </Button>
                  </div>
                </div>
                {relanceError && (
                  <p className="text-xs text-foreground">{relanceError}</p>
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
                      <div className="flex items-center gap-3 py-2 px-1 text-sm">
                        <span className="text-xs text-muted-foreground shrink-0">{formatDate(event.date)}</span>
                        <span className="font-medium flex-1">{event.label}</span>
                        {event.type === 'message' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => {
                              navigator.clipboard.writeText(event.content)
                              setCopiedMessageId(event.id)
                              setTimeout(() => setCopiedMessageId(null), 2000)
                            }}
                          >
                            {copiedMessageId === event.id
                              ? <Check className="h-3.5 w-3.5" />
                              : <Clipboard className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                      </div>
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

    <Dialog open={isCompanyModalOpen} onOpenChange={(open) => { if (!open) setIsCompanyModalOpen(false) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{localCompany ? 'Mettre à jour les infos entreprise' : "Extraire l'entreprise"}</DialogTitle>
        </DialogHeader>
        <textarea
          value={rawCompanyText}
          onChange={(e) => setRawCompanyText(e.target.value)}
          rows={6}
          autoFocus
          placeholder={localCompany ? 'Colle ici le texte à jour de la page LinkedIn entreprise…' : 'Colle ici le texte de la page LinkedIn entreprise…'}
          className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
        {companyExtractionError && (
          <p className="text-sm text-destructive">{companyExtractionError}</p>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsCompanyModalOpen(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            onClick={localCompany ? handleEnrichCompany : handleExtractCompany}
            disabled={!rawCompanyText.trim() || extractCompany.isPending || enrichCompany.isPending}
          >
            {extractCompany.isPending || enrichCompany.isPending ? 'Extraction…' : 'Extraire'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={isContactInfoModalOpen} onOpenChange={(open) => { if (!open) setIsContactInfoModalOpen(false) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{localJobTitle ? 'Mettre à jour les infos LinkedIn' : 'Extraire les infos'}</DialogTitle>
        </DialogHeader>
        <textarea
          value={rawContactText}
          onChange={(e) => setRawContactText(e.target.value)}
          rows={6}
          autoFocus
          placeholder="Colle ici le texte du profil LinkedIn du contact…"
          className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
        {contactExtractionError && (
          <p className="text-sm text-destructive">{contactExtractionError}</p>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsContactInfoModalOpen(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleExtractContactInfo}
            disabled={!rawContactText.trim() || extractContact.isPending || updateContact.isPending}
          >
            {extractContact.isPending || updateContact.isPending ? 'Extraction…' : 'Extraire'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

ContactModal.displayName = 'ContactModal'
