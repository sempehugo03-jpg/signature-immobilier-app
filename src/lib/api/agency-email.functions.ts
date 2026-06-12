import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const emailPayloadSchema = z.object({
  to: z.array(z.string().email()).min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
});

type EmailPayload = z.infer<typeof emailPayloadSchema>;

export const sendManagerAccessEmail = createServerFn({ method: "POST" })
  .validator(emailPayloadSchema)
  .handler(async ({ data }) => sendViaResend(data, "manager-access"));

export const sendLeadNotificationEmail = createServerFn({ method: "POST" })
  .validator(emailPayloadSchema)
  .handler(async ({ data }) => sendViaResend(data, "lead"));

async function sendViaResend(
  data: EmailPayload,
  context: "manager-access" | "lead",
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
