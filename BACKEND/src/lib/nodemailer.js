import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,              // ✅ use 587 instead of 465
    secure: false,          // ✅ false for port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
})

export const sendEmailOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "HeartBites — Email Verification OTP",
        html: `
            <h2>Welcome to HeartBites! </h2>
            <p>Your OTP for email verification is:</p>
            <h1 style="color: #7c3aed; font-size: 40px; letter-spacing: 5px">${otp}</h1>
            <p>This OTP will expire in <b>10 minutes</b>.</p>
            <p>If you did not create an account, please ignore this email.</p>
        `
    }

    await transporter.sendMail(mailOptions)
}