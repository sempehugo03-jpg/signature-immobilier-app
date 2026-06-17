export type InviteAccessType =
  | "manager_invite"
  | "agent_invite"
  | "seller_invite";

export type InviteEmailTemplateInput = {
  inviteType: InviteAccessType;
  agencyName: string;
  recipientFirstName: string;
  accessUrl: string;
  propertyTitle?: string;
};

export type ManagerInviteEmailContentInput = {
  firstName: string;
  agencyName: string;
  inviteUrl: string;
};

export type EmailUrlInput = {
  to: string;
  subject: string;
  body: string;
};

export function isInviteAccessType(value: unknown): value is InviteAccessType {
  return (
    value === "manager_invite" ||
    value === "agent_invite" ||
    value === "seller_invite"
  );
}

export function getInviteEmailSubject(inviteType: InviteAccessType) {
  if (inviteType === "seller_invite") {
    return "Votre espace de suivi vendeur est prêt";
  }

  return "Créez votre accès Signature Immobilier";
}

export function buildInviteEmailBody({
  inviteType,
  agencyName,
  recipientFirstName,
  accessUrl,
  propertyTitle,
}: InviteEmailTemplateInput) {
  const recipientName = recipientFirstName.trim();
  const firstName = recipientName || "à vous";
  const agency = agencyName.trim() || "votre agence";

  if (inviteType === "manager_invite") {
    return [
      recipientName ? `Bonjour ${recipientName},` : "Bonjour,",
      "",
      `Vous avez été ajouté comme gérant du portail Signature Immobilier de ${agency}.`,
      "",
      "Créez votre accès ici :",
      accessUrl,
      "",
      "Depuis votre espace, vous pourrez gérer votre agence, vos biens, vos agents, vos demandes d’estimation et les espaces vendeurs.",
      "",
      "À bientôt,",
      "Signature Immobilier",
    ].join("\n");
  }

  if (inviteType === "agent_invite") {
    return [
      `Bonjour ${firstName},`,
      "",
      `Vous avez été ajouté à l’espace Signature Immobilier de ${agency}.`,
      "",
      "Créez votre accès pour rejoindre l’espace agence :",
      "",
      "[ BOUTON : Créer mon accès ]",
      accessUrl,
      "",
      "Depuis votre espace, vous pourrez gérer les informations visibles par vos clients vendeurs :",
      "- biens",
      "- visites",
      "- comptes rendus",
      "- documents",
      "- progression de vente",
      "",
      "Signature Immobilier ne remplace pas votre CRM.",
      "Il améliore ce que vos clients voient.",
      "",
      "À bientôt.",
    ].join("\n");
  }

  return [
    `Bonjour ${firstName},`,
    "",
    "Votre agence vous donne accès à un espace privé pour suivre la vente de votre bien.",
    propertyTitle ? `Bien concerné : ${propertyTitle}` : "",
    "",
    "Créez votre accès ici :",
    "",
    "[ BOUTON : Créer mon accès vendeur ]",
    accessUrl,
    "",
    "Dans votre espace, vous pourrez retrouver :",
    "- la progression de votre vente",
    "- les prochaines visites",
    "- les comptes rendus",
    "- les documents importants",
    "",
    "Votre agence met à jour cet espace à chaque étape importante.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildManagerInviteEmailContent({
  firstName,
  agencyName,
  inviteUrl,
}: ManagerInviteEmailContentInput) {
  return {
    subject: getInviteEmailSubject("manager_invite"),
    body: buildInviteEmailBody({
      inviteType: "manager_invite",
      agencyName,
      recipientFirstName: firstName,
      accessUrl: inviteUrl,
    }),
  };
}

export function buildGmailComposeUrl({ to, subject, body }: EmailUrlInput) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    to.trim(),
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildMailtoUrl({ to, subject, body }: EmailUrlInput) {
  return `mailto:${encodeURIComponent(to.trim())}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

export function openGmailCompose(gmailUrl: string) {
  const opened = window.open(gmailUrl, "_blank", "noopener,noreferrer");
  if (opened) opened.opener = null;
}

export function openMailApp(mailtoUrl: string) {
  window.location.href = mailtoUrl;
}
