import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

export const sendEmailOTP = async (email, otp) => {
    try {
        const info = await transporter.sendMail({
            from: `HeartBites <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "HeartBites — Email Verification OTP",
            html: `
                <h2>Welcome to HeartBites!</h2>
                <p>Your OTP is:</p>
                <h1 style="color:#7c3aed;">${otp}</h1>
                <p>Expires in 10 minutes</p>
            `
        })

        console.log("Email sent:", info.messageId)

    } catch (error) {
        console.error("Email error:", error)
        throw error
    }
}