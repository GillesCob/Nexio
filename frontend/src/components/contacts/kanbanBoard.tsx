import { useState, useEffect } from 'react'
import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { useQueryClient } from '@tanstack/react-query'
import type { IContact, ContactStatus } from '@/types/contact'
import { useContacts, useUpdateContact, CONTACTS_QUERY_KEY } from '@/hooks/useContacts'
import { KanbanColumn } from './kanbanColumn'

const COLUMNS: { status: ContactStatus; label: string }[] = [
  { status: 'to_contact', label: 'À contacter' },
  { status: 'contacted', label: 'Contacté' },
  { status: 'replied', label: 'Echange en cours' },
  { status: 'meeting_scheduled', label: 'RDV planifié' },
  { status: 'follow_up', label: 'A relancer' },
  { status: 'closed', label: 'Fermé' },
]

interface IKanbanBoardProps {
  onOpenContact: (contact: IContact) => void
}

export function KanbanBoard({ onOpenContact }: IKanbanBoardProps) {
  const { data: serverContacts = [], isPending } = useContacts()
  const [localContacts, setLocalContacts] = useState<IContact[]>([])
  const updateContact = useUpdateContact()
  const queryClient = useQueryClient()

  useEffect(() => {
    setLocalContacts(serverContacts)
  }, [serverContacts])

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination || destination.droppableId === source.droppableId) return

    const newStatus = destination.droppableId as ContactStatus
    const previousContacts = localContacts

    setLocalContacts((prev) =>
      prev.map((c) => (c.id === draggableId ? { ...c, status: newStatus } : c))
    )

    updateContact.mutate(
      { id: draggableId, data: { status: newStatus } },
      {
        onError: () => {
          setLocalContacts(previousContacts)
          queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY })
        },
      }
    )
  }

  if (isPending) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(({ status }) => (
          <div key={status} className="flex flex-col w-64 shrink-0">
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-3" />
            <div className="rounded-lg bg-slate-50 min-h-[200px] p-2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(({ status, label }) => (
          <KanbanColumn
            key={status}
            status={status}
            label={label}
            contacts={localContacts.filter((c) => c.status === status)}
            onOpenContact={onOpenContact}
          />
        ))}
      </div>
    </DragDropContext>
  )
}

KanbanBoard.displayName = 'KanbanBoard'
