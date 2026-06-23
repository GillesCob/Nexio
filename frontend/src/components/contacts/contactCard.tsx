import { Draggable } from '@hello-pangea/dnd'
import type { IContact } from '@/types/contact'
import { getProfileBadge } from '@/lib/profileBadge'

interface IContactCardProps {
  contact: IContact
  index: number
  onOpen: (contact: IContact) => void
}

export function ContactCard({ contact, index, onOpen }: IContactCardProps) {
  return (
    <Draggable draggableId={contact.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen(contact)}
          className={`
            cursor-pointer rounded-md border bg-card p-3 shadow-sm
            hover:shadow-md transition-shadow select-none
            ${snapshot.isDragging ? 'opacity-80 rotate-1 shadow-lg' : ''}
          `}
        >
          <p className="text-sm font-medium text-card-foreground truncate">{contact.name}</p>
          {contact.company && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{contact.company}</p>
          )}
          {contact.jobTitle && (
            <span className="inline-block mt-1.5 text-xs border border-border rounded px-1.5 py-0.5 text-foreground">
              {getProfileBadge(contact.jobTitle)}
            </span>
          )}
        </div>
      )}
    </Draggable>
  )
}

ContactCard.displayName = 'ContactCard'
