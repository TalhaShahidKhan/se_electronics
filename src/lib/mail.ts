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
    to?: string,
    subject: string,
    text: string
}) {
    try {
        if (process.env.NODE_ENV === 'production') {
            const { from, to, subject, text } = mailData
            await transporter.sendMail({
                from,
                to: to || process.env.RECIP_EMAIL,
                subject,
                text
            })
        } else {
            console.log(`
            [Email Service]
            From: ${mailData.from}
            To: ${mailData.to || process.env.RECIP_EMAIL}
            Subject: ${mailData.subject}
            Text: ${mailData.text}
            `);
        }
    } catch (error) {
        console.error(error)
    }
}