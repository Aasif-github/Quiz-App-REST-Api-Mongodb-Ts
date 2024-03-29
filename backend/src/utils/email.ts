import nodemailer from "nodemailer";

import ProjectError from "../helper/error";

const sendEmail = async (
  email: string,
  subject: string,
  text: string
): Promise<any> => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user:"johndeo8789@gmail.com",
        pass: "qtxe hejs gjtg spul",
      },
    });

    const emailSent = await transporter.sendMail({
      from: "johndeo8789@gmail.com",
      to: email,
      subject: subject,
      text: text,
    });
    console.log("message sent: %s", emailSent.messageId);
  } catch (error) {
    console.log(error);
    
    const err = new ProjectError("email not sent---");
    err.statusCode = 401;
    throw err;
  }
};

export default sendEmail;
