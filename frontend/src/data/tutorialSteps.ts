export interface ITutorialStep {
  step: number;
  title: string;
  content: string[];
  image?: string;
  images?: string[];
}

export const TUTORIAL_STEPS: ITutorialStep[] = [
  {
    step: 1,
    title: "Bienvenue sur la démo de Nexio",
    content: [
      "Nexio est mon outil personnel de suivi de prospection. Il extrait automatiquement les données depuis LinkedIn, génère les messages adaptés au profil, et gère les relances.",
      "Ce tuto te montre comment alimenter Nexio avec tes propres données en quelques copier-coller. Compte sur 1 minute.",
    ],
  },
  {
    step: 2,
    title: "Ajouter un contact",
    content: [
      "Va sur un profil LinkedIn, sélectionne le bloc nom + titre + expérience comme sur l'image ci-dessous, et copie-colle le tout dans le formulaire \"Nouveau contact\".",
      "Nexio extrait automatiquement le nom, le poste, l'entreprise, la localisation et le type de profil (RH, CTO, Lead Dev, etc.).",
    ],
    image: "/tutorial/01-contact-linkedin.png",
  },
  {
    step: 3,
    title: "Ajouter une entreprise",
    content: [
      "Une fois le contact créé, tu peux enrichir son entreprise. Va sur la page LinkedIn de la boîte, dans l'onglet \"À propos\", et copie-colle le contenu dans le formulaire dédié.",
      "Nexio en déduit le secteur, la taille, et classe la boîte (ESN ou entreprise finale) pour adapter le ton des messages.",
    ],
    image: "/tutorial/02-entreprise-decathlon.png",
  },
  {
    step: 4,
    title: "Ajouter une annonce d'emploi",
    content: [
      "Sur la page d'une offre LinkedIn, copie-colle toute l'annonce (titre + description complète) dans la section \"Annonces\".",
      "Nexio extrait le titre, l'entreprise, la stack, la localisation, et calcule un score de matching avec ta propre stack.",
    ],
  },
  {
    step: 5,
    title: "Suivre l'évolution de ton profil LinkedIn",
    content: [
      "Chaque semaine, LinkedIn te montre tes statistiques d'impressions, vues de profil, et abonnés. Tu les trouves depuis ta page d'accueil, en cliquant sur \"Voir les analyses\" comme indiqué ci-dessous.",
      "Une fois sur la page de stats détaillées, copie-colle l'ensemble du contenu dans la section \"Stats\". Nexio enregistre un snapshot hebdomadaire et te rappelle à J+7 d'en faire un nouveau.",
    ],
    images: [
      "/tutorial/04-linkedin-stats-where.png",
      "/tutorial/05-linkedin-stats-full.png",
    ],
  },
  {
    step: 6,
    title: "C'est tout",
    content: [
      "Tu as les bases. Explore le kanban, déclenche des relances, regarde les stats.",
      "Ce compte démo est partagé : tes données peuvent évoluer si quelqu'un d'autre teste en même temps. Pour ton propre compte, contacte-moi sur gillescobigo.com.",
    ],
  },
];
