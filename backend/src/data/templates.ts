interface ITemplate {
  id: string;
  label: string;
  targetProfile: string;
  body: string;
}

export const templates: ITemplate[] = [
  {
    id: "recruiter_esn",
    label: "Recruteur ESN",
    targetProfile: "recruiter_esn",
    body: `Bonjour {{firstName}},\n\nJe me permets de vous contacter car je suis en pleine transition vers le développement web full-stack après 10 ans en tant que BIM Manager dans le bâtiment.\n\nVotre activité chez {{companyName}} m'intéresse particulièrement, je serais ravi d'échanger sur les opportunités que vous accompagnez dans ce domaine.\n\nSeriez-vous disponible pour un bref échange ?\n\nCordialement,\nGilles`,
  },
  {
    id: "recruiter_freelance",
    label: "Recruteuse freelance",
    targetProfile: "recruiter_freelance",
    body: `Bonjour {{firstName}},\n\nJ'ai vu votre profil et votre activité de recrutement indépendant m'a immédiatement interpellé.\n\nJe suis en reconversion vers le développement web (React, Node.js, TypeScript) après une belle carrière dans la gestion de projet BIM. Mon profil atypique intéresse souvent les startups et scale-ups tech.\n\nAvez-vous des mandats en cours pour lesquels je pourrais correspondre ?\n\nBonne journée,\nGilles`,
  },
  {
    id: "cto",
    label: "CTO / Lead Dev",
    targetProfile: "cto",
    body: `Bonjour {{firstName}},\n\nJe vous contacte car votre stack et votre approche technique chez {{companyName}} correspondent exactement à ce que je construis depuis plusieurs mois.\n\nVenu du BIM (gestion de données complexes, coordination multi-acteurs), je me reconvertis sur React/Node/TypeScript et je cherche un environnement exigeant pour progresser vite.\n\nUn échange de 15 min vous serait-il possible ?\n\nCordialement,\nGilles`,
  },
];
