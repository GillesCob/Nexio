import { useState } from 'react'
import type { IContact } from '@/types/contact'
import { KanbanBoard } from '@/components/contacts/kanbanBoard'
import { ContactModal } from '@/components/contacts/contactModal'
import { CreateContactModal } from '@/components/contacts/createContactModal'
import { Button } from '@/components/ui/button'

export function DashboardPage() {
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Tableau de bord</h1>
        <Button onClick={() => setIsCreateOpen(true)}>+ Ajouter un contact</Button>
      </div>

      <KanbanBoard onOpenContact={setSelectedContact} />

      <ContactModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
      />

      <CreateContactModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </main>
  )
}
