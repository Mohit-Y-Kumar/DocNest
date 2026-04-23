import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

export const sendMail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            from: `"DocNest" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        })
        console.log(`[Mailer] Email sent to ${to}`)
    } catch (error) {
        console.error('[Mailer] Error:', error.message)
    }
}

export default transporter