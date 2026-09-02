interface IRelanceTemplate {
  id: string
  label: string
  targetProfile: string
  body: string
}

export const relanceTemplates: IRelanceTemplate[] = [
  {
    id: '1a_relance_before_17_07',
    label: 'Relance recruteur ESN',
    targetProfile: 'recruiter_esn',
    body: `Bonjour {{firstName}},\n\nJe me permets de revenir vers vous suite à mon message précédent. Je suis toujours en recherche active d'une opportunité en développement web full-stack (React / Node.js / TypeScript), et {{companyName}} reste une entreprise qui m'intéresse particulièrement.\n\nAvez-vous eu l'occasion d'y réfléchir ? Je reste disponible pour un échange rapide si vous le souhaitez.\n\nCordialement,\nGilles`,
  },
  {
    id: '1a_relance_after_17_07',
    label: 'Flux 1a : Relance après 17/07',
    targetProfile: 'recruiter_esn',
    body: `Bonjour {{firstName}},

Je me permets de revenir vers vous suite à mon message du {{lastContactDate}}.

Cerithe, un de mes projets, est maintenant en ligne. Depuis gillescobigo.com vous pouvez d'ailleurs accéder aux démos de mes différents projets et vous faire une idée concrète de ce que je construis.

Je reste à la recherche d'un poste fullstack dans la région {{locationWithDe}} et {{companyName}} m'intéresse toujours.

À votre disposition pour échanger.
Gilles`,
  },
  {
    id: '1a_relance_final',
    label: 'Flux 1a : Relance finale',
    targetProfile: 'recruiter_esn',
    body: `Bonjour {{firstName}},

Dernier message de ma part pour ne pas encombrer votre boîte.

Mon profil a évolué depuis nos derniers échanges, gillescobigo.com est à jour si vous souhaitez y jeter un oeil.

Si une opportunité se présente au sein {{companyNameWithDe}}, je reste preneur.

Bonne continuation.
Gilles`,
  },
  {
    id: '1b_relance',
    label: 'Relance recruteur entreprise (interne)',
    targetProfile: 'recruiter_entreprise',
    body: `Bonjour {{firstName}},\n\nJe me permets de relancer mon message précédent, au cas où il serait passé sous les radars.\n\nJe suis en reconversion active vers le développement web (React, Node.js, TypeScript) avec un background BIM assez atypique. Je reste à la recherche d'un poste de développeur fullstack et {{companyName}} m'intéresse toujours. Si un profil comme le mien peut être utile au sein de vos équipes, je serais ravi d'échanger.\n\nBonne continuation,\nGilles`,
  },
  {
    id: '1b_relance_final',
    label: 'Flux 1b : Relance finale',
    targetProfile: 'recruiter_entreprise',
    body: `Bonjour {{firstName}},\n\nDernier message de ma part pour ne pas encombrer votre boîte.\n\nMon profil a évolué depuis nos derniers échanges, gillescobigo.com est à jour si vous souhaitez y jeter un œil.\n\nSi un poste correspondant à mon profil s'ouvre au sein {{companyNameWithDe}}, je reste preneur.\n\nBonne continuation,\nGilles`,
  },
  {
    id: '2_relance_before_17_07',
    label: 'Flux 2 : Relance avant 17/07',
    targetProfile: 'cto_directeur_technique',
    body: `Bonjour {{firstName}},

Je me permets de revenir vers vous suite à mon précédent message.

Cet été, j'ai structuré ma façon de piloter plusieurs projets en parallèle avec des agents IA, ce qui me permet aujourd'hui de faire avancer 3 chantiers de front : Cerithe (carnet de santé numérique du bâtiment), Nexio (CRM qui pilote ma recherche d'emploi avec scoring automatique des annonces) et un nouveau projet de création automatisée de sites vitrine pour des commerces qui n'en ont pas.

Tout est présenté sur gillescobigo.com.

Je reste intéressé pour rejoindre {{companyName}}. Avez-vous des besoins sur lesquels mon profil pourrait correspondre ?

À votre disposition pour échanger.

Gilles`,
  },
  {
    id: '2_relance_after_17_07',
    label: 'Flux 2 : Relance après 17/07',
    targetProfile: 'cto_directeur_technique',
    body: `Bonjour {{firstName}},

Je me permets de revenir vers vous suite à mon précédent message.

Cet été, j'ai structuré ma façon de piloter plusieurs projets en parallèle avec des agents IA, ce qui me permet aujourd'hui de faire avancer 3 chantiers de front : Cerithe (carnet de santé numérique du bâtiment), Nexio (CRM qui pilote ma recherche d'emploi avec scoring automatique des annonces) et un nouveau projet de création automatisée de sites vitrine pour des commerces qui n'en ont pas.

Tout est présenté sur gillescobigo.com.

Je reste intéressé pour rejoindre {{companyName}}. Avez-vous des besoins sur lesquels mon profil pourrait correspondre ?

À votre disposition pour échanger.

Gilles`,
  },
  {
    id: '2_relance_final',
    label: 'Flux 2 : Relance finale',
    targetProfile: 'cto_directeur_technique',
    body: `Bonjour {{firstName}},

Dernier message de ma part pour ne pas encombrer votre boîte.

Mon profil a évolué depuis nos derniers échanges, gillescobigo.com est à jour si vous souhaitez y jeter un œil.

Si une opportunité se présente au sein {{companyNameWithDe}}, je reste preneur.

Bonne continuation.
Gilles`,
  },
  {
    id: '3_relance_before_17_07',
    label: 'Flux 3 : Relance avant 17/07',
    targetProfile: 'lead_dev_tech_lead',
    body: `Bonjour {{firstName}},

Je me permets de revenir vers vous suite à mon précédent message.

Cet été, j'ai structuré ma façon de piloter plusieurs projets en parallèle avec des agents IA, ce qui me permet aujourd'hui de faire avancer 3 chantiers de front : Cerithe (carnet de santé numérique du bâtiment), Nexio (CRM qui pilote ma recherche d'emploi avec scoring automatique des annonces) et un nouveau projet de création automatisée de sites vitrine pour des commerces qui n'en ont pas.

Tout est présenté sur gillescobigo.com.

Je reste intéressé pour rejoindre {{companyName}}. Avez-vous des besoins sur lesquels mon profil pourrait correspondre ?

À votre disposition pour échanger.

Gilles`,
  },
  {
    id: '3_relance_after_17_07',
    label: 'Flux 3 : Relance après 17/07',
    targetProfile: 'lead_dev_tech_lead',
    body: `Bonjour {{firstName}},

Je me permets de revenir vers vous suite à mon précédent message.

Cet été, j'ai structuré ma façon de piloter plusieurs projets en parallèle avec des agents IA, ce qui me permet aujourd'hui de faire avancer 3 chantiers de front : Cerithe (carnet de santé numérique du bâtiment), Nexio (CRM qui pilote ma recherche d'emploi avec scoring automatique des annonces) et un nouveau projet de création automatisée de sites vitrine pour des commerces qui n'en ont pas.

Tout est présenté sur gillescobigo.com.

Je reste intéressé pour rejoindre {{companyName}}. Avez-vous des besoins sur lesquels mon profil pourrait correspondre ?

À votre disposition pour échanger.

Gilles`,
  },
  {
    id: '3_relance_final',
    label: 'Flux 3 : Relance finale',
    targetProfile: 'lead_dev_tech_lead',
    body: `Bonjour {{firstName}},

Dernier message de ma part pour ne pas encombrer votre boîte.

Mon site gillescobigo.com reste à jour si vous souhaitez suivre mes projets ou me recontacter à l'avenir.

Bonne continuation.

Gilles`,
  },
  {
    id: '4_relance_before_17_07',
    label: 'Flux 4 : Relance avant 17/07',
    targetProfile: 'business_manager_esn',
    body: `Bonjour {{firstName}},

Je me permets de revenir vers vous suite à mon message du {{lastContactDate}}.

Toujours disponible et mobile sur Bordeaux, Pau, Bayonne et Mont-de-Marsan. Mes projets, dont Cerithe (un carnet de santé numérique du bâtiment) et Nexio (un CRM de suivi de recherche d'emploi), sont visibles en démo sur gillescobigo.com.

Si un de vos clients cherche un profil fullstack dans la région, je serais ravi d'échanger.

À votre disposition.
Gilles`,
  },
  {
    id: '4_relance_after_17_07',
    label: 'Flux 4 : Relance après 17/07',
    targetProfile: 'business_manager_esn',
    body: `Bonjour {{firstName}},

Je me permets de revenir vers vous suite à mon message du {{lastContactDate}}.

Toujours disponible et mobile sur Bordeaux, Pau, Bayonne et Mont-de-Marsan. Depuis, Cerithe (un de mes projets) est passé en production, accessible en démo sur gillescobigo.com aux côtés de Nexio, un CRM de suivi de recherche d'emploi.

Si un de vos clients cherche un profil fullstack, je suis preneur d'un échange.

À votre disposition.
Gilles`,
  },
  {
    id: '4_relance_final',
    label: 'Flux 4 : Relance finale',
    targetProfile: 'business_manager_esn',
    body: `Bonjour {{firstName}},

Dernier message de ma part pour ne pas encombrer votre boîte.

Mon profil a évolué depuis nos derniers échanges, gillescobigo.com est à jour si vous souhaitez y jeter un œil. Je reste dispo et mobile sur Bordeaux, Pau, Bayonne et Mont-de-Marsan.

Si une mission se présente côté client, je suis preneur d'un échange.

Bonne continuation.
Gilles`,
  },
]
