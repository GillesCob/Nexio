import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { useLinkedInSnapshots, usePostLinkedInSnapshot, useContactStats } from '@/hooks/useStats'
import type { ILinkedInSnapshot } from '@/types/stats'

function formatVariation(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`
}

function VariationBadge({ value }: { value: number }) {
  return (
    <span className={value >= 0 ? 'text-green-600' : 'text-destructive'}>
      {formatVariation(value)}
    </span>
  )
}

function SnapshotRow({ snapshot }: { snapshot: ILinkedInSnapshot }) {
  return (
    <tr className="border-b border-border">
      <td className="py-2 pr-4 text-sm font-medium">{snapshot.weekLabel || '—'}</td>
      <td className="py-2 pr-4 text-sm text-right">
        {snapshot.impressions} <VariationBadge value={snapshot.impressionsVariation} />
      </td>
      <td className="py-2 pr-4 text-sm text-right">
        {snapshot.followers} <VariationBadge value={snapshot.followersVariation} />
      </td>
      <td className="py-2 pr-4 text-sm text-right">
        {snapshot.profileViews} <VariationBadge value={snapshot.profileViewsVariation} />
      </td>
      <td className="py-2 pr-4 text-sm text-right">
        {snapshot.searchAppearances} <VariationBadge value={snapshot.searchAppearancesVariation} />
      </td>
      <td className="py-2 pr-4 text-sm text-right">{snapshot.postsCount}</td>
      <td className="py-2 text-sm text-right">{snapshot.commentsCount}</td>
    </tr>
  )
}

const STATUS_LABELS: Record<string, string> = {
  to_contact: 'À contacter',
  contacted: 'Contacté',
  replied: 'A répondu',
  meeting_scheduled: 'Meeting planifié',
  follow_up: 'Relance',
  closed: 'Fermé',
}

export function StatsPage() {
  const [rawText, setRawText] = useState('')

  const { data: snapshots, isPending: isSnapshotsPending } = useLinkedInSnapshots()
  const { data: contactStats, isPending: isStatsPending } = useContactStats()
  const { mutate: postSnapshot, isPending: isPosting } = usePostLinkedInSnapshot()

  function handleSubmit() {
    if (!rawText.trim()) return
    postSnapshot(rawText, {
      onSuccess: () => setRawText(''),
    })
  }

  return (
    <main className="p-8">
      <Navbar />

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Section LinkedIn */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Activité LinkedIn</h2>

          <div className="space-y-3 mb-6">
            <textarea
              className="w-full h-32 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Colle ici le texte copié depuis ta page analytics LinkedIn…"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <Button onClick={handleSubmit} disabled={isPosting || !rawText.trim()}>
              {isPosting ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>

          {isSnapshotsPending ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : snapshots && snapshots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground">Semaine</th>
                    <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground text-right">Impressions</th>
                    <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground text-right">Abonnés</th>
                    <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground text-right">Vues profil</th>
                    <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground text-right">Recherches</th>
                    <th className="pb-2 pr-4 text-xs font-medium text-muted-foreground text-right">Posts</th>
                    <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Commentaires</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((s) => (
                    <SnapshotRow key={s.id} snapshot={s} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun snapshot enregistré pour l'instant.</p>
          )}
        </section>

        {/* Section Pilotage contacts */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Pilotage contacts</h2>

          {isStatsPending ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : contactStats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {(Object.entries(contactStats.byStatus) as [string, number][]).map(([status, count]) => (
                  <div
                    key={status}
                    className="rounded-lg border border-border p-4 flex flex-col gap-1"
                  >
                    <span className="text-xs text-muted-foreground">{STATUS_LABELS[status] ?? status}</span>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-4 flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Taux de réponse</span>
                  <span className="text-2xl font-bold">{contactStats.responseRate}%</span>
                  <span className="text-xs text-muted-foreground">
                    (répondu + meeting) / total approché
                  </span>
                </div>
                <div className="rounded-lg border border-border p-4 flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Relances en attente</span>
                  <span className={`text-2xl font-bold ${contactStats.pendingFollowUps > 0 ? 'text-yellow-600' : ''}`}>
                    {contactStats.pendingFollowUps}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    statut "relance" depuis &gt; 7 jours
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Impossible de charger les stats contacts.</p>
          )}
        </section>
      </div>
    </main>
  )
}
