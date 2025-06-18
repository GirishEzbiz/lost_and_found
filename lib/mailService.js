import nodemailer from "nodemailer";
import logger from "./logger";

const sendMail = async ({ to, subject, text, html, meta, otp }) => {
  const startTime = Date.now();

  try {


    // Create transporter

    const toFormatted = Array.isArray(to) ? to.join(",") : to;

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, // Amazon SES SMTP host
      port: 587, // SMTP port (587 for TLS)
      secure: false, // false for TLS (use true for SSL with port 465)
      auth: {
        user: process.env.MAIL_USER, // SES SMTP username
        pass: process.env.MAIL_PASS, // SES SMTP password
      },
    });

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Your verified email in SES
      to: toFormatted, // Recipient email address
      subject, // Email subject
      text, // Plain text content
      html, // HTML content (optional)
    };

    // Send mail
    await transporter.sendMail(mailOptions);
    // Calculate the duration
    const duration = Date.now() - startTime;

    // Log the successful email activity
    const logData = {
      action: meta?.action ,
      channel: "email",
      type: meta?.type,
      message: text || otp || "No message content",
      status: "success",
      duration, // In milliseconds
    };

    // Send log data to your logging API
    await fetch(`${process.env.BASE_URL}/api/admin/email-whatsapp-delivery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),  // JSON data ko stringify karna zaroori hai
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();  // Response ko JSON format mein convert karna
      })
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    return { success: true, message: "Email sent successfully" };


  } catch (error) {
    const duration = Date.now() - startTime;

    // Log the failed email activity
    const logData = {
      action: meta?.action || "Email Failed",
      channel: "email",
      type: meta?.type || "General",
      message: error.message || "Error sending email",
      status: "failed",
      duration, // In milliseconds
    };

    await fetch(`${process.env.BASE_URL}/api/admin/email-whatsapp-delivery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),  // JSON data ko stringify karna zaroori hai
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();  // Response ko JSON format mein convert karna
      })
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });



    logger.error({
      message: "Error sending email",
      stack: error.stack,
      function: "sendEmail",
    });
    return { success: false, message: "Failed to send email." }; // Avoid exposing internal errors
  }
};

export default sendMail;
