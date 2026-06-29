import { Link } from 'react-router-dom'
import { useLinkedInReminder } from '@/hooks/useStats'

export function LinkedInReminderBanner() {
  const { data } = useLinkedInReminder()

  if (!data?.shouldRemind) return null

  const message =
    data.daysSinceLastSnapshot === null
      ? 'Ajoute ton premier snapshot LinkedIn'
      : `Il est temps de mettre à jour tes stats LinkedIn · ${data.daysSinceLastSnapshot} j sans mise à jour`

  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-4 py-3 text-sm mb-4">
      <Link to="/stats" className="underline hover:text-amber-900 cursor-pointer font-semibold">
        {message}
      </Link>
    </div>
  )
}

LinkedInReminderBanner.displayName = 'LinkedInReminderBanner'
