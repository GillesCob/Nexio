import type { IProspectCompany } from '@/types/prospectCompany'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { useProspectCompanies, useDeleteProspectCompany } from '@/hooks/useProspectCompanies'

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
  const { data: prospectCompanies = [], isPending } = useProspectCompanies()
  const deleteProspectCompany = useDeleteProspectCompany()

  const groups = groupByZone(prospectCompanies)

  return (
    <main className="p-4 sm:p-8">
      <Navbar />
      <h1 className="text-lg font-semibold text-foreground mb-4">Entreprises à explorer</h1>

      {isPending && <p className="text-sm text-muted-foreground">Chargement...</p>}

      {!isPending && prospectCompanies.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aucune entreprise en attente. Les nouvelles pistes identifiées en recherche apparaîtront ici.
        </p>
      )}

      <div className="flex flex-col gap-6">
        {Array.from(groups.entries()).map(([zone, companies]) => (
          <div key={zone}>
            <h2 className="text-sm font-semibold text-foreground mb-2">{zone}</h2>
            <div className="flex flex-col gap-2">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="rounded-md border bg-card p-3 shadow-sm flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{company.name}</span>
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

ProspectCompaniesPage.displayName = 'ProspectCompaniesPage'
