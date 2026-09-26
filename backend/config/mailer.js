const brevoApiKey = process.env.BREVO_API_KEY?.trim()
const senderEmail = process.env.EMAIL_FROM?.trim()
const senderName = process.env.EMAIL_FROM_NAME?.trim() || 'DocNest'
const hasBrevoCredentials = Boolean(brevoApiKey && senderEmail)
const brevoEndpoint = 'https://api.brevo.com/v3/smtp/email'

export const sendMail = async ({ to, subject, html }) => {
    if (!hasBrevoCredentials) {
        console.error('[Mailer] Brevo credentials are missing. Set BREVO_API_KEY and EMAIL_FROM.')
        return false
    }

    const payload = {
        sender: {
            name: senderName,
            email: senderEmail
        },
        to: [{ email: to }],
        subject,
        htmlContent: html
    }

    try {
        const response = await fetch(brevoEndpoint, {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'api-key': brevoApiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const errorBody = await response.text()
            console.error(`[Mailer] Brevo send failed (${response.status}): ${errorBody}`)
            return false
        }

        const result = await response.json()
        console.log(`[Mailer] Email sent via Brevo to ${to} (${result.messageId || 'no-message-id'})`)
        return true
    } catch (error) {
        console.error('[Mailer] Brevo request failed:', error.message)
        return false
    }
}

export default hasBrevoCredentials ? { endpoint: brevoEndpoint } : null