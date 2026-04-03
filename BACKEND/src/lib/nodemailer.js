import nodemailer from "nodemailer"

export const Transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

export const sendEmailOTP = async(email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        html: `
            <h2>Welcome to HeartBites</h2>
            <p>OTP for email verification</p>
            <h1 style="color: #e74c3c; font-size: 40px; letter-spacing: 5px">${otp}</h1>
            <p>This OTP will expire in <b>10 minutes</b>.</p>
            <p>If you did not create an account, please ignore this email.</p>
        `
    }
    await Transporter.sendMail(mailOptions)
}