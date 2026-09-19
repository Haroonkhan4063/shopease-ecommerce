const nodemailer = require("nodemailer");

// Works with any SMTP provider (Gmail, Mailtrap for testing, SendGrid, etc.)
// See .env.example for the required variables.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for 587/others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"ShopEase" <no-reply@vendorhub.com>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
