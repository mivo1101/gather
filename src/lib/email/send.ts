import { Resend } from "resend";

let resendClient: Resend | null = null;

function configuredFromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() || "onboarding@resend.dev"
  );
}

export function emailFromAddress(): string {
  return configuredFromAddress();
}

export function isEmailSendingConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Email sending is not configured. Add RESEND_API_KEY to your environment.",
    );
  }
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}

function buildFromHeader(fromName: string): string {
  const configured = configuredFromAddress();
  const angle = configured.match(/<([^>]+)>/);
  const address = (angle?.[1] || configured).trim();
  const safeName = fromName.trim().replace(/[<>]/g, "") || "Gather";
  return `${safeName} via Gather <${address}>`;
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo: string;
  fromName: string;
}): Promise<{ id: string }> {
  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from: buildFromHeader(input.fromName),
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email.");
  }
  if (!data?.id) {
    throw new Error("Email provider did not return a message id.");
  }
  return { id: data.id };
}
