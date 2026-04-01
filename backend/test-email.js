const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
  let transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('Using Gmail with credentials...');
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    console.log('Using Ethereal Mail...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  try {
    const info = await transporter.sendMail({
      from: '"Yarn Art Store 🧶" <noreply@yarnartstore.com>',
      to: 'your-test-email@example.com', // Replace with your email for testing
      subject: 'Test Email',
      text: 'This is a test email.',
    });

    console.log("Message sent: %s", info.messageId);
    if (!process.env.EMAIL_USER) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error("Error occurred:", error.message);
    if (error.code === 'EAUTH') {
        console.error("Authentication failed. Please check if Gmail App Password is correct.");
    }
  }
};

sendEmail().then(() => console.log('Finished test script.')).catch(err => console.error('Script failed:', err));
