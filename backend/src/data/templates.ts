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
    body: `Bonjour {{firstName}},\n\nJe me permets de vous contacter car je suis en pleine transition vers le développement web full-stack après 10 ans dans le bâtiment dont BIM Manager sur Mareterra à Monaco.\n\nVotre activité chez {{companyName}} m'intéresse particulièrement, je serais ravi d'échanger sur les opportunités que vous accompagnez dans ce domaine.\n\nMon parcours, mes projets, ma stack, tout est sur gillescobigo.com. Je vous ai également fait une courte vidéo de présentation si vous préférez : {{videoLink}}\n\nSeriez-vous disponible pour un bref échange ?\n\nCordialement,\nGilles`,
  },
  {
    id: "1b_first_contact",
    label: "Recruteur entreprise (interne)",
    targetProfile: "recruiter_entreprise",
    body: `Bonjour {{firstName}},\n\nJe me permets de vous contacter car je suis en pleine transition vers le développement web full-stack après 10 ans dans le bâtiment dont BIM Manager sur Mareterra à Monaco.\n\nSi un poste de développeur fullstack est ouvert au sein de vos équipes chez {{companyName}}, je serais ravi d'échanger.\n\nMon parcours, mes projets, ma stack, tout est sur gillescobigo.com. Je vous ai également fait une courte vidéo de présentation si vous préférez : {{videoLink}}\n\nSeriez-vous disponible pour un bref échange ?\n\nCordialement,\nGilles`,
  },
  {
    id: "2_first_contact",
    label: "Flux 2 : CTO / Directeur technique",
    targetProfile: "cto_directeur_technique",
    body: `Bonjour {{firstName}},

Mon parcours est atypique : 10 ans dans le bâtiment, dont BIM Manager sur l'extension en mer de Monaco, à coordonner des équipes et analyser des besoins complexes avant même de savoir coder. J'ai appris à développer pour construire mes propres outils, et c'est devenu mon métier.

Ce qui me distingue aujourd'hui, c'est cette double casquette : je sais lire, comprendre et challenger un système technique dans son ensemble, pas seulement écrire du code ligne à ligne. C'est ce que je mets en pratique sur Cerithe, un carnet de santé numérique du bâtiment (Node.js, TypeScript, React, Postgres, déployé sur un VPS que j'ai monté moi-même) : chaque décision technique y est documentée dans une série d'articles.

Pour creuser, tout est sur gillescobigo.com : les projets en démo, le code sur GitHub, les articles, et un visuel interactif qui détaille mes compétences. Je vous ai également fait une courte vidéo de présentation si vous préférez : {{videoLink}}

Je cherche un poste fullstack dans la région {{locationWithDe}} et {{companyName}} m'intéresse.

À votre disposition pour échanger.
Gilles`,
  },
  {
    id: "3_first_contact",
    label: "Flux 3 : Lead Dev / Tech Lead",
    targetProfile: "lead_dev_tech_lead",
    body: `Bonjour {{firstName}},

Mon parcours est atypique : 10 ans dans le bâtiment, dont BIM Manager sur l'extension en mer de Monaco, à coordonner des équipes et analyser des besoins complexes avant même de savoir coder. J'ai appris à développer pour construire mes propres outils, et c'est devenu mon métier.

Ce qui me distingue aujourd'hui, c'est cette double casquette : je sais lire, comprendre et challenger un système technique dans son ensemble, pas seulement écrire du code ligne à ligne. C'est ce que je mets en pratique sur Cerithe, un carnet de santé numérique du bâtiment (Node.js, TypeScript, React, Postgres, déployé sur un VPS que j'ai monté moi-même) : chaque décision technique y est documentée dans une série d'articles.

Pour creuser, tout est sur gillescobigo.com : les projets en démo, le code sur GitHub, les articles, et un visuel interactif qui détaille mes compétences. Je vous ai également fait une courte vidéo de présentation si vous préférez : {{videoLink}}

Je cherche un poste fullstack dans la région {{locationWithDe}} et {{companyName}} m'intéresse.

À votre disposition pour échanger.
Gilles`,
  },
  {
    id: "4_first_contact",
    label: "Flux 4 : Business Manager / Directeur de projets ESN",
    targetProfile: "business_manager_esn",
    body: `Bonjour {{firstName}},

Développeur fullstack, stack Node.js, TypeScript, React, Postgres. Dispo immédiatement, mobile sur Bordeaux, Pau, Bayonne et Mont-de-Marsan.

Profil hybride : 10 ans dans le bâtiment, dont BIM Manager sur Mareterra à Monaco (projet à 2 milliards). Habitué à dialoguer avec des MOA, à tenir des engagements client et à porter un projet de bout en bout. J'ai appris à coder pour construire mes propres outils et c'est devenu mon métier.

Mes projets, mon code et une présentation détaillée sont sur gillescobigo.com. Je vous ai également fait une courte vidéo de présentation : {{videoLink}}

Si un de vos clients cherche un profil fullstack dans la région {{locationWithDe}}, je serais ravi d'échanger.

À votre disposition.
Gilles`,
  },
  {
    id: "5_first_contact",
    label: "Flux 5 : BIM",
    targetProfile: "bim",
    body: `Bonjour {{firstName}},

Après 10 ans dans le bâtiment dont 5 ans dans le BIM (coordination chez Bouygues Bâtiment Sud-Est, BIM Manager sur l'extension en mer de Monaco), j'ai développé un outil de coordination BIM pensé pour l'usage terrain. Viewer IFC, détection de collisions, échanges structurés entre acteurs de chantier. Une démonstration est en ligne ici : ouvra.gillescobigo.com.

Vous pouvez aussi voir l'outil en action dans cette courte vidéo, {{videoLink}}.

La partie visualisation 3D s'appuie sur des briques open source, ce qui laisse toute liberté pour l'adapter à vos outils et à votre façon de travailler, sans dépendance à un éditeur propriétaire.

Est-ce que développer un outil comme celui-ci, adapté à vos besoins réels sur vos projets, pourrait vous intéresser ?

À votre disposition pour échanger.
Gilles`,
  },
];
