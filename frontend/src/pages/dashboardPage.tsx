import { useState } from 'react'
import type { IContact } from '@/types/contact'
import { KanbanBoard } from '@/components/contacts/kanbanBoard'
import { ContactModal } from '@/components/contacts/contactModal'
import { CreateContactModal } from '@/components/contacts/createContactModal'
import { RelanceBanner } from '@/components/contacts/relanceBanner'
import { LinkedInReminderBanner } from '@/components/stats/linkedinReminderBanner'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'

export function DashboardPage() {
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <main className="p-8">
      <Navbar />
      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsCreateOpen(true)}>+ Ajouter un contact</Button>
      </div>

      <LinkedInReminderBanner />
      <RelanceBanner onOpenContact={setSelectedContact} />
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
