import { useState } from 'react'
import type { IJobOffer } from '@/types/jobOffer'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { JobOfferKanban } from '@/components/jobOffers/jobOfferKanban'
import { CreateJobOfferModal } from '@/components/jobOffers/createJobOfferModal'
import { JobOfferModal } from '@/components/jobOffers/jobOfferModal'

export function JobOffersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedJobOffer, setSelectedJobOffer] = useState<IJobOffer | null>(null)

  const handleJobOfferCreated = (jobOffer: IJobOffer) => {
    setIsCreateOpen(false)
    setSelectedJobOffer(jobOffer)
  }

  return (
    <main className="p-8">
      <Navbar />
      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsCreateOpen(true)}>+ Ajouter une annonce</Button>
      </div>

      <JobOfferKanban onOpenJobOffer={setSelectedJobOffer} />

      <CreateJobOfferModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleJobOfferCreated}
      />

      <JobOfferModal
        jobOffer={selectedJobOffer}
        onClose={() => setSelectedJobOffer(null)}
      />
    </main>
  )
}
