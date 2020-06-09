const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
  service:'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL_NAME,
    pass: process.env.GMAIL_EMAIL_PASSWORD 
  }
});