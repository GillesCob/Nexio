import { useState } from 'react'
import type { IJobOffer } from '@/types/jobOffer'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { JobOfferKanban } from '@/components/jobOffers/jobOfferKanban'
import { CreateJobOfferModal } from '@/components/jobOffers/createJobOfferModal'
import { JobOfferModal } from '@/components/jobOffers/jobOfferModal'
import { useSearchJobOffers } from '@/hooks/useJobOffers'

export function JobOffersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedJobOffer, setSelectedJobOffer] = useState<IJobOffer | null>(null)
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null)
  const searchJobOffers = useSearchJobOffers()

  const handleJobOfferCreated = (jobOffer: IJobOffer) => {
    setIsCreateOpen(false)
    setSelectedJobOffer(jobOffer)
  }

  const handleSearch = () => {
    setSearchFeedback(null)
    searchJobOffers.mutate(undefined, {
      onSuccess: (result) => {
        setSearchFeedback(
          `${result.created} nouvelle${result.created > 1 ? 's' : ''} annonce${result.created > 1 ? 's' : ''} ajoutée${result.created > 1 ? 's' : ''}, ${result.skippedExisting} déjà connue${result.skippedExisting > 1 ? 's' : ''}.`
        )
        setTimeout(() => setSearchFeedback(null), 6000)
      },
      onError: () => {
        setSearchFeedback('Échec de la recherche.')
        setTimeout(() => setSearchFeedback(null), 6000)
      },
    })
  }

  return (
    <main className="p-4 sm:p-8">
      <Navbar />
      <div className="flex items-center justify-end gap-3 mb-2">
        <Button variant="outline" onClick={handleSearch} disabled={searchJobOffers.isPending}>
          {searchJobOffers.isPending ? 'Recherche…' : 'Rechercher de nouvelles annonces'}
        </Button>
        <Button onClick={() => setIsCreateOpen(true)}>+ Ajouter une annonce</Button>
      </div>
      {searchFeedback && (
        <p className="text-sm text-muted-foreground text-right mb-4">{searchFeedback}</p>
      )}
      {!searchFeedback && <div className="mb-6" />}

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
