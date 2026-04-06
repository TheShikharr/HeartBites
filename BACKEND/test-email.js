import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function test() {
    try {
        console.log("Testing with USER:", process.env.EMAIL_USER);
        const info = await transporter.sendMail({
            from: `Test <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "Test email",
            text: "Hello World"
        });
        console.log("SUCCESS!", info.messageId);
    } catch (e) {
        console.error("FAIL:", e);
    }
}
test();
