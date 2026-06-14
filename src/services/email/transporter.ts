import nodemailer from "nodemailer";
import { EmailConfig } from "./types.js";

interface SendMailPayload {
  to: string[];
  subject: string;
  html: string;
  attachment?: {
    content: string; // Base64
    filename: string;
    type?: string;
    disposition?: string;
  } | null;
}

/**
 * Sends a pre-compiled and parsed email via the active provider configured in Settings.
 */
export async function sendEmailViaProvider(config: EmailConfig, payload: SendMailPayload) {
  const { to: recipientsArray, subject, html, attachment } = payload;

  if (config.emailProvider === 'none') {
    return { success: true, skipped: true, reason: 'Provider set to none' };
  }

  // Validate credentials
  if (config.emailProvider === 'gmail') {
    if (!config.gmailUser || !config.gmailAppPassword) {
      throw new Error("Gmail credentials missing (GMAIL_USER or GMAIL_APP_PASSWORD)");
    }
  } else {
    if (!config.emailApiKey) {
      throw new Error(`API Key missing for provider: ${config.emailProvider}`);
    }
  }

  // Resend API
  if (config.emailProvider === 'resend') {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.emailApiKey}`,
      },
      body: JSON.stringify({
        from: `${config.senderName} <${config.senderEmail}>`,
        to: recipientsArray.length === 1 ? recipientsArray[0] : recipientsArray,
        subject,
        html,
        attachments: attachment ? [{
          content: attachment.content,
          filename: attachment.filename,
        }] : []
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Resend error: ${JSON.stringify(data)}`);
    }
    return { success: true, data };
  }

  // SendGrid API
  if (config.emailProvider === 'sendgrid') {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.emailApiKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: recipientsArray.map(email => ({ email })) }],
        from: { email: config.senderEmail, name: config.senderName },
        subject,
        content: [{ type: "text/html", value: html }],
        attachments: attachment ? [{
          content: attachment.content,
          filename: attachment.filename,
          type: attachment.type || "application/pdf",
          disposition: attachment.disposition || "attachment"
        }] : []
      }),
    });

    if (!response.ok) {
       const errData = await response.text();
       throw new Error(errData || "SendGrid error");
    }
    return { success: true };
  }

  // Brevo API
  if (config.emailProvider === 'brevo') {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": config.emailApiKey,
      },
      body: JSON.stringify({
        sender: { name: config.senderName, email: config.senderEmail },
        to: recipientsArray.map(email => ({ email })),
        subject: subject,
        htmlContent: html,
        attachment: attachment ? [{
          content: attachment.content,
          name: attachment.filename
        }] : []
      }),
    });

    if (!response.ok) {
       const errData = await response.json();
       throw new Error(errData.message || `Brevo error: ${JSON.stringify(errData)}`);
    }
    return { success: true };
  }

  // Gmail SMTP
  if (config.emailProvider === 'gmail') {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.gmailUser,
        pass: config.gmailAppPassword,
      },
    });

    await transporter.sendMail({
      from: `"${config.senderName}" <${config.gmailUser}>`,
      to: recipientsArray.join(', '),
      subject,
      html,
      attachments: attachment ? [{
        filename: attachment.filename,
        content: Buffer.from(attachment.content, 'base64')
      }] : []
    });

    return { success: true };
  }

  throw new Error(`Provider ${config.emailProvider} not implemented`);
}
