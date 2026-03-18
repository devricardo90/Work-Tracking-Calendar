import nodemailer from "nodemailer";

import { getConfig } from "../config.js";

export class MailerConfigurationError extends Error {}

export function getMailer() {
  const config = getConfig();

  if (!config.SMTP_HOST || !config.SMTP_PORT || !config.SMTP_FROM) {
    throw new MailerConfigurationError("Email delivery is not configured");
  }

  return nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth:
      config.SMTP_USER && config.SMTP_PASS
        ? {
            user: config.SMTP_USER,
            pass: config.SMTP_PASS,
          }
        : undefined,
  });
}

export function getMailerFromAddress() {
  const config = getConfig();

  if (!config.SMTP_FROM) {
    throw new MailerConfigurationError("Email delivery is not configured");
  }

  return config.SMTP_FROM;
}
