interface ITemplate {
  id: string;
  label: string;
  targetProfile: string;
  body: string;
}

export const templates: ITemplate[] = [
  {
    id: "1a_first_contact",
    label: "Recruteur ESN",
    targetProfile: "recruiter_esn",
    body: `Bonjour {{firstName}},\n\nJe me permets de vous contacter car je suis en pleine transition vers le développement web full-stack après 10 ans en tant que BIM Manager dans le bâtiment.\n\nVotre activité chez {{companyName}} m'intéresse particulièrement, je serais ravi d'échanger sur les opportunités que vous accompagnez dans ce domaine.\n\nSeriez-vous disponible pour un bref échange ?\n\nCordialement,\nGilles`,
  },
  {
    id: "1b_first_contact",
    label: "Recruteuse freelance",
    targetProfile: "recruiter_freelance",
    body: `Bonjour {{firstName}},\n\nJ'ai vu votre profil et votre activité de recrutement indépendant m'a immédiatement interpellé.\n\nJe suis en reconversion vers le développement web (React, Node.js, TypeScript) après une belle carrière dans la gestion de projet BIM. Mon profil atypique intéresse souvent les startups et scale-ups tech.\n\nAvez-vous des mandats en cours pour lesquels je pourrais correspondre ?\n\nBonne journée,\nGilles`,
  },
  {
    id: "2_first_contact",
    label: "Flux 2 — CTO / Directeur technique",
    targetProfile: "cto_directeur_technique",
    body: `Bonjour [Prénom],

Je construis actuellement Cerithe, un carnet de santé numérique du bâtiment. Stack Node.js, TypeScript, React, Postgres, déployé sur un VPS que j'ai monté from scratch. Je documente chaque décision technique dans un article quotidien.

Mon parcours est atypique : 10 ans dans le bâtiment, dont BIM Manager sur Mareterra à Monaco. J'ai appris à coder pour construire mes propres outils, et c'est devenu mon métier.

Tout est sur gillescobigo.com : les projets en démo, le code sur GitHub, les articles, et un visuel interactif qui détaille mes compétences. Je vous ai également fait une courte vidéo de présentation si vous préférez : [LIEN VIDEO]

Je cherche un poste fullstack dans la région de [VILLE] et [NOM BOITE] m'intéresse.

À votre disposition pour échanger.
Gilles`,
  },
  {
    id: "3_first_contact",
    label: "Flux 3 — Lead Dev / Tech Lead",
    targetProfile: "lead_dev_tech_lead",
    body: `Bonjour [Prénom],

Je construis actuellement Cerithe, un carnet de santé numérique du bâtiment. Stack Node.js, TypeScript, React, Postgres, déployé sur un VPS que j'ai monté from scratch. Je documente chaque décision technique dans un article quotidien, autant pour ancrer ce que j'apprends que pour partager une démarche.

Mon parcours est atypique : 10 ans dans le bâtiment, dont BIM Manager sur Mareterra à Monaco. J'ai appris à coder pour construire mes propres outils, et c'est devenu mon métier.

Tout est sur gillescobigo.com : les projets en démo, le code sur GitHub, les articles, et un visuel interactif qui détaille mes compétences. Je vous ai également fait une courte vidéo de présentation si vous préférez : [LIEN VIDEO]

Je cherche un poste fullstack dans la région de [VILLE] et [NOM BOITE] m'intéresse.

À votre disposition pour échanger.
Gilles`,
  },
  {
    id: "4_first_contact",
    label: "Flux 4 — Business Manager / Directeur de projets ESN",
    targetProfile: "business_manager_esn",
    body: `Bonjour [Prénom],

Développeur fullstack, stack Node.js, TypeScript, React, Postgres. Dispo immédiatement, mobile sur Bordeaux, Pau, Bayonne et Mont-de-Marsan.

Profil hybride : 10 ans dans le bâtiment, dont BIM Manager sur Mareterra à Monaco (projet à 2 milliards). Habitué à dialoguer avec des MOA, à tenir des engagements client et à porter un projet de bout en bout. J'ai appris à coder pour construire mes propres outils et c'est devenu mon métier.

Mes projets, mon code et une présentation détaillée sont sur gillescobigo.com. Je vous ai également fait une courte vidéo de présentation : [LIEN VIDEO]

Si un de vos clients cherche un profil fullstack dans la région, je serais ravi d'échanger.

À votre disposition.
Gilles`,
  },
];
