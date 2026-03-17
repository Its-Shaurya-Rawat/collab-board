const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const sendTaskAssignedEmail = async ({ toEmail, toName, taskTitle, assignerName, boardUrl }) => {
  await transporter.sendMail({
    from: `"CollabBoard" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `You've been assigned: ${taskTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0a0a0f;color:#e8e6f0;padding:32px;border-radius:12px;">
        <h2 style="color:#7c5cfc;">✦ CollabBoard</h2>
        <p>Hi ${toName},</p>
        <p><strong>${assignerName}</strong> assigned you a new task:</p>
        <div style="background:#16161f;border:1px solid #ffffff0f;border-radius:8px;padding:16px;margin:16px 0;">
          <strong style="font-size:18px;">${taskTitle}</strong>
        </div>
        <a href="${boardUrl}" style="display:inline-block;background:#7c5cfc;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View Task →</a>
      </div>
    `
  });
};

const sendWelcomeEmail = async ({ toEmail, toName }) => {
  await transporter.sendMail({
    from: `"CollabBoard" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Welcome to CollabBoard, ${toName}!`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0a0a0f;color:#e8e6f0;padding:32px;border-radius:12px;">
        <h2 style="color:#7c5cfc;">✦ Welcome to CollabBoard</h2>
        <p>Hi ${toName}, your account is ready!</p>
        <p>Start collaborating with your team in real-time.</p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:#7c5cfc;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Open CollabBoard →</a>
      </div>
    `
  });
};

module.exports = { sendTaskAssignedEmail, sendWelcomeEmail };