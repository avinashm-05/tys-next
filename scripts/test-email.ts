/**
 * Sends ONE real email through the SMTP_* env vars — deliberately bypasses
 * the dev jsonTransport gate in src/lib/mail so it ALWAYS really sends.
 * This is how the owner proves live Hostinger SMTP delivers before deploy.
 *
 * Usage: npx tsx scripts/test-email.ts <recipient@example.com>
 *        (or: npm run email:test -- <recipient@example.com>)
 */
import "./env";
import nodemailer from "nodemailer";

const [recipient] = process.argv.slice(2);

if (!recipient || !recipient.includes("@")) {
  console.error("Usage: npx tsx scripts/test-email.ts <recipient@example.com>");
  process.exit(1);
}

const port = Number(process.env.SMTP_PORT ?? 587);

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  // 465 = implicit TLS; 587 = STARTTLS (secure: false + upgrade).
  secure: port === 465,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

transport
  .sendMail({
    from: `"${process.env.MAIL_FROM_NAME ?? "TYS Global Logistics"}" <${
      process.env.MAIL_FROM_ADDRESS ?? "noreply@tysgloballogistics.com"
    }>`,
    to: recipient,
    subject: "TYS Global Logistics — SMTP test",
    text: `SMTP test sent via ${process.env.SMTP_HOST}:${port}. If you can read this, delivery works.`,
  })
  .then((info) => {
    console.log(`sent: ${info.messageId}`);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
