import nodemailer from "nodemailer";

export function getMailer() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendMail(to: string, subject: string, html: string) {
  const transporter = getMailer();
  await transporter.sendMail({
    from: `"קלוד קוד לרבנים" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
