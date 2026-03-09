import 'server-only'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_APP_PASS
    }
})

export default async function sendEmail(mailData: {
    from: string,
    subject: string,
    text: string
}) {
    try {
        if (process.env.NODE_ENV === 'production') {
            const { from, subject, text } = mailData
            await transporter.sendMail({
                from,
                to: process.env.RECIP_EMAIL,
                subject,
                text
            })
        } else {
            console.log(`
            [Email Service]
            From: ${mailData.from}
            Subject: ${mailData.subject}
            Text: ${mailData.text}
            `);
        }
    } catch (error) {
        console.error(error)
    }
}