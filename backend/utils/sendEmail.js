const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  // Use natural credentials if provided, else use Ethereal Mail for testing without setup!
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  try {
    const info = await transporter.sendMail({
      from: `"Yarn Art Store 🧶" <${process.env.EMAIL_USER || 'noreply@yarnartstore.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.htmlMessage || `<p>${options.message}</p>`,
    });

    console.log("Message sent: %s", info.messageId);
    if (!process.env.EMAIL_USER) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error("Nodemailer Error: ", error);
    throw error;
  }
};

module.exports = sendEmail;
