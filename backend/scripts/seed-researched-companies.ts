import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const companies = [
  {
    name: 'BeTomorrow',
    sector: 'Agence tech/digitale (dev web/mobile/data/IA)',
    description: "Agence de développement digital et IA basée à Bordeaux, 70 collaborateurs, 20 ans d'existence, clients grands comptes (SNCF, Vinci, Keolis, France Travail). Pôle IA dédié + nouvelle division Cities (mobilité/urbanisme).",
    size: '70 employés',
    companyType: 'ESN',
  },
  {
    name: 'AspenNav',
    sector: 'Navigation inertielle et fusion de capteurs pour drones',
    description: "Filiale française d'une société basée à Denver (US), développe des logiciels de navigation autonome pour drones. Basée à Mérignac (Bordeaux).",
    size: null,
    companyType: 'ENTERPRISE',
  },
  {
    name: 'Mapotempo',
    sector: "SaaS d'optimisation de tournées de livraison",
    description: 'Éditeur de logiciel de planification de tournées pour professionnels de la livraison, basé à Pau.',
    size: null,
    companyType: 'ENTERPRISE',
  },
  {
    name: 'SeqOne',
    sector: "Logiciel d'analyse génomique",
    description: 'Medtech basée à Pau, plateforme logicielle de génomique clinique.',
    size: null,
    companyType: 'ENTERPRISE',
  },
  {
    name: 'Botmatic',
    sector: 'Chatbots de recrutement',
    description: 'Startup basée à Pau, chatbots de recrutement pour messageries.',
    size: null,
    companyType: 'ENTERPRISE',
  },
  {
    name: 'INDEXUS',
    sector: 'Interfaces conversationnelles IA',
    description: "Startup du Pays Basque, interfaces conversationnelles IA pour expériences numériques guidées.",
    size: null,
    companyType: 'ENTERPRISE',
  },
  {
    name: 'LAWXER',
    sector: 'Legaltech, analyse de contrats par IA',
    description: 'Startup du Pays Basque, analyse de contrats assistée par IA avec recommandations juridiques.',
    size: null,
    companyType: 'ENTERPRISE',
  },
  {
    name: 'Doctinum',
    sector: 'IA multimodale pour protocoles cliniques',
    description: 'Startup du Pays Basque, infrastructure IA multimodale pour l\'exécution de protocoles cliniques.',
    size: null,
    companyType: 'ENTERPRISE',
  },
  {
    name: 'Visionsoft',
    sector: 'Plateforme no-code avec IA intégrée',
    description: "Startup du Pays Basque, plateforme no-code avec IA intégrée pour applications métier.",
    size: null,
    companyType: 'ENTERPRISE',
  },
  {
    name: 'REMINISIA',
    sector: "IA conversationnelle, santé/bien-être senior",
    description: "Startup du Pays Basque, IA conversationnelle contre l'isolement des seniors et le déclin cognitif.",
    size: null,
    companyType: 'ENTERPRISE',
  },
  {
    name: 'DAM INTELLIGENCE',
    sector: 'IA appliquée à la médecine dentaire',
    description: 'Startup du Pays Basque, écosystème IA-native pour la médecine dentaire, outils de décision clinique.',
    size: null,
    companyType: 'ENTERPRISE',
  },
]

async function main() {
  for (const c of companies) {
    const existing = await prisma.company.findFirst({
      where: { name: { equals: c.name, mode: 'insensitive' } },
    })
    if (existing) {
      console.log(`SKIP (existe déjà) : ${c.name}`)
      continue
    }
    const created = await prisma.company.create({ data: c })
    console.log(`CRÉÉ : ${created.name} (id=${created.id})`)
  }
}

main().finally(() => prisma.$disconnect())
