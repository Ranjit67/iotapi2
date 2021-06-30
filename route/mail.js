const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const nodemailer = require("nodemailer");

let transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sahooranjit519@gmail.com",
    pass: "Sahooranjit@7",
  },
});

const mailOption = {
  from: "sahooranjit519@gmail.com",
  to: "ranjitsahoo873@gmail.com",
  subject: "This one is the test message",
  text: "Hi welcome for register...",
};

router.get("/", async (req, res, next) => {
  try {
    const send = await transport.sendMail(mailOption);
    if (!send) createError.GatewayTimeout("mail is not send..");
    res.json({ data: "mail has send...." });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
