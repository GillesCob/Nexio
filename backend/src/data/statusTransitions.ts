type ContactStatus = "to_contact" | "to_message" | "contacted" | "replied" | "meeting_scheduled" | "follow_up" | "closed";

interface IStatusTransition {
  label: string;
  targetStatus: ContactStatus;
  touchOnly?: boolean;
}

export const STATUS_TRANSITIONS: Record<ContactStatus, IStatusTransition[]> = {
  to_contact: [{ label: "Invitation acceptée", targetStatus: "to_message" }],
  to_message: [
    { label: "Message envoyé", targetStatus: "contacted" },
    { label: "Pas intéressé", targetStatus: "closed" },
  ],
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
