interface IRelanceTemplate {
  id: string
  label: string
  targetProfile: string
  body: string
}

export const relanceTemplates: IRelanceTemplate[] = [
  {
    id: 'relance_recruiter_esn',
    label: 'Relance recruteur ESN',
    targetProfile: 'recruiter_esn',
    body: `Bonjour {{firstName}},\n\nJe me permets de revenir vers vous suite à mon message précédent. Je suis toujours en recherche active d'une opportunité en développement web full-stack (React / Node.js / TypeScript), et {{companyName}} reste une entreprise qui m'intéresse particulièrement.\n\nAvez-vous eu l'occasion d'y réfléchir ? Je reste disponible pour un échange rapide si vous le souhaitez.\n\nCordialement,\nGilles`,
  },
  {
    id: 'relance_recruiter_freelance',
    label: 'Relance recruteuse freelance',
    targetProfile: 'recruiter_freelance',
    body: `Bonjour {{firstName}},\n\nJe me permets de relancer mon message précédent, au cas où il serait passé sous les radars.\n\nJe suis en reconversion active vers le développement web (React, Node.js, TypeScript) avec un background BIM assez atypique. Si vous avez des mandats en cours pour lesquels mon profil pourrait correspondre, je serais ravi d'en discuter.\n\nBonne continuation,\nGilles`,
  },
  {
    id: 'relance_cto',
    label: 'Relance CTO',
    targetProfile: 'cto',
    body: `Bonjour {{firstName}},\n\nJe reviens vers vous suite à mon message précédent. Je comprends que vous êtes certainement très sollicité.\n\nJe construis activement mes compétences sur React / Node.js / TypeScript et je cherche un environnement technique exigeant pour progresser vite. L'équipe de {{companyName}} correspond exactement à ce que je vise.\n\nUn échange de 10 minutes vous serait-il possible ?\n\nCordialement,\nGilles`,
  },
]
