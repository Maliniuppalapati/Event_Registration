const nodemailer = require('nodemailer');

const sendConfirmationEmail = async ({ userEmail, userName, eventTitle, eventDate, eventLocation, tickets, qrCode }) => {
    try {
        // NOTE: You must provide valid EMAIL_USER and EMAIL_PASS in your .env file
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('Skipping email. EMAIL_USER or EMAIL_PASS not defined in .env');
            return;
        }
 const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

        const mailOptions = {
            from: `"College Events Team" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Ticket Confirmation: ${eventTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #4CAF50;">Booking Confirmed!</h2>
                    <p>Hi <b>${userName}</b>,</p>
                    <p>You have successfully registered for <b>${eventTitle}</b>.</p>
                    <p><b>Date:</b> ${new Date(eventDate).toDateString()}</p>
                    <p><b>Location:</b> ${eventLocation}</p>
                    <p><b>Tickets:</b> ${tickets}</p>
                    <hr/>
                    <p>Please present the QR Code below at the entrance:</p>
                    <img src="cid:qrcode" alt="Your Ticket QR Code" style="width:200px; height:200px; border: 2px solid #ccc; border-radius: 10px;"/>
                    <p style="margin-top:20px; font-size:12px; color:gray;">Thank you for using College Events Platform.</p>
                </div>
            `,
            attachments: [
                {
                    filename: 'qrcode.png',
                    path: qrCode,
                    cid: 'qrcode'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${userEmail}`);
    } catch (error) {
        console.error("Failed to send email:", error);
        try {
            const fs = require('fs');
            const path = require('path');
            const logMessage = `[${new Date().toISOString()}] Failed to send to ${userEmail}: ${error.message}\n${error.stack}\n\n`;
            fs.appendFileSync(path.join(__dirname, '../email-errors.log'), logMessage);
        } catch (logErr) {
            console.error("Failed to write to log file:", logErr);
        }
    }
};

module.exports = { sendConfirmationEmail };
