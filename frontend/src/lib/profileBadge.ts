const PROFILE_RULES: { label: string; keywords: string[] }[] = [
  { label: 'RH', keywords: ['recruteur', 'recruteuse', 'talent', 'rh', 'ressources humaines'] },
  { label: 'CTO', keywords: ['cto', 'chief technology', 'directeur technique'] },
  { label: 'Lead Dev', keywords: ['lead dev', 'tech lead', 'lead engineer'] },
  { label: 'CEO', keywords: ['ceo', 'pdg', 'directeur général', 'gérant'] },
  { label: 'Dev', keywords: ['développeur', 'developer', 'engineer', 'ingénieur'] },
]

export function getProfileBadge(jobTitle: string | undefined): string {
  if (!jobTitle) return 'Autre'
  const lower = jobTitle.toLowerCase()
  for (const rule of PROFILE_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.label
  }
  return 'Autre'
}
