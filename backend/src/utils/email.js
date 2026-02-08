const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

const sendDueDateReminder = async (userEmail, userName, bookTitle, dueDate) => {
  const html = `
    <h2>借阅到期提醒</h2>
    <p>尊敬的 ${userName}，</p>
    <p>您借阅的图书 <strong>《${bookTitle}》</strong> 即将到期。</p>
    <p>到期日期：<strong>${new Date(dueDate).toLocaleDateString('zh-CN')}</strong></p>
    <p>请及时归还或续借，以免产生逾期费用。</p>
    <br>
    <p>BookFlow 图书馆管理系统</p>
  `;
  return sendEmail(userEmail, '图书借阅到期提醒', html);
};

module.exports = {
  sendEmail,
  sendDueDateReminder
};
