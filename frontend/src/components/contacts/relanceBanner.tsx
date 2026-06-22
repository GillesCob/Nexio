import type { IContact } from '@/types/contact'
import { useGetRelances } from '@/hooks/useContacts'

interface IRelanceBannerProps {
  onOpenContact: (contact: IContact) => void
}

export function RelanceBanner({ onOpenContact }: IRelanceBannerProps) {
  const { data: relanceResult } = useGetRelances()

  const toFollowUp = relanceResult?.toFollowUp ?? []
  const toCheckReplied = relanceResult?.toCheckReplied ?? []

  if (toFollowUp.length === 0 && toCheckReplied.length === 0) return null

  return (
    <div className="flex flex-col gap-2 mb-6">
      {toFollowUp.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">
            {toFollowUp.length} contact{toFollowUp.length > 1 ? 's' : ''} à relancer :
          </span>{' '}
          {toFollowUp.map((r, i) => (
            <span key={r.id}>
              <button
                onClick={() => onOpenContact(r)}
                className="underline hover:text-amber-900 cursor-pointer"
              >
                {r.name}
              </button>
              {i < toFollowUp.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      )}

      {toCheckReplied.length > 0 && (
        <div className="rounded-md border border-indigo-300 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          <span className="font-semibold">
            {toCheckReplied.length} échange{toCheckReplied.length > 1 ? 's' : ''} en cours sans nouvelles :
          </span>{' '}
          {toCheckReplied.map((r, i) => (
            <span key={r.id}>
              <button
                onClick={() => onOpenContact(r)}
                className="underline hover:text-indigo-900 cursor-pointer"
              >
                {r.name}
              </button>
              {i < toCheckReplied.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

RelanceBanner.displayName = 'RelanceBanner'
