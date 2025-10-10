import nodemailer from 'nodemailer'
import { otpTemplate } from '../views/OTPTemplate.js'

export default async function sendMail(email, otp) {

    const DS_EMAIL = process.env.DS_EMAIL
    const DS_PASS = process.env.DS_PASS

    const transporter = nodemailer.createTransport({

        service: 'gmail',
        auth: {
            user: DS_EMAIL,
            pass: DS_PASS
        }
    })
    
    await transporter.sendMail({
        from: `"DSCart" <${DS_EMAIL}>`,
        to: email,
        subject: "Your DSCart OTP Code",
        html: otpTemplate(otp),
    });
}