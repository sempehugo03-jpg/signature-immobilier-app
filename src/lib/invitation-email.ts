const PUBLIC_APP_URL = "https://signature-immobilier-app.vercel.app";

export type InvitationEmail = {
  activationUrl: string;
  subject: string;
  body: string;
  mailtoHref: string;
  gmailHref: string;
};

function cleanBaseUrl(value?: string) {
  if (!value) return PUBLIC_APP_URL;

  try {
    const url = new URL(value);
    const host = url.host.toLowerCase();

    if (
      host.includes("localhost") ||
      host.includes("127.0.0.1") ||
      host.includes("signature-immobilier-app-git-main")
    ) {
      return PUBLIC_APP_URL;
    }

    return url.origin;
  } catch {
    return PUBLIC_APP_URL;
  }
}

export function getPublicAppUrl() {
  const env = import.meta.env as Record<string, string | undefined>;
  return cleanBaseUrl(env.VITE_APP_URL ?? env.APP_URL ?? PUBLIC_APP_URL);
}

export function buildPublicAppUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getPublicAppUrl()}${normalizedPath}`;
}

export function buildMailto(email: string, subject: string, body: string) {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

export function buildGmailComposeUrl(
  email: string,
  subject: string,
  body: string,
) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: email,
    su: subject,
    body,
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function buildInvitationEmail({
  email,
  activationUrl,
  subject,
  body,
}: {
  email: string;
  activationUrl: string;
  subject: string;
  body: string;
}): InvitationEmail {
  return {
    activationUrl,
    subject,
    body,
    mailtoHref: buildMailto(email, subject, body),
    gmailHref: buildGmailComposeUrl(email, subject, body),
  };
}

export function openMailApp(mailtoHref: string) {
  window.location.href = mailtoHref;
}

export function openGmailCompose(gmailHref: string) {
  const opened = window.open(gmailHref, "_blank");
  if (opened) {
    opened.opener = null;
  }
  return Boolean(opened);
}
