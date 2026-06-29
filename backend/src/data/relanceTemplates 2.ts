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
    label: 'Flux 1a — Relance après 17/07',
    targetProfile: 'recruiter_esn',
    body: `Bonjour [Prénom],

Je me permets de revenir vers vous suite à mon message du [DATE].

Cerithe vient de passer en production. C'est le projet dont je vous parlais et il est maintenant en ligne. Depuis gillescobigo.com vous pouvez d'ailleurs accéder aux démos de mes différents projets et vous faire une idée concrète de ce que je construis.

Je reste à la recherche d'un poste fullstack dans la région de [VILLE] et [NOM ESN] m'intéresse toujours.

À votre disposition pour échanger.
Gilles`,
  },
  {
    id: '1a_relance_final',
    label: 'Flux 1a — Relance finale',
    targetProfile: 'recruiter_esn',
    body: `Bonjour [Prénom],

Dernier message de ma part pour ne pas encombrer votre boîte.

Mon profil a évolué depuis nos derniers échanges, gillescobigo.com est à jour si vous souhaitez y jeter un oeil.

Si une opportunité se présente au sein de [NOM ESN], je reste preneur.

Bonne continuation.
Gilles`,
  },
  {
    id: '1b_relance',
    label: 'Relance recruteuse freelance',
    targetProfile: 'recruiter_freelance',
    body: `Bonjour {{firstName}},\n\nJe me permets de relancer mon message précédent, au cas où il serait passé sous les radars.\n\nJe suis en reconversion active vers le développement web (React, Node.js, TypeScript) avec un background BIM assez atypique. Si vous avez des mandats en cours pour lesquels mon profil pourrait correspondre, je serais ravi d'en discuter.\n\nBonne continuation,\nGilles`,
  },
  {
    id: '2_relance_before_17_07',
    label: 'Flux 2 — Relance avant 17/07',
    targetProfile: 'cto_directeur_technique',
    body: `Bonjour [Prénom],

Je me permets de revenir vers vous suite à mon message du [DATE].

Depuis, j'ai mis en ligne deux projets : Cerithe, un carnet de santé numérique du bâtiment, et Nexio, un CRM de suivi de recherche d'emploi avec extraction IA des profils LinkedIn et scoring automatique des annonces. Démos accessibles directement sur gillescobigo.com, code sur GitHub, et un article par jour qui documente chaque décision technique.

Je reste à la recherche d'un poste fullstack dans la région de [VILLE] et [NOM BOITE] m'intéresse toujours.

À votre disposition pour échanger.
Gilles`,
  },
  {
    id: '2_relance_after_17_07',
    label: 'Flux 2 — Relance après 17/07',
    targetProfile: 'cto_directeur_technique',
    body: `Bonjour [Prénom],

Je me permets de revenir vers vous suite à mon message du [DATE].

Depuis, j'ai mis en ligne Nexio, un CRM de suivi de recherche d'emploi avec extraction IA des profils LinkedIn et scoring automatique des annonces. Démo accessible directement sur gillescobigo.com, et le code est sur GitHub.

Je reste à la recherche d'un poste fullstack dans la région de [VILLE] et [NOM BOITE] m'intéresse toujours.

À votre disposition pour échanger.
Gilles`,
  },
  {
    id: '2_relance_final',
    label: 'Flux 2 — Relance finale',
    targetProfile: 'cto_directeur_technique',
    body: `Bonjour [Prénom],

Dernier message de ma part pour ne pas encombrer votre boîte.

Mon profil a évolué depuis nos derniers échanges, gillescobigo.com est à jour si vous souhaitez y jeter un œil.

Si une opportunité se présente au sein de [NOM BOITE], je reste preneur.

Bonne continuation.
Gilles`,
  },
  {
    id: '3_relance_before_17_07',
    label: 'Flux 3 — Relance avant 17/07',
    targetProfile: 'lead_dev_tech_lead',
    body: `Bonjour [Prénom],

Je me permets de revenir vers vous suite à mon message du [DATE].

Depuis, j'ai mis en ligne deux projets : Cerithe, un carnet de santé numérique du bâtiment, et Nexio, un CRM de suivi de recherche d'emploi avec extraction IA des profils LinkedIn et scoring automatique des annonces. Démos accessibles directement sur gillescobigo.com, code sur GitHub, et un article par jour qui documente chaque décision technique, autant pour ancrer ce que j'apprends que pour partager une démarche.

Je reste à la recherche d'un poste fullstack dans la région de [VILLE] et [NOM BOITE] m'intéresse toujours.

À votre disposition pour échanger.
Gilles`,
  },
  {
    id: '3_relance_after_17_07',
    label: 'Flux 3 — Relance après 17/07',
    targetProfile: 'lead_dev_tech_lead',
    body: `Bonjour [Prénom],

Je me permets de revenir vers vous suite à mon message du [DATE].

Depuis, Cerithe est passé en production. C'est le projet dont je vous parlais et il est maintenant en ligne, accessible en démo sur gillescobigo.com. J'ai également mis en ligne Nexio, un CRM de suivi de recherche d'emploi avec extraction IA des profils LinkedIn et scoring automatique des annonces.

Je reste à la recherche d'un poste fullstack dans la région de [VILLE] et [NOM BOITE] m'intéresse toujours.

À votre disposition pour échanger.
Gilles`,
  },
  {
    id: '3_relance_final',
    label: 'Flux 3 — Relance finale',
    targetProfile: 'lead_dev_tech_lead',
    body: `Bonjour [Prénom],

Dernier message de ma part pour ne pas encombrer votre boîte.

Mon profil a évolué depuis nos derniers échanges, gillescobigo.com est à jour si vous souhaitez y jeter un œil.

Si une opportunité se présente au sein de [NOM BOITE], je reste preneur.

Bonne continuation.
Gilles`,
  },
  {
    id: '4_relance_before_17_07',
    label: 'Flux 4 — Relance avant 17/07',
    targetProfile: 'business_manager_esn',
    body: `Bonjour [Prénom],

Je me permets de revenir vers vous suite à mon message du [DATE].

Pour vous donner plus de visibilité sur mon profil : développeur fullstack, stack Node.js, TypeScript, React, Postgres. Dispo immédiatement, mobile sur Bordeaux, Pau, Bayonne et Mont-de-Marsan.

Profil hybride avec 10 ans dans le bâtiment, dont BIM Manager sur Mareterra à Monaco. Depuis, j'ai mis en ligne deux projets : Cerithe, un carnet de santé numérique du bâtiment, et Nexio, un CRM de suivi de recherche d'emploi. Démos accessibles directement sur gillescobigo.com.

Si un de vos clients cherche un profil fullstack dans la région, je serais ravi d'échanger.

À votre disposition.
Gilles`,
  },
  {
    id: '4_relance_after_17_07',
    label: 'Flux 4 — Relance après 17/07',
    targetProfile: 'business_manager_esn',
    body: `Bonjour [Prénom],

Je me permets de revenir vers vous suite à mon message du [DATE].

Cerithe vient de passer en production dans les délais annoncés. Le projet est accessible en démo sur gillescobigo.com, aux côtés de Nexio, un CRM de suivi de recherche d'emploi que j'ai également mis en ligne depuis.

Je reste dispo immédiatement, mobile sur Bordeaux, Pau, Bayonne et Mont-de-Marsan. Si un de vos clients cherche un profil fullstack, je suis preneur d'un échange.

À votre disposition.
Gilles`,
  },
  {
    id: '4_relance_final',
    label: 'Flux 4 — Relance finale',
    targetProfile: 'business_manager_esn',
    body: `Bonjour [Prénom],

Dernier message de ma part pour ne pas encombrer votre boîte.

Mon profil a évolué depuis nos derniers échanges, gillescobigo.com est à jour si vous souhaitez y jeter un œil. Je reste dispo et mobile sur Bordeaux, Pau, Bayonne et Mont-de-Marsan.

Si une mission se présente côté client, je suis preneur d'un échange.

Bonne continuation.
Gilles`,
  },
]
