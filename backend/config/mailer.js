import nodemailer from 'nodemailer'

const gmailUser = process.env.EMAIL_USER?.trim()
const gmailPassword = process.env.EMAIL_PASS?.replace(/\s+/g, '')
const hasSmtpCredentials = Boolean(gmailUser && gmailPassword)

const baseTimeouts = {
    pool: true,
    maxConnections: 5,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000
}

const smtpTransport = hasSmtpCredentials
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailPassword
        },
        ...baseTimeouts
    })
    : null

export const sendMail = async ({ to, subject, html }) => {
    if (!smtpTransport) {
        console.error('[Mailer] Gmail SMTP credentials are missing. Set EMAIL_USER and EMAIL_PASS.')
        return false
    }

    const mailOptions = {
        from: `"DocNest" <${gmailUser}>`,
        to,
        subject,
        html
    }

    try {
        const info = await smtpTransport.sendMail(mailOptions)
        console.log(`[Mailer] Email sent via SMTP to ${to} (${info?.messageId || 'no-message-id'})`)
        return true
    } catch (error) {
        console.error('[Mailer] Gmail SMTP send failed:', error.message)
        return false
    }
}

export default smtpTransport || null