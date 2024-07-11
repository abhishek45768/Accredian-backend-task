const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client'); // Database client
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

// Initialize Prisma Client
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Simplified CORS configuration for testing
const corsOptions = {
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parser middleware
app.use(bodyParser.json());

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to validate referral data
const validateReferralData = (data) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail } = data;
  return referrerName && referrerEmail && refereeName && refereeEmail;
};

// Function to handle form submission, store data, and send email
const createAndStoreData = async (req, res) => {
  try {
    const isValid = validateReferralData(req.body);
    if (!isValid) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Commented out: Store data in database
    /*
    const newData = await prisma.referral.create({
      data: {
        referrerName: req.body.referrerName,
        referrerEmail: req.body.referrerEmail,
        refereeName: req.body.refereeName,
        refereeEmail: req.body.refereeEmail,
      },
    });
    */

    // Construct the referral link (modify this link according to your needs)
    const referralLink = `https://abhishek-refer-and-earn-page.netlify.app`;

    // Send email to referee
    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.refereeEmail,
      subject: 'You Have Been Referred!',
      text: `Dear ${req.body.refereeName},

Your friend ${req.body.referrerName} has referred you to join our platform and earn rewards!

Sign up using the following link to get started and claim your referral bonus:

${referralLink}

Don't miss out on this opportunity to earn rewards by joining our community.

Best regards,
Abhishek`,
    };

    await transporter.sendMail(mailOptions);

    // Log success and return data
    console.log('Email sent:', req.body);
    res.status(201).json({ message: 'Referral email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Error sending email.', message: error.message });
  }
};

// Route to handle form submission
app.post('/api/create-data', createAndStoreData);

// Test route
app.get('/', (req, res) => {
  res.status(200).json({ msg: "Server is running and accepting requests." });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
