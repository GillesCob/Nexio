import { useState } from 'react'
import type { IContact, ContactStatus } from '@/types/contact'
import { Button } from '@/components/ui/button'

// TODO: share with backend/src/data/statusTransitions.ts when monorepo is set up
const STATUS_TRANSITIONS: Record<ContactStatus, { label: string; targetStatus: ContactStatus }[]> = {
  to_contact: [],
  contacted: [
    { label: 'Il va voir', targetStatus: 'follow_up' },
    { label: 'A répondu', targetStatus: 'replied' },
    { label: 'Pas intéressé', targetStatus: 'closed' },
  ],
  follow_up: [
    { label: 'Relance envoyée', targetStatus: 'contacted' },
    { label: 'A répondu', targetStatus: 'replied' },
    { label: 'Clore', targetStatus: 'closed' },
  ],
  replied: [
    { label: 'RDV planifié', targetStatus: 'meeting_scheduled' },
    { label: 'Clore', targetStatus: 'closed' },
  ],
  meeting_scheduled: [
    { label: 'Clore', targetStatus: 'closed' },
  ],
  closed: [],
}

const ACTION_FEEDBACK: Record<string, string> = {
  follow_up: 'Contact passé en "A relancer"',
  replied: 'Contact passé en "Echange en cours"',
  closed: 'Contact clôturé',
  contacted: 'Relance envoyée — contact repassé en "Contacté"',
  meeting_scheduled: 'RDV planifié',
}

interface IStatusActionsProps {
  contact: IContact
  onStatusChange: (status: ContactStatus) => void
  onTouch?: () => void
  isRepliedAlert?: boolean
}

export function StatusActions({ contact, onStatusChange, onTouch, isRepliedAlert }: IStatusActionsProps) {
  const [feedback, setFeedback] = useState<string | null>(null)
  const transitions = STATUS_TRANSITIONS[contact.status]

  const showTouchButton = contact.status === 'replied' && isRepliedAlert && onTouch

  if (transitions.length === 0 && !showTouchButton) {
    return <p className="text-sm text-gray-400">Statut final</p>
  }

  const handleClick = (t: { label: string; targetStatus: ContactStatus }) => {
    onStatusChange(t.targetStatus)
    const msg = ACTION_FEEDBACK[t.targetStatus]
    if (msg) {
      setFeedback(msg)
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  const handleTouch = () => {
    onTouch?.()
    setFeedback('Echange repoussé — alerte réinitialisée')
    setTimeout(() => setFeedback(null), 3000)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-2">
        {showTouchButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTouch}
          >
            Toujours en cours
          </Button>
        )}
        {transitions.map((t) => (
          <Button
            key={t.targetStatus}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleClick(t)}
          >
            {t.label}
          </Button>
        ))}
      </div>
      {feedback && <p className="text-sm text-gray-500">{feedback}</p>}
    </div>
  )
}

StatusActions.displayName = 'StatusActions'
