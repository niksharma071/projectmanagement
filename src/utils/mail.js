import { text } from "express";
import Mailgen from "mailgen";
import nodemailer from "nodemailer"

const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://taskmanagelink.com",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

  const emailHtml = mailGenerator.generate(options.mailgenContent);
  
  
  
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: "mail.taskmanager@example.com",
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error(
      "Email service failed siliently. Make sure that you have provided your MAILTRAP credentials in the .env file",
    );
    console.error("Error: ", error);
  }
};

const emailverificationcontent = (username,verificationurl)=>{
    return{
        body: {
        name: username,
        intro: "welcome to our app we are excited to have you onboard",
        action: {
            instructions: "to verify you email please click on the following button",
            button: {
                color: "#1aae5aff",
                text: "verify your account",
                link: verificationurl
            }
        },
        outro: "need help, or have questions just contact us",
        }, 
    }
}

const forgotpasswordcontent = (username,verificationurl)=>{
    return{
        body: {
        name: username,
        intro: "we got a request to reset the password of your account",
        action: {
            instructions: "to reset the password click on the below link",
            button: {
                color: "rgb(157, 26, 26)",
                text: "reset your password",
                link: verificationurl,
            }
        },
        outro: "need help, or have questions just contact us",
        }, 
    }
}

export {forgotpasswordcontent, emailverificationcontent, sendEmail}