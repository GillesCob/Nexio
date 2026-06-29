import { Droppable } from '@hello-pangea/dnd'
import type { IContact, ContactStatus } from '@/types/contact'
import { ContactCard } from './contactCard'

interface IKanbanColumnProps {
  status: ContactStatus
  label: string
  contacts: IContact[]
  onOpenContact: (contact: IContact) => void
}

export function KanbanColumn({ status, label, contacts, onOpenContact }: IKanbanColumnProps) {
  return (
    <div className="flex flex-col w-64 shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span className="text-xs font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
          {contacts.length}
        </span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex flex-col gap-2 rounded-lg p-2 min-h-[200px] transition-colors
              ${snapshot.isDraggingOver ? 'bg-accent' : 'bg-muted/40'}
            `}
          >
            {contacts.map((contact, index) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                index={index}
                onOpen={onOpenContact}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

KanbanColumn.displayName = 'KanbanColumn'
