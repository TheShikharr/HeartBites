import { Resend } from "resend"
import dotenv from "dotenv"

dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmailOTP = async (email, otp) => {
    await resend.emails.send({
        from: "HeartBites <onboarding@resend.dev>",
        to: email,
        subject: "HeartBites — Email Verification OTP",
        html: `
            <h2>Welcome to HeartBites! </h2>
            <p>Your OTP for email verification is:</p>
            <h1 style="color: #7c3aed; font-size: 40px; letter-spacing: 5px">
                ${otp}
            </h1>
            <p>This OTP will expire in <b>10 minutes</b>.</p>
            <p>If you did not create an account, please ignore this email.</p>
        `
    })
}