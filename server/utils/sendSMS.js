const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const sendSMS = async function ({ recipient, msgBody }) {
  const message = await client.messages.create({
    body: msgBody,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: recipient,
  });

  console.log(message);
};

module.exports = sendSMS;
