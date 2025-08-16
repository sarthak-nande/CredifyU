import nodemailer from 'nodemailer';
import crypto from 'crypto';
import env from "dotenv"
import OTP from '../model/otp.js';

env.config();

// Create Gmail transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Store OTP in MongoDB with expiration (5 minutes)
const storeOTP = async (email, otp) => {
  try {
    // Remove any existing OTP for this email (with timeout)
    try {
      await OTP.deleteOne({ email: email.toLowerCase() }).maxTimeMS(5000);
    } catch (deleteError) {
      console.log('Note: Could not delete existing OTP, proceeding with new one:', deleteError.message);
    }
    
    // Create new OTP document
    const otpDoc = new OTP({
      email: email.toLowerCase(),
      otp,
      attempts: 0
    });
    
    await otpDoc.save();
    console.log(`OTP stored for ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error storing OTP:', error);
    throw new Error('Failed to store OTP');
  }
};

// Verify OTP using MongoDB
const verifyOTP = async (email, inputOtp) => {
  try {
    const otpDoc = await OTP.findValidOTP(email.toLowerCase());
    
    if (!otpDoc) {
      return { success: false, message: 'OTP not found or expired' };
    }
    
    if (otpDoc.attempts >= 3) {
      await OTP.deleteOne({ email: email.toLowerCase() });
      return { success: false, message: 'Too many failed attempts' };
    }
    
    if (otpDoc.otp !== inputOtp) {
      await otpDoc.incrementAttempts();
      return { success: false, message: `Invalid OTP. ${3 - (otpDoc.attempts)} attempts remaining.` };
    }
    
    // OTP verified successfully - remove from database
    await OTP.deleteOne({ email: email.toLowerCase() });
    return { success: true, message: 'OTP verified successfully' };
    
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'Verification failed' };
  }
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: {
      name: 'CredifyU',
      address: process.env.GMAIL_USER
    },
    to: email,
    subject: 'Your CredifyU OTP Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
          .otp { font-size: 32px; font-weight: bold; text-align: center; color: #000; background: #fff; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 CredifyU</h1>
            <p>Secure Digital Identity Verification</p>
          </div>
          
          <div class="content">
            <h2>OTP Verification Code</h2>
            <p>Hello,</p>
            <p>You have requested an OTP for verification. Please use the following code:</p>
            
            <div class="otp">${otp}</div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This OTP is valid for <strong>5 minutes</strong> only</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this OTP, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>
            <strong>CredifyU Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2024 CredifyU. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      CredifyU - OTP Verification
      
      Your OTP verification code is: ${otp}
      
      This code is valid for 5 minutes only.
      Do not share this code with anyone.
      
      If you didn't request this OTP, please ignore this email.
      
      Best regards,
      CredifyU Team
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Main function to send OTP
const sendOTP = async (email) => {
  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email address');
    }
    
    const otp = generateOTP();
    await storeOTP(email, otp);
    
    await sendOTPEmail(email, otp);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      email: email
    };
  } catch (error) {
    console.error('Error in sendOTP:', error);
    throw error;
  }
};

export { sendOTP, verifyOTP }; // Export functions for use in routes