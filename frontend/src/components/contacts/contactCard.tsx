import { Draggable } from '@hello-pangea/dnd'
import type { IContact } from '@/types/contact'

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
            cursor-pointer rounded-md border bg-white p-3 shadow-sm
            hover:shadow-md transition-shadow select-none
            ${snapshot.isDragging ? 'opacity-80 rotate-1 shadow-lg' : ''}
          `}
        >
          <p className="text-sm font-medium text-slate-900 truncate">{contact.name}</p>
          {contact.company && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{contact.company}</p>
          )}
        </div>
      )}
    </Draggable>
  )
}

ContactCard.displayName = 'ContactCard'
