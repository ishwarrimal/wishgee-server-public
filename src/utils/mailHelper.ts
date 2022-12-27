import * as nodemailer from 'nodemailer';
import { MailTemplate } from './mailTemplates';

const getMailData = (emailData) => {
  return {
      from: '"WishGee" <contact@wishgee.com>',  // sender address
      to: emailData.useEmail,   // list of receivers
      subject: emailData.type === MailType.wishSubmit ? 'New Wish' : 'Wish Granted',
      text: 'Wish created successfully!',
      html: MailTemplate(emailData)
    }
} ;

const MailHelper = async (emailData) => {
    const transporter = nodemailer.createTransport({
        host: 'smtppro.zoho.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASSWORD
        }
    });
    const data = getMailData(emailData);

      let info = await transporter.sendMail(data,(err,res) => {
        if(err){
          console.log('Error sending email ------------------ ',err)
        }else{
          console.log(JSON.stringify(res))
        }
      });
}

export const MailType = {
  wishSubmit: 1,
  userCreated: 2,
  wishResolved: 3,

}

export default MailHelper;