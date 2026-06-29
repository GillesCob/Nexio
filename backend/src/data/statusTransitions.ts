type ContactStatus = "to_contact" | "contacted" | "replied" | "meeting_scheduled" | "follow_up" | "closed";

interface IStatusTransition {
  label: string;
  targetStatus: ContactStatus;
  touchOnly?: boolean;
}

export const STATUS_TRANSITIONS: Record<ContactStatus, IStatusTransition[]> = {
  to_contact: [],
  contacted: [
    { label: "Va voir", targetStatus: "follow_up" },
    { label: "A répondu", targetStatus: "replied" },
    { label: "Pas intéressé", targetStatus: "closed" },
  ],
  follow_up: [
    { label: "Relance envoyée", targetStatus: "contacted" },
    { label: "A répondu", targetStatus: "replied" },
    { label: "Clore", targetStatus: "closed" },
  ],
  replied: [
    { label: "Toujours en cours", targetStatus: "replied", touchOnly: true },
    { label: "RDV planifié", targetStatus: "meeting_scheduled" },
    { label: "Clore", targetStatus: "closed" },
  ],
  meeting_scheduled: [{ label: "Clore", targetStatus: "closed" }],
  closed: [],
};
