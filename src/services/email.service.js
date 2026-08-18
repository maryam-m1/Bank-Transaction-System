require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Banking System" <${process.env.EMAIL_USER}>`, 
      to, 
      subject, 
      text, 
      html, 
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Registration Confirmation Mail
async function sendRegisterationEmail(userEmail, name) {
    const subject = "Welcome to our Banking System"
    const text = `Hello ${name}! \n\n Thank You for being registered at our Bank. We are excited to have you on board.\nBest Regards:\n\n Banking Team`
    const html = `<p>Hello ${name}!</p><p>Thank You for being registered at our Bank. We are excited to have you on board.</p><p><br>Best Regards:<br> Banking Team</p>`
    await sendEmail(userEmail, subject, text, html)
}

// Transaction Confirmation Mail
async function sendSuccessfulTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = "Transaction Successful!"
    const text = `Hello ${name}! Your transaction of ${amount} to ${toAccount} is completed.  \n\n `
    const html = `<p>Hello ${name}!</p><p>Your transaction of ${amount} to ${toAccount} is completed. </p>`
    await sendEmail(userEmail, subject, text, html)
}

async function sendFailedTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = "Transaction Failed!"
    const text = `Hello ${name}! Your transaction of ${amount} to account ${toAccount} is Failed.  \n\n `
    const html = `<p>Hello ${name}!</p><p>Your transaction of ${amount} to account ${toAccount} is Failed. </p>`
    await sendEmail(userEmail, subject, text, html)
}

module.exports = { transporter, sendEmail, sendRegisterationEmail, sendSuccessfulTransactionEmail, sendFailedTransactionEmail };