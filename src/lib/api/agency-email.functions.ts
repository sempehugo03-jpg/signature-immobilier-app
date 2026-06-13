import { createServerFn } from "@tanstack/react-start";

import { isValidEmail } from "@/lib/email-utils";
import {
  buildInviteEmailBody,
  getInviteEmailSubject,
  isInviteAccessType,
} from "@/lib/invite-email";

type EmailPayload = {
  to: string[];
  subject: string;
  body: string;
};

type InviteEmailPayload = {
  inviteType: "manager_invite" | "agent_invite" | "seller_invite";
  agencyName: string;
  recipientEmail: string;
  recipientFirstName: string;
  accessUrl: string;
  propertyTitle?: string;
};

export const sendManagerAccessEmail = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const payload = normalizeEmailPayload(data);
  if (!payload) {
    return {
      sent: false,
      reason: "INVALID_EMAIL",
    };
  }

  return sendViaResend(payload, "manager-access");
});

export const sendLeadNotificationEmail = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const payload = normalizeEmailPayload(data);
  if (!payload) {
    return {
      sent: false,
      reason: "INVALID_EMAIL",
    };
  }

  return sendViaResend(payload, "lead");
});

export const sendInviteEmail = createServerFn({
  method: "POST",
}).handler(async ({ data }) => {
  const payload = normalizeInviteEmailPayload(data);
  if (!payload) {
    return {
      sent: false,
      reason: "INVALID_EMAIL",
    };
  }

  const subject = getInviteEmailSubject(payload.inviteType);
  const body = buildInviteEmailBody({
    inviteType: payload.inviteType,
    agencyName: payload.agencyName,
    recipientFirstName: payload.recipientFirstName,
    accessUrl: payload.accessUrl,
    propertyTitle: payload.propertyTitle,
  });

  return sendViaResend(
    {
      to: [payload.recipientEmail],
      subject,
      body,
    },
    "invite",
  );
});

function normalizeEmailPayload(data: unknown): EmailPayload | null {
  if (!isRecord(data)) return null;

  const to = Array.isArray(data.to)
    ? data.to
        .filter((email): email is string => typeof email === "string")
        .map((email) => email.trim())
        .filter(isValidEmail)
    : [];
  const subject = typeof data.subject === "string" ? data.subject.trim() : "";
  const body = typeof data.body === "string" ? data.body.trim() : "";

  if (!to.length || !subject || !body) return null;

  return { to, subject, body };
}

function normalizeInviteEmailPayload(data: unknown): InviteEmailPayload | null {
  if (!isRecord(data)) return null;

  const inviteType = data.inviteType;
  const recipientEmail =
    typeof data.recipientEmail === "string" ? data.recipientEmail.trim() : "";
  const recipientFirstName =
    typeof data.recipientFirstName === "string"
      ? data.recipientFirstName.trim()
      : "";
  const agencyName =
    typeof data.agencyName === "string" ? data.agencyName.trim() : "";
  const accessUrl =
    typeof data.accessUrl === "string" ? data.accessUrl.trim() : "";
  const propertyTitle =
    typeof data.propertyTitle === "string" ? data.propertyTitle.trim() : "";

  if (
    !isInviteAccessType(inviteType) ||
    !isValidEmail(recipientEmail) ||
    !agencyName ||
    !accessUrl
  ) {
    return null;
  }

  return {
    inviteType,
    agencyName,
    recipientEmail,
    recipientFirstName,
    accessUrl,
    propertyTitle: propertyTitle || undefined,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function sendViaResend(
  data: EmailPayload,
  context: "manager-access" | "lead" | "invite",
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;

  if (!apiKey) {
    console.info("Email non envoyé : RESEND_API_KEY manquante");
    return {
      sent: false,
      reason: "RESEND_API_KEY_MISSING",
    };
  }

  if (!from) {
    console.info(`Email non envoyé (${context}) : FROM_EMAIL manquante`);
    return {
      sent: false,
      reason: "FROM_EMAIL_MISSING",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: data.to,
        subject: data.subject,
        text: data.body,
      }),
    });

    if (!response.ok) {
      console.info(`Email Resend non envoyé (${context}) : ${response.status}`);
      return {
        sent: false,
        reason: "RESEND_SEND_FAILED",
      };
    }

    return {
      sent: true,
      reason: null,
    };
  } catch (error) {
    console.info(`Email Resend non envoyé (${context})`, error);
    return {
      sent: false,
      reason: "RESEND_SEND_FAILED",
    };
  }
}
