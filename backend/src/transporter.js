const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
  service:'gmail',
  auth: {
    user: 'dimitar.damyanov.0305@gmail.com',
    pass: 'g+Account' 
  }
});