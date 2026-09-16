import { useState } from 'react'
import { Clipboard, Check, MessageSquare } from 'lucide-react'
import type { IProspectCompany } from '@/types/prospectCompany'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { useProspectCompanies, useDeleteProspectCompany } from '@/hooks/useProspectCompanies'
import { COMPANY_OUTREACH_MESSAGE } from '@/data/companyOutreachMessage'

function extractLinkedInUrl(why?: string): string | undefined {
  const match = why?.match(/LinkedIn:\s*(https?:\/\/\S+)/i)
  return match?.[1]
}

function groupByZone(prospectCompanies: IProspectCompany[]) {
  const groups = new Map<string, IProspectCompany[]>()
  for (const prospectCompany of prospectCompanies) {
    const zone = prospectCompany.zone ?? 'Sans zone'
    const existing = groups.get(zone) ?? []
    existing.push(prospectCompany)
    groups.set(zone, existing)
  }
  return groups
}

export function ProspectCompaniesPage() {
  const { data: prospectCompanies = [], isPending, isError } = useProspectCompanies()
  const deleteProspectCompany = useDeleteProspectCompany()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)

  const groups = groupByZone(prospectCompanies)

  return (
    <main className="p-4 sm:p-8">
      <Navbar />
      <h1 className="text-lg font-semibold text-foreground mb-4">Entreprises à explorer</h1>

      {isPending && <p className="text-sm text-muted-foreground">Chargement...</p>}

      {isError && (
        <p className="text-sm text-destructive">
          Erreur de chargement des entreprises. Réessayez, ou reconnectez-vous si le problème persiste.
        </p>
      )}

      {!isPending && !isError && prospectCompanies.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aucune entreprise en attente. Les nouvelles pistes identifiées en recherche apparaîtront ici.
        </p>
      )}

      <div className="flex flex-col gap-6">
        {Array.from(groups.entries()).map(([zone, companies]) => (
          <div key={zone}>
            <h2 className="text-sm font-semibold text-foreground mb-2">{zone}</h2>
            <div className="flex flex-col gap-2">
              {companies.map((company) => {
                const linkedinUrl = extractLinkedInUrl(company.why)
                return (
                <div
                  key={company.id}
                  className="rounded-md border bg-card p-3 shadow-sm flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {linkedinUrl ? (
                        <a
                          href={linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:underline"
                        >
                          {company.name}
                        </a>
                      ) : (
                        <span className="font-medium text-foreground">{company.name}</span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText(company.name)
                          setCopiedId(company.id)
                          setTimeout(() => setCopiedId(null), 2000)
                        }}
                      >
                        {copiedId === company.id
                          ? <Check className="h-3.5 w-3.5" />
                          : <Clipboard className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        title="Copier le message de prospection (boite sans contact humain)"
                        onClick={() => {
                          navigator.clipboard.writeText(COMPANY_OUTREACH_MESSAGE)
                          setCopiedMessageId(company.id)
                          setTimeout(() => setCopiedMessageId(null), 2000)
                        }}
                      >
                        {copiedMessageId === company.id
                          ? <Check className="h-3.5 w-3.5" />
                          : <MessageSquare className="h-3.5 w-3.5" />}
                      </Button>
                      {company.note !== undefined && (
                        <span className="text-xs font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                          {company.note}/10
                        </span>
                      )}
                    </div>
                    {company.sector && (
                      <p className="text-sm text-muted-foreground">{company.sector}</p>
                    )}
                    {company.why && <p className="text-sm text-muted-foreground mt-1">{company.why}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteProspectCompany.mutate(company.id)}
                    disabled={deleteProspectCompany.isPending}
                  >
                    Supprimer
                  </Button>
                </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

ProspectCompaniesPage.displayName = 'ProspectCompaniesPage'
