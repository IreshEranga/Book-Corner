const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } =
    process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

const transporter = createTransporter();

async function sendEmail({ to, subject, text, correlationId }) {
  if (!transporter) {
    logger.warn("SMTP not configured, skipping email send", {
      correlationId,
      to,
    });
    return {
      sent: false,
      reason: "smtp_not_configured",
    };
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || "no-reply@bookcorner.local",
    to,
    subject,
    text,
  });

  logger.info("Email sent", {
    correlationId,
    to,
    messageId: info.messageId,
  });

  return {
    sent: true,
    messageId: info.messageId,
  };
}

module.exports = {
  sendEmail,
};
