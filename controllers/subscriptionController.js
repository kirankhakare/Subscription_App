const nodemailer = require("nodemailer");
require("dotenv").config();

exports.sendSubscriptionEmail = async (req, res) => {
  try {
    const { name, contact, email, plan } = req.body;

    // Validation check
    if (!name || !contact || !email || !plan) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,    // use uppercase for clarity
        pass: process.env.APP_PASS, // Gmail App Password
      },
    });

    // Mail options
    const mailOptions = {
      from: `"Subscription Portal" <${process.env.EMAIL}>`,
      to: process.env.ADMIN_EMAIL, // admin email stored in .env
      subject: "🧾 New Subadmin Subscription Request",
      html: `
        <h2>📢 New Subscription Request</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Contact:</b> ${contact}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Selected Plan:</b> ${plan}</p>
        <br/>
        <p>Kindly review this request and respond accordingly.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Subscription request sent successfully " });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ message: "Failed to send email. Please try again later." });
  }
};
