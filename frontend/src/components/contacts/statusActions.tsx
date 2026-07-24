import { useState } from "react";
import type { IContact, ContactStatus, ContactCloseReason } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// TODO: share with backend/src/data/statusTransitions.ts when monorepo is set up
const STATUS_TRANSITIONS: Record<ContactStatus, { label: string; targetStatus: ContactStatus }[]> = {
  to_contact: [{ label: "Invitation acceptée", targetStatus: "to_message" }],
  to_message: [{ label: "Message envoyé", targetStatus: "contacted" }],
  contacted: [
    { label: "Va voir", targetStatus: "follow_up" },
    { label: "A répondu", targetStatus: "replied" },
  ],
  follow_up: [
    { label: "Relance envoyée", targetStatus: "contacted" },
    { label: "A répondu", targetStatus: "replied" },
  ],
  replied: [{ label: "RDV planifié", targetStatus: "meeting_scheduled" }],
  meeting_scheduled: [],
  closed: [],
};

// Statuts depuis lesquels clore a un sens (pas depuis to_contact, où il n'y a pas encore eu de
// vrai contact à qualifier, ni depuis closed lui-même).
const CLOSABLE_FROM: ContactStatus[] = [
  "to_message",
  "contacted",
  "follow_up",
  "replied",
  "meeting_scheduled",
];

const ACTION_FEEDBACK: Record<string, string> = {
  to_message: 'Contact passé en "Message à envoyer"',
  follow_up: 'Contact passé en "A relancer"',
  replied: 'Contact passé en "Echange en cours"',
  contacted: 'Contact passé en "Contacté"',
  meeting_scheduled: "RDV planifié",
};

function defaultRemindAt(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 2);
  return d.toISOString().slice(0, 10);
}

interface IStatusActionsProps {
  contact: IContact;
  onStatusChange: (status: ContactStatus) => void;
  onCloseContact: (closeReason: ContactCloseReason, remindAt?: string) => void;
  onTouch?: () => void;
  isRepliedAlert?: boolean;
}

export function StatusActions({ contact, onStatusChange, onCloseContact, onTouch, isRepliedAlert }: IStatusActionsProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pickingRemindAt, setPickingRemindAt] = useState(false);
  const [remindAt, setRemindAt] = useState(defaultRemindAt());
  const transitions = STATUS_TRANSITIONS[contact.status];
  const canClose = CLOSABLE_FROM.includes(contact.status);

  const showTouchButton = contact.status === "replied" && isRepliedAlert && onTouch;

  if (transitions.length === 0 && !canClose && !showTouchButton) {
    return <p className="text-sm text-muted-foreground">Statut final</p>;
  }

  const handleClick = (t: { label: string; targetStatus: ContactStatus }) => {
    onStatusChange(t.targetStatus);
    const msg = ACTION_FEEDBACK[t.targetStatus];
    if (msg) {
      setFeedback(msg);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleTouch = () => {
    onTouch?.();
    setFeedback("Echange repoussé, alerte réinitialisée");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleNotInterested = () => {
    onCloseContact("not_interested");
  };

  const handleConfirmNotNow = () => {
    onCloseContact("not_now", remindAt);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-2 items-center">
        {showTouchButton && (
          <Button type="button" variant="outline" size="sm" onClick={handleTouch}>
            Toujours en cours
          </Button>
        )}
        {transitions.map((t) => (
          <Button key={t.targetStatus} type="button" variant="outline" size="sm" onClick={() => handleClick(t)}>
            {t.label}
          </Button>
        ))}
        {canClose && !pickingRemindAt && (
          <>
            <Button type="button" variant="outline" size="sm" onClick={handleNotInterested}>
              Pas intéressé
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setPickingRemindAt(true)}>
              Pas pour le moment
            </Button>
          </>
        )}
        {pickingRemindAt && (
          <>
            <Input
              type="date"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              className="h-8 w-auto"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleConfirmNotNow}>
              Confirmer
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setPickingRemindAt(false)}>
              Annuler
            </Button>
          </>
        )}
      </div>
      {feedback && <p className="text-sm text-muted-foreground">{feedback}</p>}
    </div>
  );
}

StatusActions.displayName = "StatusActions";
