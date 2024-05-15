import type { SendEmailCommandInput } from "@aws-sdk/client-sesv2";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import type { Lead, PasswordReset, User } from "@prisma/client";
import { nanoid } from "nanoid";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const client = new SESv2Client({ region: "us-east-1" });

export async function sendPasswordResetEmail({ email, token }: { email: User["email"]; token: PasswordReset["token"] }) {
  if (!process.env.ADMIN_URL) throw new Error("ADMIN_URL is not set");
  const url = new URL(process.env.ADMIN_URL);
  url.pathname = "/passwords/new";
  url.searchParams.set("token", token);

  try {
    const data = await resend.sendEmail({
      from: "Cosmic Labs <no-reply@getcosmic.dev>",
      // to: email,
      to: "paulh.morris@gmail.com",
      subject: "Reset Your Password",
      html: `
        <p>Hi there,</p>
        <p>Someone requested a password reset for your Cosmic Labs account. If this was you, please click the link below to reset your password. The link will expire in 15 minutes.</p>
        <p><a style="color:#976bff" href="${url}" target="_blank">Reset Password</a></p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
     `,
    });
    return { data };
  } catch (error) {
    return { error };
  }
}

export async function sendLeadCreationEmail({ emails, data }: { emails: string | string[]; data: Lead }) {
  if (!process.env.ADMIN_URL) throw new Error("ADMIN_URL is not set");
  const fieldsToIgnore = ["cf-turnstile-response", "meta", "id", "updatedAt", "clientId"];

  try {
    const email = await sendEmail({
      from: "Cosmic Labs <no-reply@getcosmic.dev>",
      to: emails,
      subject: "New Lead",
      html: `
        <p>Hi there,</p>
        <p>A new lead has been created!</p>
        <p><a style="color:#976bff" href="${process.env.ADMIN_URL}/leads/${data.id}" target="_blank">View lead in the portal</a></p>
        <p>Details:</p>
        <ul>
          <li><strong>Name:</strong> ${data.name}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Message:</strong> ${data.message}</li>
          <li><strong>Created:</strong> ${data.createdAt.toLocaleString()}</li>
          <li><strong>Additional Fields:</strong></li>
          <ul>
            ${
              data.additionalFields &&
              Object.keys(data.additionalFields)
                .filter((key) => !fieldsToIgnore.includes(key))
                .map((key) => {
                  if (!data.additionalFields) return null;
                  const value = data.additionalFields[key as keyof typeof data.additionalFields];
                  return `<li><strong>${key}:</strong> ${value}</li>`;
                })
                .join("")
            }
          </ul>
        </ul>
      `,
    });
    return { data: email };
  } catch (error) {
    return { error };
  }
}

type SendEmailInput = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
};
function sendEmail(props: SendEmailInput) {
  const input: SendEmailCommandInput = {
    FromEmailAddress: props.from,
    Destination: {
      ToAddresses: [...props.to],
    },
    Content: {
      Simple: {
        Subject: {
          Charset: "UTF-8",
          Data: props.subject,
        },
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: props.html,
          },
        },
        Headers: [
          {
            Name: "X-Entity-Ref-ID",
            Value: nanoid(),
          },
        ],
      },
    },
  };
  const command = new SendEmailCommand(input);
  return client.send(command);
}
