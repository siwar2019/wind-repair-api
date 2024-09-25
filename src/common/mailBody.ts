import { EmailBody } from '../interfaces/emailBody'

export const mailBodyForAddPartner = (data: EmailBody) => {
    return ` <!DOCTYPE html>
<html>
<head>
</head>
<body>
<p>Hello ${data.name},</p>
<p>Thank you for signing up with our website \n</p>
<p>this is your email : ${data.email} and password : ${data.password} \n</p>
</body>
</html>
`
}

export const mailBodyForActivePartner = (data: EmailBody) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div>
        <p>Hello ${data.name},</p>
        <p>Your account has been set as active.</p>
        <p>You can log in using your credentials that were sent to you in the previous email.</p>
    </div>
</body>
</html>`
}

export const mailBodyForResetPassword = (data: EmailBody) => {
    return ` <!DOCTYPE html>
      <html>
      <head>
      </head>
      <body>
      <p>Hello ${data.name},</p>
      <h3>You requested for password reset</h3>
      <h4>Click on this button <a href="${data.link}"><button>Reset</button></a> to reset password.</h4>
      </body>
      </html>
      `
}
